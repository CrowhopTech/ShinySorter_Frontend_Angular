import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { distinctUntilChanged, filter, fromEvent, map } from 'rxjs';
import { APIServerService } from '../apiserver.service';
import { QueryManagerService } from './querymanager.service';

@Component({
  selector: 'app-searching',
  templateUrl: './searching.component.html',
  styleUrls: ['./searching.component.sass']
})
export class SearchingComponent implements OnInit {
  viewerInfoOpen: boolean = false

  tagsFetchError: string | undefined = undefined

  constructor(public router: Router, public apiServer: APIServerService, public queryManager: QueryManagerService) { }

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

    this.apiServer.prepareTagsMap().subscribe({
      next: _ => { this.tagsFetchError = undefined },
      error: err => { this.tagsFetchError = err.toString() }
    })
  }
}
