import * as fs from 'fs';
import * as path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FileObject } from '@supabase/storage-js/src/lib/types';
import { Database } from './schema';
import { execSync } from 'child_process';
import { FileMetadata, getFileMetadata } from './filemeta';
import * as errorout from './errorout';

type FileEntry = Database['public']['Tables']['files']['Row'];
type FilePatch = Database['public']['Tables']['files']['Update'];
type FileCreate = Database['public']['Tables']['files']['Insert'];

var importDir = "./import";

const scanInterval = 1000;

const runningFiles: Set<string> = new Set<string>();
const aborts: Set<string> = new Set<string>();

var supabaseClient: SupabaseClient | undefined;
var storageBucketName = "";
var thumbsBucketName = "";

const thumbnailWidth = 640;

function checkFileAborted(path: string, reject: (reason?: any) => void): boolean {
    if (aborts.has(path)) {
        reject(`File ${path} aborted`);
        return true;
    }
    return false;
}

async function getStorageRow(filename: string): Promise<{ data: FileObject | null, error: null; } | { data: null, error: any; }> {
    if (!supabaseClient) return { data: null, error: "supabaseClient is not set" };

    const { data: existingStorageResult, error: existingStorageError } = await supabaseClient.storage.from(storageBucketName).list(undefined, {
        search: filename
    });
    if (existingStorageError != undefined) {
        return { data: null, error: existingStorageError };
    }
    if (existingStorageResult.length != 1) {
        return { data: null, error: `received ${existingStorageResult.length} rows, expected 1` };
    }

    return { data: existingStorageResult[0], error: null };
}

// checkFileEntryForExisting will check if a row already exists in the files table
// If it does, we will just update it, and if it doesn't, we'll create a new entry.
async function checkFileEntryForExisting(path: string, storageID: string, fileMetadata: FileMetadata) {
    if (!supabaseClient) throw new Error("supabaseClient is undefined");

    // Get file entry for this storage row
    const { data: existingFileResult, error: existingFileError } = await supabaseClient.from("files").select("*").eq("storageID", storageID).maybeSingle();
    if (existingFileError) {
        throw new Error(`Failed to get existing file entry: ${existingFileError}`);
    }
    console.log(`Existing file row: ${JSON.stringify(existingFileResult)}`);
    if (existingFileResult != null) {
        // If file entry exists and md5sum conflicts: ret error
        if (existingFileResult["md5sum"] != "" && existingFileResult["md5sum"] != fileMetadata.md5sum) {
            throw new Error(`md5sum '${fileMetadata.md5sum}' of new file does not match existing md5sum '${existingFileResult["md5sum"]}'in Files table`);
        }
        // Set md5sum and mime type just to be sure
        const filePatch: FilePatch = {
            id: existingFileResult["id"],
            md5sum: fileMetadata.md5sum,
            mimeType: fileMetadata.mimeType,
        };
        // If file entry exists: just make sure md5sum is up to date and any other base metadata we care about
        const { error: patchError } = await supabaseClient.from("files").update(filePatch);
        if (patchError) {
            throw new Error(`Failed to patch existing file entry: ${patchError}`);
        }
    } else {
        // If file entry DNE: insert row
        const newFileEntry: FileCreate = {
            storageID: storageID,
            md5sum: fileMetadata.md5sum,
            mimeType: fileMetadata.mimeType,
            hasBeenTagged: false,
            filename: path
        };
        const { error: createError } = await supabaseClient.from("files").insert(newFileEntry);
        if (createError) {
            throw new Error(`Failed to create new file entry: ${createError}`);
        }
    }
}

// tryGenerateThumbnail will attempt to generate a thumbnail for the given file, catching all errors and printing
// as thumbnails failing is a non-fatal operation
async function tryGenerateThumbnail(storageID: string, basePath: string, fullPath: string, fileMetadata: FileMetadata) {
    if (!supabaseClient) throw new Error("supabaseClient is undefined");

    // Generate thumbnail
    const thumbPath = `/tmp/shinythumb-${basePath}.png`;
    try {
        if (storageID == undefined) {
            throw new Error("storageID is somehow undefined (should never happen)");
        }

        execSync(generateFfmpegCommand(fullPath, thumbPath, fileMetadata.mimeType != undefined && fileMetadata.mimeType.startsWith("video"), thumbnailWidth));

        const thumbContents = fs.readFileSync(thumbPath);

        // Upload thumbnail
        const { error: uploadError } = await supabaseClient.storage.from(thumbsBucketName).upload(storageID, thumbContents);
        if (uploadError) {
            throw uploadError;
        }
    } catch (e: any) {
        if (e as Error && !e.message.includes("already exists")) {
            console.error(`Failed to create thumbnail for file '${basePath}', continuing: ${e}`);
        }
    }
}

