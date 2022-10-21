import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { map, Observable, mergeMap, of, filter, tap, Operator, OperatorFunction, MonoTypeOperatorFunction, catchError } from 'rxjs';

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

  constructor(public includeTags: number[],
    public excludeTags: number[],
    public includeMode: SearchMode,
    public excludeMode: SearchMode) { }

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

  httpOptions = {
    'Content-Type': 'application/json'
  }

  constructor(private http: HttpClient) { }

  responseToObjArray<T>(obs: Observable<Object>) {
    return map((original: Object) => (original as Object[]).map(element => element as T))(obs)
  }

  public listTags(): Observable<Tag[]> {
    return this.http.get(`${this.apiServerAddress}/tags`).pipe(
      this.responseToObjArray<Tag>,
      tap(tags => tags.forEach(tag => this.tagCache.set(tag.id, tag.name)))
    )
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
    return this.http.get(`${this.apiServerAddress}/files`, { params: query.httpParams() }).pipe(this.responseToObjArray<File>, catchError((err: any, caught: Observable<File[]>) => {
      if (err instanceof HttpErrorResponse) {
        return of([] as File[])
      }
      throw err
    }))
  }
}
