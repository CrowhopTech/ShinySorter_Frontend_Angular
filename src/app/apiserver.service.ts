import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, mergeMap, of, filter, tap } from 'rxjs';

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

  public listTags(): Observable<Tag[]> {
    return this.http.get(`${this.apiServerAddress}/tags`).pipe(
      map(o => (o as Object[]).map(t => t as Tag)),
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
}
