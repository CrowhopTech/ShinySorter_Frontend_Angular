import { Injectable } from '@angular/core';
import { DefaultService as ShinySorterService, TagEntry } from 'angular-client';

@Injectable({
  providedIn: 'root'
})
export class TagSettingsService {
  private _tags?: TagEntry[]
  private _tagsFetchError?: string

  public get tags() { return this._tags }
  public get tagsErr() { return this._tagsFetchError }

  constructor(private apiService: ShinySorterService) { }

  public refetchTags() {
    this._tags = undefined
    this._tagsFetchError = undefined
    this.apiService.listTags().subscribe({
      next: tags => {
        this._tags = tags
      },
      error: err => {
        this._tagsFetchError = err.toString()
      }
    })
  }
}
