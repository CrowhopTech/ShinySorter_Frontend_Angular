import * as fs from 'fs';
import * as path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { FileObject } from '@supabase/storage-js/src/lib/types'
import { Database } from './schema'
import md5File from 'md5-file';

type FileEntry = Database['public']['Tables']['files']['Row']
type FilePatch = Database['public']['Tables']['files']['Update']
type FileCreate = Database['public']['Tables']['files']['Insert']

const importDir = "./import"

const scanInterval = 1000;

const runningFiles: Set<string> = new Set<string>();
const aborts: Set<string> = new Set<string>();

var supabaseClient: SupabaseClient | undefined;
const storageBucketName = "test-bucket"

const timer = (ms: number) => new Promise(res => setTimeout(res, ms));

function checkFileAborted(path: string, reject: (reason?: any) => void): boolean {
    if (aborts.has(path)) {
        reject(`File ${path} aborted`)
        return true
    }
    return false
}

async function getStorageRow(filename: string): Promise<{ data: FileObject, error: null } | { data: null, error: any }> {
    if (!supabaseClient) return { data: null, error: "supabaseClient is not set" }

    const { data: existingStorageResult, error: existingStorageError } = await supabaseClient.storage.from(storageBucketName).list(undefined, {
        search: filename
    })
    if (existingStorageError) {
        return { data: null, error: existingStorageError }
    }
    if (existingStorageResult.length != 1) {
        return { data: null, error: `received ${existingStorageResult.length} rows, expected 1` }
    }

    return { data: existingStorageResult[0], error: null }
}

function doImport(basePath: string) {
    // Run import and at each step, check aborts (throw if aborted, include rollback behavior)
    return new Promise<void>(async (resolve, reject) => {
        if (!supabaseClient) return;

        // Do the import, check aborts map at each step
        const filepath = path.join(importDir, basePath);
        const fileContents = fs.readFileSync(filepath)

        // Uncomment below if we change how we read files (if we add an await)
        // if (checkFileAborted(basePath, reject)) return;

        // Get file md5sum
        const md5sum = await md5File(filepath)

        if (checkFileAborted(basePath, reject)) return;

        // Try to upload
        const { data: uploadResult, error: uploadError } = await supabaseClient.storage.from(storageBucketName).upload(basePath, fileContents)
        if (uploadError) {
            // If error and error not "already exists": ret error
            if (!uploadError.message.includes("already exists")) {
                reject(`Failed to upload file to supabase storage: ${uploadError.message}`)
                return
            }

            if (checkFileAborted(basePath, reject)) return;

            // Error is "already exists":
            // Get existing storage row entry
            const { data: existingStorageResult, error: existingStorageError } = await getStorageRow(basePath)
            if (existingStorageError) {
                reject(`Failed to get existing storage entry: ${existingStorageError.message}`)
                return
            }
            if (!existingStorageResult) {
                reject(`Failed to get existing storage entry: not found`)
                return
            }

            if (checkFileAborted(basePath, reject)) return;

            // Get file entry for this storage row
            const { data: existingFileResult, error: existingFileError } = await supabaseClient.from("files").select("*").eq("storageID", existingStorageResult.id).maybeSingle()
            if (existingFileError) {
                reject(`Failed to get existing file entry: ${existingFileError.message}`)
                return
            }
            console.log(`Existing file row: ${JSON.stringify(existingFileResult)}`)
            if (existingFileResult != null) {
                // If file entry exists and md5sum conflicts: ret error
                if (existingFileResult["md5sum"] != "" && existingFileResult["md5sum"] != md5sum) {
                    reject(`md5sum '${md5sum}' of new file does not match existing md5sum '${existingFileResult["md5sum"]}'in Files table`)
                    return
                }
                // Set md5sum just to be sure
                const filePatch: FilePatch = {
                    id: existingFileResult["id"],
                    md5sum: md5sum
                }
                // If file entry exists: just make sure md5sum is up to date and any other base metadata we care about
                const { error: patchError } = await supabaseClient.from("files").update(filePatch)
                if (patchError) {
                    reject(`Failed to patch existing file entry: ${patchError.message}`)
                    return
                }
            } else {
                // If file entry DNE: insert row
                const newFileEntry: FileCreate = {
                    storageID: existingStorageResult.id,
                    md5sum: md5sum,
                    hasBeenTagged: false
                }
                const { error: createError } = await supabaseClient.from("files").insert(newFileEntry)
                if (createError) {
                    reject(`Failed to create new file entry: ${createError.message}`)
                    return
                }
            }
        } else {
            // Get newly created storage row entry
            const { data: newStorageResult, error: newStorageError } = await getStorageRow(uploadResult.path)
            if (newStorageError) {
                reject(`Failed to get newly created storage entry: ${newStorageError.message}`)
                return
            }
            if (!newStorageResult) {
                reject(`Failed to get newly created storage entry: not found`)
                return
            }
            // If no error:
            //   Create file entry
            const newFileEntry: FileCreate = {
                storageID: newStorageResult.id,
                md5sum: md5sum,
                hasBeenTagged: false
            }
            const { error: createError } = await supabaseClient.from("files").insert(newFileEntry)
            if (createError) {
                reject(`Failed to create new file entry: ${createError.message}`)
                return
            }
        }

        // Remove local file
        fs.rmSync(filepath)

        resolve();
    })
}

