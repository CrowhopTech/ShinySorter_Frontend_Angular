import { HttpErrorResponse } from '@angular/common/http';
import { ParseError } from '@angular/compiler';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { distinctUntilChanged, filter, fromEvent, map, Observable, Subscription } from 'rxjs';
import { APIServerService, FileQuery, SearchMode, Tag, File } from '../apiserver.service';

const includeTagsParam = "includeTags"
const excludeTagsParam = "excludeTags"
const includeModeParam = "includeMode"
const excludeModeParam = "excludeMode"
const viewingFileParam = "view"

@Component({
  selector: 'app-searching',
  templateUrl: './searching.component.html',
  styleUrls: ['./searching.component.sass']
})
export class SearchingComponent implements OnInit {
  query: FileQuery = new FileQuery([], [], "all", "all", true)

  searchResult: File[] | undefined = undefined
  searchSubscription: Subscription | null = null
  searchError: string | undefined = undefined

  viewingFileID: string | undefined = undefined
  viewerInfoOpen: boolean = false

  constructor(public router: Router, private route: ActivatedRoute, public apiServer: APIServerService) { }

  navigateToQuery(query: FileQuery) {
    this.router.navigate(["/search"], {
      queryParams: query.searchPageParams(includeTagsParam, includeModeParam, excludeTagsParam, excludeModeParam)
    })
  }

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

  viewClose() {
    this.router.navigate(["/search"], {
      queryParamsHandling: 'merge',
      queryParams: {
        [viewingFileParam]: null
      }
    })
  }

  viewFile(fileID: string) {
    this.router.navigate(["/search"], {
      queryParamsHandling: 'merge',
      queryParams: {
        [viewingFileParam]: fileID
      }
    })
  }

  ngOnInit(): void {
    const keyDowns = fromEvent(document, 'keydown').pipe(
      map((e: Event) => e as KeyboardEvent),
      filter((e: KeyboardEvent) => e.type === "keydown"),
      distinctUntilChanged()
    );
    keyDowns.pipe(filter((e: KeyboardEvent) => e.key == "Escape")).subscribe((e: KeyboardEvent) => {
      if (this.viewingFileID) {
        this.viewClose()
      }
    })

    this.route.queryParams.subscribe(params => {
      this.query.includeTags = this.getNumberArrayParam(params, includeTagsParam)
      this.query.excludeTags = this.getNumberArrayParam(params, excludeTagsParam)

      this.query.includeMode = this.getSearchModeParam(params, includeModeParam, "all")
      this.query.excludeMode = this.getSearchModeParam(params, excludeModeParam, "all")

      let viewingFile: string = params[viewingFileParam]
      this.viewingFileID = viewingFile ? viewingFile : undefined

      if (this.searchSubscription) {
        this.searchSubscription.unsubscribe()
      }
      this.searchResult = undefined
      this.searchError = undefined
      this.searchSubscription = this.apiServer.getFiles(this.query).subscribe({
        next: (files: File[]) => {
          this.searchResult = files
          this.searchError = undefined
        },
        error: (err: any) => {
          this.searchResult = []
          if (err instanceof HttpErrorResponse) {
            this.searchError = err.message
          } else {
            this.searchError = err.toString()
          }
        }
      })
    })
  }
}
