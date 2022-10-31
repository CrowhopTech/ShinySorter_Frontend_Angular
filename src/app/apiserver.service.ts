import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { FileSaverService } from 'ngx-filesaver';
import { map, Observable, of, tap, catchError } from 'rxjs';
import { AppService } from './app.service';

export class File {
  constructor(public id: string,
    public md5sum: string,
    public tags: number[],
    public hasBeenTagged: boolean,
    public mimeType: string) { }
}

export class Tag {
  constructor(public id: number,
    public name: string,
    public userFriendlyName: string,
    public description: string) { }
}

export class Question {
  constructor(public questionID: number,
    public orderingID: number,
    public questionText: string,
    public tagOptions: { tagID: number, optionText: string }[],
    public mutuallyExclusive: boolean) { }
}

export type SearchMode = "any" | "all"

export class FileQuery {
  static includeTagsParam = "includeTags"
  static excludeTagsParam = "excludeTags"
  static includeModeParam = "includeOperator"
  static excludeModeParam = "excludeOperator"
  static taggedParam = "hasBeenTagged"

  constructor(public includeTags: number[],
    public excludeTags: number[],
    public includeMode: SearchMode,
    public excludeMode: SearchMode,
    public hasBeenTagged: boolean) { }

  public httpParams(): HttpParams {
    let params = new HttpParams();
    if (this.includeTags.length > 0) {
      params = params.set(FileQuery.includeTagsParam, this.includeTags.join(","))
      params = params.set(FileQuery.includeModeParam, this.includeMode)
    }
    if (this.excludeTags.length > 0) {
      params = params.set(FileQuery.excludeTagsParam, this.excludeTags.join(","))
      params = params.set(FileQuery.excludeModeParam, this.excludeMode)
    }
    if (!this.hasBeenTagged) {
      params = params.set(FileQuery.taggedParam, this.hasBeenTagged)
    }

    return params
  }

  public searchPageParams(itName: string, imName: string, etName: string, emName: string): Params {
    let params: Params = {}
    if (this.includeTags.length > 0) {
      params[itName] = this.includeTags.join(",")
      params[imName] = this.includeMode
    }
    if (this.excludeTags.length > 0) {
      params[etName] = this.excludeTags.join(",")
      params[emName] = this.excludeMode
    }

    return params
  }

  public getIncludedTags(allTags: Tag[] | undefined): Tag[] {
    if (!allTags) return []
    return allTags.filter(tag => this.includeTags.find(id => tag.id === id))
  }

  public getExcludedTags(allTags: Tag[] | undefined): Tag[] {
    if (!allTags) return []
    return allTags.filter(tag => this.excludeTags.find(id => tag.id === id))
  }

  public getUnusedTags(allTags: Tag[] | undefined): Tag[] {
    if (!allTags) return []
    return allTags.filter(tag => (!this.includeTags.find(id => tag.id === id) && !this.excludeTags.find(id => tag.id === id)))
  }
}

@Injectable({
  providedIn: 'root'
})
export class APIServerService {

  apiServerAddress = "http://192.168.1.5/dev/api"
  tagCache: Map<number, string> = new Map();

  jsonHeader = {
    'Content-Type': 'application/json'
  }

  httpOptions = {
    headers: this.jsonHeader
  }

  constructor(private http: HttpClient, private fileSaver: FileSaverService, private appConfig: AppService) { }

  responseToObjArray<T>(obs: Observable<Object>) {
    return map((original: Object) => (original as Object[]).map(element => element as T))(obs)
  }

  public listTags(): Observable<Tag[]> {
    return this.http.get(`${this.appConfig.settings?.apiServerAddress}/tags`, this.httpOptions).pipe(
      this.responseToObjArray<Tag>,
      tap(tags => tags.forEach(tag => this.tagCache.set(tag.id, tag.name)))
    )
  }

  public getTagsMap(): Observable<Map<number, string>> {
    return this.http.get(`${this.appConfig.settings?.apiServerAddress}/tags`, this.httpOptions).pipe(
      this.responseToObjArray<Tag>,
      map(tags => {
        let m = new Map<number, string>();
        tags.forEach(t => m.set(t.id, t.userFriendlyName))
        return m
      }))
  }

  public getTagName(tagID: number): Observable<string> {
    // Check the cache first
    const cachedID = this.tagCache.get(tagID)
    if (cachedID) {
      return of(cachedID)
    }

    // If not in cache, do the long way and list tags to find the name
    return this.listTags().
      pipe(
        map(tags => tags.filter(t => t.id === tagID)),
        map(tags => tags[0].name)
      )
  }

  public getFiles(query: FileQuery): Observable<File[]> {
    return this.http.get(`${this.appConfig.settings?.apiServerAddress}/files`, { params: query.httpParams(), headers: this.jsonHeader }).pipe(this.responseToObjArray<File>, catchError((err: any, caught: Observable<File[]>) => {
      if (err instanceof HttpErrorResponse) {
        const cast = err as HttpErrorResponse
        if (cast.status == 404) {
          return of([] as File[])
        }
      }
      throw err
    }))
  }

  public getFile(fileID: string): Observable<File> {
    return this.http.get(`${this.appConfig.settings?.apiServerAddress}/files/${fileID}`, this.httpOptions).pipe(map(obj => obj as File))
  }

  public getFileContentsAddress(fileID: string): string {
    return `${this.appConfig.settings?.apiServerAddress}/files/contents/${fileID}`
  }

  public getFileThumbAddress(fileID: string): string {
    return `${this.getFileContentsAddress(fileID)}?thumb=true`
  }

  public downloadFileContents(fileID: string) {
    this.http.get(this.getFileContentsAddress(fileID), { observe: 'response', responseType: 'blob' }).subscribe((res: HttpResponse<Blob>) => {
      this.fileSaver.save(res.body, fileID)
    })
  }

  public getRandomUntaggedFile(): Observable<File | null> {
    return this.getFiles(new FileQuery([], [], "all", "all", false)).pipe(map(untaggedFiles => {
      if (untaggedFiles.length == 0) {
        return null
      }

      // Shuffle the files
      untaggedFiles.sort((a, b) => Math.random() - 0.5);
      return untaggedFiles[0]
    }))
  }

  public tagFile(fileID: string, tags: number[], markAsTagged: boolean | undefined = undefined): Observable<null> {
    const requestBody: any = {
      "tags": tags,
    }
    if (typeof (markAsTagged) != 'undefined') {
      requestBody.hasBeenTagged = markAsTagged
    }
    return this.http.patch(`${this.appConfig.settings?.apiServerAddress}/files/${fileID}`, JSON.stringify(requestBody), this.httpOptions).pipe(map(_ => null)) // Dispose the response for now, unless we need it later
  }

  public listQuestions(): Observable<Question[]> {
    return this.http.get(`${this.appConfig.settings?.apiServerAddress}/questions`, this.httpOptions).pipe(
      this.responseToObjArray<Question>,
      // If a question has no ordering ID, set to zero
      // Frontend fix for backend issue #22
      // https://github.com/CrowhopTech/ShinySorter_Backend/issues/22
      map(questions => questions.map(q => {
        if (!q.orderingID) {
          q.orderingID = 0
        }

        return q
      })),
      map(questions => questions.sort((a, b) => a.orderingID - b.orderingID)) // Sort by ordering ID
    )
  }
}
