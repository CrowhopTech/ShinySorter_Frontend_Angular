import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DefaultService as ShinySorterService } from 'angular-client';
import { distinctUntilChanged, filter, fromEvent, map } from 'rxjs';
import { APIUtilityService } from '../apiutility.service';
import { QueryManagerService } from './querymanager.service';

@Component({
  selector: 'app-searching',
  templateUrl: './searching.component.html',
  styleUrls: ['./searching.component.sass']
})
export class SearchingComponent implements OnInit {
  viewerInfoOpen: boolean = false

  // tagsMap?: Map<number, string>
  // tagsFetchError?: string

  constructor(public router: Router, public queryManager: QueryManagerService, private apiService: ShinySorterService, public apiUtility: APIUtilityService) { }

  pastelColorForText(text: string | undefined): string {
    if (!text) {
      return ""
    }
    const hash = text.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const pastelStrength = '93%'
    return `hsl(${hash % 360}, ${pastelStrength}, ${pastelStrength})`;
  }

  ngOnInit(): void {
    this.apiUtility.updateTagCache()

    fromEvent(document, 'keydown').
      pipe(
        map((e: Event) => e as KeyboardEvent),
        filter((e: KeyboardEvent) => e.type === "keydown"),
        distinctUntilChanged(),
        filter((e: KeyboardEvent) => e.key == "Escape")).
      subscribe((_: KeyboardEvent) => {
        if (this.queryManager.viewingFileID != "") {
          this.queryManager.viewClose()
        }
      })

    // this.apiService.listTags().subscribe({
    //   next: tags => {
    //     tags.forEach(tag => { if (tag.id && tag.userFriendlyName) { this.tagsMap?.set(tag.id, tag.userFriendlyName) } })
    //   },
    //   error: err => { this.tagsFetchError = err.toString() }
    // })
  }
}
