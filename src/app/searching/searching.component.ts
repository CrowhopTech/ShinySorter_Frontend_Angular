import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(public router: Router, public queryManager: QueryManagerService, public apiUtility: APIUtilityService) { }

  get currentFileTags(): number[] | undefined {
    return this.queryManager.viewingFile?.filetags.map(t => t.tagid)
  }

  async ngOnInit(): Promise<void> {
    await this.queryManager.ngOnInit()
    this.apiUtility.updateTagCache()

    fromEvent(document, 'keydown').
      pipe(
        map((e: Event) => e as KeyboardEvent),
        filter((e: KeyboardEvent) => e.type === "keydown"),
        distinctUntilChanged(),
        filter((e: KeyboardEvent) => e.key == "Escape")).
      subscribe((_: KeyboardEvent) => {
        if (this.queryManager.viewingFileID != -1) {
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
