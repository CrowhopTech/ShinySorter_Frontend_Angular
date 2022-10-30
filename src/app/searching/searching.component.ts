import { HttpErrorResponse } from '@angular/common/http';
import { ParseError } from '@angular/compiler';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { APIServerService, FileQuery, SearchMode, Tag, File } from '../apiserver.service';

const includeTagsParam = "includeTags"
const excludeTagsParam = "excludeTags"
const includeModeParam = "includeMode"
const excludeModeParam = "excludeMode"

@Component({
  selector: 'app-searching',
  templateUrl: './searching.component.html',
  styleUrls: ['./searching.component.sass']
})
export class SearchingComponent implements OnInit {
  query: FileQuery = new FileQuery([], [], "all", "all", true)

  searchResult: File[] | undefined = undefined
  searchSubscription: Subscription | null = null

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

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.query.includeTags = this.getNumberArrayParam(params, includeTagsParam)
      this.query.excludeTags = this.getNumberArrayParam(params, excludeTagsParam)

      this.query.includeMode = this.getSearchModeParam(params, includeModeParam, "all")
      this.query.excludeMode = this.getSearchModeParam(params, excludeModeParam, "all")

      if (this.searchSubscription) {
        this.searchSubscription.unsubscribe()
      }
      this.searchResult = undefined
      this.searchSubscription = this.apiServer.getFiles(this.query).subscribe((files) => {
        this.searchResult = files
      })
    })
  }
}
