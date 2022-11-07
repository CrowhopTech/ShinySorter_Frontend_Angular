import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SearchMode, FileQuery } from '../filequery';
import { DefaultService as ShinySorterService, FileEntry } from 'angular-client';
import { APIUtilityService } from '../apiutility.service';

const includeTagsParam = "includeTags"
const excludeTagsParam = "excludeTags"
const includeModeParam = "includeMode"
const excludeModeParam = "excludeMode"
const viewingFileParam = "view"

@Injectable({
  providedIn: 'root'
})
export class QueryManagerService {
  private getNumberArrayParam(params: Params, param: string): number[] {
    const val: string = params[param]
    if (!val) {
      return []
    }

    const split = val.split(",")
    const parsed = split.map(s => parseInt(s))
    return parsed
  }

  private getSearchModeParam(params: Params, param: string, def: SearchMode): SearchMode {
    const val: string = params[param]
    if (!val) {
      return def
    }

    switch (val) {
      case "any":
        return "any"
      case "all":
        return "all"
      default:
        throw new SyntaxError("includeMode should be 'all' or 'any'")
    }
  }

  @Output() paramsChanged = new EventEmitter<undefined>();
  @Output() searchResultReady = new EventEmitter<undefined>();

  private _query: FileQuery;
  private _viewingFileID: string;
  private _viewingFile: FileEntry | undefined;

  private _searchResult: FileEntry[] | undefined = undefined
  private _searchSubscription: Subscription | null = null
  private _searchError: string | undefined = undefined

  public get query(): FileQuery {
    return this._query;
  }

  public get viewingFileID(): string {
    return this._viewingFileID
  }

  public get viewingFile(): FileEntry | undefined {
    return this._viewingFile
  }

  public get searchResult(): FileEntry[] | undefined {
    return this._searchResult
  }

  public get searchError(): string | undefined {
    return this._searchError
  }

  public navigateToQuery(query: FileQuery) {
    this.router.navigate(["/search"], {
      queryParams: query.searchPageParams(includeTagsParam, includeModeParam, excludeTagsParam, excludeModeParam)
    })
  }

  public viewClose() {
    this.router.navigate(["/search"], {
      queryParamsHandling: 'merge',
      queryParams: {
        [viewingFileParam]: null
      }
    })
  }

  public viewFile(fileID?: string) {
    if (!fileID || fileID.length == 0) {
      return
    }
    this.router.navigate(["/search"], {
      queryParamsHandling: 'merge',
      queryParams: {
        [viewingFileParam]: fileID
      }
    })
  }

  public nextRandomFile() {
    this.router.navigate(["/search"])
  }

  constructor(private router: Router, private route: ActivatedRoute, private apiService: ShinySorterService, private apiUtility: APIUtilityService) {
    this._query = new FileQuery([], [], "all", "all", true)
    this._viewingFileID = ""
    this._viewingFile = undefined

    this.route.queryParams.subscribe(params => {
      const newQuery = new FileQuery([], [], "all", "all", true)
      newQuery.includeTags = this.getNumberArrayParam(params, includeTagsParam)
      newQuery.excludeTags = this.getNumberArrayParam(params, excludeTagsParam)
      newQuery.includeMode = this.getSearchModeParam(params, includeModeParam, "all")
      newQuery.excludeMode = this.getSearchModeParam(params, excludeModeParam, "all")
      newQuery.hasBeenTagged = true

      let viewingFile: string = params[viewingFileParam]

      if (!newQuery.equals(this._query) || viewingFile != this._viewingFileID) {
        this.paramsChanged.emit()
      }
      this._query = newQuery
      this._viewingFileID = viewingFile ? viewingFile : ""
      if (this._viewingFileID != "") {
        this.apiService.getFileById(this.viewingFileID).subscribe(f => this._viewingFile = f)
      }

      if (this._searchSubscription) {
        this._searchSubscription.unsubscribe()
      }
      this._searchResult = undefined
      this._searchError = undefined
      this._searchSubscription = this.apiService.listFiles(this.query.includeTags, this.query.includeMode, this.query.excludeTags, this.query.excludeMode, true).subscribe({
        next: (files: FileEntry[]) => {
          this._searchResult = files
          this._searchError = undefined
          this.searchResultReady.emit()
        },
        error: (err: any) => {
          this._searchResult = []
          if (err instanceof HttpErrorResponse) {
            this._searchError = err.message
          } else {
            this._searchError = err.toString()
          }
          this.searchResultReady.error(this._searchError)
        }
      })
    })
  }
}
