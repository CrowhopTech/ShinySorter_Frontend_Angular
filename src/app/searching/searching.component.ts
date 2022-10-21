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
  searchBarOpen = false;

  allTags: Tag[] | undefined = undefined
  searchResult: File[] | undefined = undefined

  query: FileQuery = new FileQuery([], [], "all", "all")
  searchSubscription: Subscription | null = null

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

  constructor(public router: Router, private route: ActivatedRoute, private apiServer: APIServerService) {
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

  navigateToParams(includeTags: number[], excludeTags: number[], includeMode: "any" | "all", excludeMode: "any" | "all") {
    this.router.navigate(["/search"], {
      queryParams: new FileQuery(includeTags, excludeTags, includeMode, excludeMode).
        searchPageParams(includeTagsParam, includeModeParam, excludeTagsParam, excludeModeParam)
    })
  }

  // Called when a tag is moved from one category to another
  tagAction(action: "include" | "exclude" | "neutral", tag: number) {
    const newInclude = new Set<number>();
    const newExclude = new Set<number>();
    switch (action) {
      case "include":
        newInclude.add(tag)
        this.query.includeTags.forEach(t => newInclude.add(t))

        this.query.excludeTags.filter(t => t !== tag).forEach(t => newExclude.add(t))
        break;
      case "exclude":
        newExclude.add(tag)
        this.query.excludeTags.forEach(t => newExclude.add(t))

        this.query.includeTags.filter(t => t !== tag).forEach(t => newInclude.add(t))
        break;
      case "neutral":
        // Remove from both included and excluded
        this.query.excludeTags.filter(t => t !== tag).forEach(t => newExclude.add(t))
        this.query.includeTags.filter(t => t !== tag).forEach(t => newInclude.add(t))
        break;
    }

    this.navigateToParams(
      Array.from(newInclude),
      Array.from(newExclude),
      this.query.includeMode,
      this.query.excludeMode
    )
  }

  ngOnInit(): void {
    this.apiServer.listTags().subscribe(tags => {
      this.allTags = tags
    })
  }
}