function doImport(basePath: string) {
    // Run import and at each step, check aborts (throw if aborted, include rollback behavior)
    return new Promise<void>(async (resolve, reject) => {
        try {
            if (!supabaseClient) {
                reject("Supabase client is not initialized");
                return;
            }

            // Do the import, check aborts map at each step
            const filepath = path.join(importDir, basePath);
            const fileContents = fs.readFileSync(filepath);

            // Uncomment below if we change how we read files (if we add an await)
            // if (checkFileAborted(basePath, reject)) return;

            const { md5sum, mimeType } = await getFileMetadata(filepath);
            var storageID: string | undefined = undefined;

            if (checkFileAborted(basePath, reject)) return;

            // Try to upload
            const { data: uploadResult, error: uploadError } = await supabaseClient.storage.from(storageBucketName).upload(basePath, fileContents);
            if (uploadError) {
                // If error and error not "already exists": ret error
                if (!uploadError.message.includes("already exists")) {
                    reject(`Failed to upload file to supabase storage: ${uploadError.message}`);
                    return;
                }

                if (checkFileAborted(basePath, reject)) return;

                // Error is "already exists":
                // Get existing storage row entry
                const { data: existingStorageResult, error: existingStorageError } = await getStorageRow(basePath);
                if (existingStorageError != undefined) {
                    reject(`Failed to get existing storage entry: ${existingStorageError.message}`);
                    return;
                }
                if (!existingStorageResult) {
                    reject(`Failed to get existing storage entry: not found`);
                    return;
                }
                storageID = existingStorageResult.id;

                if (checkFileAborted(basePath, reject)) return;

                await checkFileEntryForExisting(basePath, storageID, { md5sum, mimeType });
            } else {
                // Get newly created storage row entry
                const { data: newStorageResult, error: newStorageError } = await getStorageRow(uploadResult.path);
                if (newStorageError) {
                    reject(`Failed to get newly created storage entry: ${newStorageError}`);
                    return;
                }
                if (!newStorageResult) {
                    reject(`Failed to get newly created storage entry: not found`);
                    return;
                }

                storageID = newStorageResult.id;
                // If no error:
                //   Create file entry
                const newFileEntry: FileCreate = {
                    storageID: newStorageResult.id,
                    md5sum: md5sum,
                    mimeType: mimeType,
                    hasBeenTagged: false,
                    filename: basePath
                };
                const { error: createError } = await supabaseClient.from("files").insert(newFileEntry);
                if (createError) {
                    reject(`Failed to create new file entry: ${createError}`);
                    return;
                }
            }

            await tryGenerateThumbnail(storageID, basePath, filepath, { md5sum, mimeType });

            // Remove local file
            fs.rmSync(filepath);
        } catch (e: any) {
            reject(`Failed to import file: ${e}`);
        }


        resolve();
    });
}

function generateFfmpegCommand(inputPath: string, outputPath: string, isVideo: boolean, targetWidth: number): string {
    // -i: Input file (can be either an image or a video. If video, specify the starting frame)
    // -ss: Seek to the specified time (in seconds) in the input file
    // -vframes: Number of frames to extract
    // -vf: Video filter to use (scale)
    const args = ["ffmpeg", "-y", "-i", `'${inputPath}'`, "-vframes", "1", "-vf", `scale=${targetWidth}:-1`];
    if (isVideo) {
        args.push("-ss", "00:00:00");
    }
    args.push(`'${outputPath}'`);
    return args.join(" ");
}

function checkSizeMatch(filepath: string, lastSize: number, resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void) {
    try {
        const stats = fs.statSync(filepath);
        console.log(`Old size for file ${filepath} is ${lastSize}, is now ${stats.size}`);
        if (stats.size == lastSize) {
            resolve();
            return;
        }
        setTimeout(() => {
            checkSizeMatch(filepath, stats.size, resolve, reject);
        }, scanInterval);
    } catch (e) {
        reject(`Failed to get stats for file: ${e}`);
        return;
    }
}

