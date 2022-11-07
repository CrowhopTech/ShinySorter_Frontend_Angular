import { Injectable } from '@angular/core';
import { PetService } from 'angular-client';
import { APIServerService, Tag } from 'src/app/apiserver.service';

@Injectable({
  providedIn: 'root'
})
export class TagSettingsService {
  private _tags?: Tag[]
  private _tagsFetchError?: string

  constructor(private apiServer: APIServerService, private swagger: PetService) { }

  public onInit() {

  }

  public refetchTags() {
    this._tags = undefined
    this._tagsFetchError = undefined
    this.apiServer.listTags().subscribe({
      next: tags => this._tags = tags,
      error: err => this._tagsFetchError = err.toString()
    })
  }

  public deleteTag(tagID: number) {

  }

  public editTag(tagID: number) {

  }

  public createTag() {

  }
}
