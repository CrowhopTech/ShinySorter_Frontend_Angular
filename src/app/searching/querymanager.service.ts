import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SearchMode, FileQuery } from '../filequery';
import { DefaultService as ShinySorterService, FileEntry, FilesService } from 'angular-client';
import { APIUtilityService } from '../apiutility.service';

const includeTagsParam = "includeTags"
const excludeTagsParam = "excludeTags"
const includeModeParam = "includeMode"
const excludeModeParam = "excludeMode"
const viewingFileParam = "view"

const pageSize = 3

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
  private _searchPage: number = -1
  private _searchSubscription: Subscription | null = null
  private _searchError?: string
  private _resultsCount?: number
  private _noMoreResults: boolean = false

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

  public get noMoreResults(): boolean {
    return this._noMoreResults
  }

  public get resultsCount(): number | undefined {
    return this._resultsCount
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

  public getMoreResults() {
    if (this.searchRequestInFlight()) {
      return
    }
    if (!this._searchResult || this._searchError != undefined) {
      return
    }

    this.listFileCall(true)
  }

  public viewCanGoBack(): boolean {
    if (!this._searchResult) {
      return false
    }
    // Index = -1, not found. Index = 0, first one. All else can go back.
    return this._searchResult.findIndex(f => f.id == this._viewingFileID) > 0
  }

  public viewCanGoForward(): boolean {
    if (!this._searchResult) {
      return false
    }
    const idx = this._searchResult.findIndex(f => f.id == this._viewingFileID)
    if (idx == -1) {
      return false
    }
    // If we're at the end of our current files, and we already tried to get more
    // then we really can't go forward. Otherwise, let us try.
    return idx != this._searchResult.length - 1 || !this._noMoreResults
  }

  public viewNextFile() {
    // Get index of current file
    if (!this._searchResult) {
      return
    }
    const idx = this._searchResult.findIndex(f => f.id == this._viewingFileID)
    if (idx == -1) {
      return
    }
    if (idx == this._searchResult.length - 1) {
      this.getMoreResults()
    }
    const nextFile = this._searchResult[Math.min(this._searchResult.length - 1, idx + 1)]
    if (nextFile == undefined) {
      return
    }
    this.viewFile(nextFile.id)
  }

  public viewLastFile() {
    // Get index of current file
    if (!this._searchResult) {
      return
    }
    const idx = this._searchResult.findIndex(f => f.id == this._viewingFileID)
    if (idx <= 0) {
      return
    }
    const lastFileID = this._searchResult[Math.max(0, idx - 1)].id
    this.viewFile(lastFileID)
  }

  public searchRequestInFlight() {
    return this._searchSubscription && !this._searchSubscription.closed
  }

  listFileCall(append: boolean = false) {
    if (this._searchSubscription) {
      this._searchSubscription.unsubscribe()
    }
    if (!append) {
      this._searchResult = undefined
      this._noMoreResults = false
      this._resultsCount = undefined
      this._searchPage = -1
    }
    this._searchError = undefined
    this._searchSubscription = this.filesService.listFiles(
      this.query.includeTags,
      this.query.includeMode,
      this.query.excludeTags,
      this.query.excludeMode,
      true,
      this._searchPage + 1,
      "response"
    ).subscribe({
      next: (resp: HttpResponse<FileEntry[]>) => {
        if (!resp.body) {
          return
        }
        const files = resp.body

        if (resp.headers.has("X-Filecount")) {
          const paramVal = resp.headers.get("X-Filecount")
          if (paramVal && paramVal != "") {
            const countParam = parseInt(paramVal)
            if (countParam > -1) {
              this._resultsCount = countParam
            }
          }
        }

        if (append) {
          if (files.length == 0) {
            this._noMoreResults = true
          }
          files.forEach(f => this._searchResult?.push(f))
        } else {
          this._searchResult = files
        }
        this._searchPage++
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
  }

  constructor(private router: Router, private route: ActivatedRoute, private filesService: FilesService, private apiUtility: APIUtilityService) {
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
        this.filesService.getFileById(this.viewingFileID).subscribe(f => this._viewingFile = f)
      }
      this.listFileCall(false)
    })
  }
}
