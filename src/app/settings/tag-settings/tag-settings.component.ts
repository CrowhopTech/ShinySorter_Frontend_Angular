import { Component, OnInit } from '@angular/core';
import { DefaultService as ShinySorterService, TagEntry, TagsService } from 'angular-client';
import { APIUtilityService } from 'src/app/apiutility.service';

@Component({
  selector: 'app-tag-settings',
  templateUrl: './tag-settings.component.html',
  styleUrls: ['./tag-settings.component.sass']
})
export class TagSettingsComponent implements OnInit {
  constructor(public apiUtility: APIUtilityService, private tagsService: TagsService) { }

  public tags?: TagEntry[]
  public tagsErr?: string

  ngOnInit(): void {
    this.refetchTags()
  }

  public refetchTags() {
    this.tags = undefined
    this.tagsErr = undefined
    this.tagsService.listTags().subscribe({
      next: tags => {
        this.tags = tags
      },
      error: err => {
        this.tagsErr = err.toString()
      }
    })
  }
}
