import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DefaultService as ShinySorterService, TagEntry } from 'angular-client';
import { interval, timer } from 'rxjs';

@Component({
  selector: 'app-tag-create-tile',
  templateUrl: './tag-create-tile.component.html',
  styleUrls: ['./tag-create-tile.component.sass']
})
export class TagCreateTileComponent implements OnInit {

  @Output() refetchRequired = new EventEmitter<undefined>();

  newName?: string
  newDescription?: string

  editing: boolean = false
  savePending: boolean = false // Set to true when we start the tag create call, set to false once it finishes

  constructor(private apiService: ShinySorterService) { }

  ngOnInit(): void { }

  submitChanges() {
    if (!this.newName || !this.newDescription || this.newName.length == 0) {
      return
    }

    this.savePending = true

    this.apiService.createTag({
      userFriendlyName: this.newName,
      description: this.newDescription,
      name: this.newName.toLowerCase().replace(" ", "-")
    }).subscribe(_ => {
      this.editing = false
      this.savePending = false
      this.refetchRequired.emit()
    })
  }
}