function debounceFileSize(basePath: string) {
    const filepath = path.join(importDir, basePath);

    return new Promise<void>((resolve, reject) => {
        // Check the file over and over, until either we error (reject) or the file size stays the same two checks in a row
        setTimeout(() => {
            console.log(`Doing initial debounce check for ${basePath}`);
            checkSizeMatch(filepath, 0, resolve, reject);
        }, scanInterval);
    });
}

function fileAdded(basePath: string) {
    // Ignore the error output file
    // Ignore hidden files
    if (basePath.endsWith(errorout.errorsFile) || path.basename(basePath).startsWith(".")) {
        return;
    }
    if (!runningFiles.has(basePath)) {
        // Wait for the file size to steady out first, then upload it
        debounceFileSize(basePath).then(_ => {
            doImport(basePath).then(_ => {
                // Success: remove from promises
                console.info(`File import for '${basePath}' promise success!`);
                aborts.delete(basePath);
                runningFiles.delete(basePath);
                errorout.clearErrorForFileAndWrite(importDir, basePath);
            }, (reason: any) => {
                // Rejected: console log or something
                console.error(`File import promise rejected: ${reason}`);
                aborts.delete(basePath);
                runningFiles.delete(basePath);
                errorout.setErrorForFileAndWrite(importDir, basePath, reason);
                setTimeout(() => {
                    fileAdded(basePath); // Enqueue another run of this file to retry
                }, 1000);
            });
        }, reason => {
            console.error(`Failed to debounce file size for file '${basePath}': ${reason}`);
        });

        runningFiles.add(basePath);
    }
}

function fileRemoved(basePath: string) {
    if (basePath.endsWith(errorout.errorsFile)) {
        return;
    }
    // If no promise for this file, do nothing (means it already finished)
    errorout.clearErrorForFileAndWrite(importDir, basePath);
    if (!runningFiles.has(basePath)) {
        return;
    }

    // Add to aborts
    aborts.add(basePath);
}

function parseEnvVars(): boolean {
    const address = process.env["SUPABASE_ADDRESS"];
    if (!address || address.length == 0) {
        console.error("SUPABASE_ADDRESS is required");
        return false;
    }

    const key = process.env["SUPABASE_KEY"];
    if (!key || key.length == 0) {
        console.error("SUPABASE_KEY is required");
        return false;
    }

    const bn = process.env["BUCKET_NAME"];
    if (!bn || bn.length == 0) {
        console.error("BUCKET_NAME is required");
        return false;
    }
    storageBucketName = bn;

    const tbn = process.env["THUMBS_BUCKET_NAME"];
    if (!tbn || tbn.length == 0) {
        console.error("THUMBS_BUCKET_NAME is required");
        return false;
    }
    thumbsBucketName = tbn;

    const id = process.env["IMPORT_DIRECTORY"];
    if (!id || id.length == 0) {
        console.error("IMPORT_DIRECTORY is required");
        return false;
    }
    importDir = id;

    // Create a single supabase client for interacting with your database
    const supabase = createClient(address, key);

    supabaseClient = supabase;

    return true;
}

function main() {
    if (!parseEnvVars()) {
        return;
    }
    console.debug("Env vars parsed successfully");

    // Create the import directory if it doesn't exist
    fs.mkdirSync(importDir, { recursive: true });

    fs.readdir(importDir, undefined, (err, files) => {
        if (err) {
            console.error(`Failed to list files at program start (continuing, but may miss existing files): ${err}`);
            return;
        }
        if (files.length == 0) {
            console.debug("No files found in import directory at start");
            return;
        }
        files.forEach(fileAdded);
        console.log(`Added files found in import directory at start: ${files.join(", ")}`);
    });

    fs.watch(importDir, (type, filename) => {
        if (type == 'change') {
            return; // We don't care about content changes, just new (or removed) files
        }
        const filepath = path.join(importDir, filename);
        if (fs.existsSync(filepath)) {
            fileAdded(filename);
        } else {
            fileRemoved(filename);
        }
    });
    console.log("Successfully started fs watch");
}

main();