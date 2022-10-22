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
  query: FileQuery = new FileQuery([], [], "all", "all")

  searchResult: File[] | undefined = undefined
  searchSubscription: Subscription | null = null

  sampleURLs: string[] = [
    "https://starcitizen.tools/images/8/83/Mercury_FrontFiring_Concept.jpeg",
    "https://sirus.b-cdn.net/wp-content/uploads/2020/11/Mercury_Star_Runner_-_Hero-1024x576.jpg",
    "https://i0.wp.com/sirusgaming.com/wp-content/uploads/2020/11/Mercury_Star_Runner_1.jpg?fit=1200%2C675&ssl=1",
    "https://i.redd.it/2xsr8rb3smk11.jpg",
    "https://i0.wp.com/fullsync.co.uk/wp-content/uploads/2020/11/1-4.jpg?fit=2048%2C1152&ssl=1",
    "https://dto9r5vaiz7bu.cloudfront.net/9yajn14hfeycr/source.jpg",
    "https://www.thelonegamers.com/wp-content/uploads/2020/09/6s9m2koxo0p51-scaled.jpg",
    "https://media.robertsspaceindustries.com/14p4jnd1a8nmx/store_slideshow_large_zoom.jpg",
    "https://dto9r5vaiz7bu.cloudfront.net/ndpphvnho8q5z/source.jpg",
    "https://forums.uwsgaming.com/uploads/monthly_2018_08/mercury9.thumb.jpeg.dfcd82431286843e43b6e3d53e243bb8.jpeg",
    "https://i.redd.it/0kdpdvqrftq41.png"
  ]

  constructor(public router: Router, private route: ActivatedRoute, private apiServer: APIServerService) { }

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