function checkSizeMatch(filepath: string, lastSize: number, resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void) {
    try {
        const stats = fs.statSync(filepath);
        console.log(`Old size for file ${filepath} is ${lastSize}, is now ${stats.size}`)
        if (stats.size == lastSize) {
            resolve()
            return
        }
        setTimeout(() => {
            checkSizeMatch(filepath, stats.size, resolve, reject)
        }, scanInterval)
    } catch (e) {
        reject(`Failed to get stats for file: ${e}`)
        return
    }
}

function debounceFileSize(basePath: string) {
    const filepath = path.join(importDir, basePath);

    return new Promise<void>((resolve, reject) => {
        // Check the file over and over, until either we error (reject) or the file size stays the same two checks in a row
        setTimeout(() => {
            console.log(`Doing initial debounce check for ${basePath}`);
            checkSizeMatch(filepath, 0, resolve, reject);
        }, scanInterval)
    })
}

function fileAdded(basePath: string) {
    if (!runningFiles.has(basePath)) {
        // Wait for the file size to steady out first, then upload it
        debounceFileSize(basePath).then(_ => {
            doImport(basePath).then(_ => {
                // Success: remove from promises
                console.info(`File import for '${basePath}' promise success!`)
            }, (reason: any) => {
                // Rejected: console log or something
                console.error(`File import promise rejected: ${reason}`)
            }).finally(() => {
                // Remove from promises and aborts in finally
                aborts.delete(basePath)
                runningFiles.delete(basePath)
            })
        }, reason => {
            console.error(`Failed to debounce file size for file '${basePath}': ${reason}`)
        })

        runningFiles.add(basePath)
    }
}

function fileRemoved(path: string) {
    // If no promise for this file, do nothing (means it already finished)
    if (!runningFiles.has(path)) {
        return
    }

    // Add to aborts
    aborts.add(path)
}

function main() {
    // Create a single supabase client for interacting with your database
    const anonKey = process.env["SUPABASE_ANON_KEY"]
    if (!anonKey) {
        console.error("SUPABASE_ANON_KEY is required")
        return
    }
    const supabase = createClient('http://192.168.1.4:8000', anonKey)

    supabaseClient = supabase;

    // Create the import directory if it doesn't exist
    fs.mkdirSync(importDir, { recursive: true });

    fs.readdir(importDir, undefined, (err, files) => {
        if (err) {
            console.error(`Failed to list files at program start (continuing, but may miss existing files): ${err}`)
            return
        }
        files.forEach(fileAdded)
    })

    fs.watch(importDir, (type, filename) => {
        if (type == 'change') {
            return; // We don't care about content changes, just new (or removed) files
        }
        const filepath = path.join(importDir, filename);
        if (fs.existsSync(filepath)) {
            fileAdded(filename)
        } else {
            fileRemoved(filename)
        }
    })
}

main();