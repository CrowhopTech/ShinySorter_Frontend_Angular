import { ParseError } from '@angular/compiler';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { APIServerService, Tag } from '../apiserver.service';

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
  includedTagIDs: number[] = []
  excludedTagIDs: number[] = []

  includeMode: "all" | "any" = "all"
  excludeMode: "all" | "any" = "all"

  includedTags() {
    if (!this.allTags) return undefined
    return this.allTags.filter(tag => this.includedTagIDs.find(id => tag.id === id))
  }

  excludedTags() {
    if (!this.allTags) return undefined
    return this.allTags.filter(tag => this.excludedTagIDs.find(id => tag.id === id))
  }

  unusedTags() {
    if (!this.allTags) return undefined
    return this.allTags.filter(tag => (!this.includedTagIDs.find(id => tag.id === id) && !this.excludedTagIDs.find(id => tag.id === id)))
  }

  constructor(public router: Router, private route: ActivatedRoute, private apiServer: APIServerService) {
    this.route.queryParams.subscribe(params => {
      this.includedTagIDs = []
      const includeTags: string = params[includeTagsParam]
      if (includeTags) {
        const includeSplit = includeTags.split(",")
        const includeParsed = includeSplit.map(s => parseInt(s))
        this.includedTagIDs = includeParsed
      }

      this.excludedTagIDs = []
      const excludeTags: string = params[excludeTagsParam]
      if (excludeTags) {
        const excludeSplit = excludeTags.split(",")
        const excludeParsed = excludeSplit.map(s => parseInt(s))
        this.excludedTagIDs = excludeParsed
      }

      this.includeMode = "all"
      const includeMode: string = params[includeModeParam]
      if (includeMode) {
        switch (includeMode) {
          case "any":
            this.includeMode = "any"
            break
          case "all":
            this.includeMode = "all"
            break
          default:
            throw new SyntaxError("includeMode should be 'all' or 'any'")
        }
      }

      this.excludeMode = "all"
      const excludeMode: string = params[excludeModeParam]
      if (excludeMode) {
        switch (excludeMode) {
          case "any":
            this.excludeMode = "any"
            break
          case "all":
            this.excludeMode = "all"
            break
          default:
            throw new SyntaxError("excludeMode should be 'all' or 'any'")
        }
      }
    })
  }

  navigateToParams(includeTags: number[], excludeTags: number[], includeMode: "any" | "all", excludeMode: "any" | "all") {
    let params: Params = {}
    if (includeTags.length > 0) {
      params[includeTagsParam] = includeTags.join(",")
      params[includeModeParam] = includeMode
    }
    if (excludeTags.length > 0) {
      params[excludeTagsParam] = excludeTags.join(",")
      params[excludeModeParam] = excludeMode
    }

    this.router.navigate(["/search"], {
      queryParams: params
    })
  }

  tagAction(action: "include" | "exclude" | "neutral", tag: number) {
    const newInclude = new Set<number>();
    const newExclude = new Set<number>();
    switch (action) {
      case "include":
        newInclude.add(tag)
        this.includedTagIDs.forEach(t => newInclude.add(t))

        this.excludedTagIDs.filter(t => t !== tag).forEach(t => newExclude.add(t))
        break;
      case "exclude":
        newExclude.add(tag)
        this.excludedTagIDs.forEach(t => newExclude.add(t))

        this.includedTagIDs.filter(t => t !== tag).forEach(t => newInclude.add(t))
        break;
      case "neutral":
        // Remove from both included and excluded
        this.excludedTagIDs.filter(t => t !== tag).forEach(t => newExclude.add(t))
        this.includedTagIDs.filter(t => t !== tag).forEach(t => newInclude.add(t))
        break;
    }

    this.navigateToParams(
      Array.from(newInclude),
      Array.from(newExclude),
      this.includeMode,
      this.excludeMode
    )
  }

  ngOnInit(): void {
    this.apiServer.listTags().subscribe(tags => {
      this.allTags = tags
    })
  }
}
