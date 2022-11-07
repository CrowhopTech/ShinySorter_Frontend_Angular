import { Component, OnInit } from '@angular/core';
import { APIUtilityService } from 'src/app/apiutility.service';
import { TagSettingsService } from './tag-settings.service';

@Component({
  selector: 'app-tag-settings',
  templateUrl: './tag-settings.component.html',
  styleUrls: ['./tag-settings.component.sass']
})
export class TagSettingsComponent implements OnInit {
  constructor(public apiUtility: APIUtilityService, public tagSettings: TagSettingsService) { }

  ngOnInit(): void {
    this.tagSettings.refetchTags()
  }
}
