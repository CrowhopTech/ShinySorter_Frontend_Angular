import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FileSaverService } from 'ngx-filesaver';
import { AppService } from './app.service';
import { SupabaseService, Tag, TaggedFileEntry } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class APIUtilityService {
  tagsMap?: Map<number, string>
  tagsFetchError?: string

  constructor(private appConfig: AppService, private http: HttpClient, private fileSaver: FileSaverService, private supaService: SupabaseService) {
    this.updateTagCache()
  }

  // ===== Tag Cache
  public async updateTagCache() {
    this.tagsMap = undefined
    this.tagsFetchError = undefined
    const { data, error } = await this.supaService.listTags()
    if (error) {
      throw error
    }
    const tags = data as Tag[]
    if (tags) {
      this.tagsMap = new Map<number, string>();
      tags.forEach(tag => { if (tag.id && tag.name) { this.tagsMap?.set(tag.id, tag.name) } })
    }
  }

  public getTagName(tagID: (number | undefined | null)): string | undefined {
    if (!this.tagsMap || !tagID) {
      return undefined
    }
    return this.tagsMap.get(tagID)
  }

  // ===== File Contents

  public getFileContentsAddress(fileName: string, fileID?: number): string {
    if (!fileID) {
      return ""
    }
    return `${this.appConfig.settings?.contentServerAddress}/${fileName}`
  }

  public getFileThumbAddress(fileName: string, fileID?: number): string {
    if (!fileID) {
      return ""
    }
    if (!this.appConfig.settings) {
      return ""
    }
    return `${this.appConfig.settings?.contentServerAddress}/thumbs/${fileName}.png`
  }

  public downloadFileContents(fileName: string, fileID?: number) {
    if (!fileID) {
      return
    }
    this.http.get(this.getFileContentsAddress(fileName, fileID), { observe: 'response', responseType: 'blob' }).subscribe((res: HttpResponse<Blob>) => {
      this.fileSaver.save(res.body, fileName)
    })
  }

  public async getRandomUntaggedFile(): Promise<{ file: TaggedFileEntry | null, error: Error | null }> {
    const { data, error } = await this.supaService.listFiles([], "all", [], "all", false, 10)
    if (error) {
      return { file: null, error: error }
    }
    if (data.length == 0) {
      return { file: null, error: null }
    }
    const castData = data as TaggedFileEntry[]
    data.sort((a, b) => Math.random() - 0.5);
    return { file: castData[0], error: null }
  }
}
