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

  constructor(public router: Router, public queryManager: QueryManagerService, private apiService: ShinySorterService, public apiUtility: APIUtilityService) { }

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
