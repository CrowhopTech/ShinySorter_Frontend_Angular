import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DefaultService as ShinySorterService } from 'angular-client';
import { FileSaverService } from 'ngx-filesaver';
import { map, Observable } from 'rxjs';
import { AppConfig, AppService } from './app.service';
import { File } from 'angular-client';

@Injectable({
  providedIn: 'root'
})
export class APIUtilityService {
  tagsMap?: Map<number, string>
  tagsFetchError?: string

  constructor(private apiService: ShinySorterService, private appConfig: AppService, private http: HttpClient, private fileSaver: FileSaverService) {
    this.updateTagCache()
  }

  // ===== Tag Cache
  public updateTagCache() {
    this.tagsMap = undefined
    this.tagsFetchError = undefined
    this.apiService.listTags().subscribe({
      next: tags => {
        this.tagsMap = new Map<number, string>();
        tags.forEach(tag => { if (tag.id && tag.userFriendlyName) { this.tagsMap?.set(tag.id, tag.userFriendlyName) } })
      },
      error: err => this.tagsFetchError = err.toString()
    })
  }

  public getTagName(tagID?: number): string | undefined {
    if (!this.tagsMap || !tagID) {
      return undefined
    }
    return this.tagsMap.get(tagID)
  }

  // ===== File Contents

  public getFileContentsAddress(fileID?: string): string {
    if (!fileID) {
      return ""
    }
    return `${this.appConfig.settings?.apiServerAddress}/files/contents/${fileID}`
  }

  public getFileThumbAddress(fileID?: string): string {
    if (!fileID) {
      return ""
    }
    return `${this.getFileContentsAddress(fileID)}?thumb=true`
  }

  public downloadFileContents(fileID?: string) {
    if (!fileID) {
      return
    }
    this.http.get(this.getFileContentsAddress(fileID), { observe: 'response', responseType: 'blob' }).subscribe((res: HttpResponse<Blob>) => {
      this.fileSaver.save(res.body, fileID)
    })
  }

  public getRandomUntaggedFile(): Observable<File | null> {
    return this.apiService.listFiles([], "all", [], "all", false).pipe(map(untaggedFiles => {
      if (untaggedFiles.length == 0) {
        return null
      }

      // Shuffle the files
      untaggedFiles.sort((a, b) => Math.random() - 0.5);
      return untaggedFiles[0]
    }))
  }
}
