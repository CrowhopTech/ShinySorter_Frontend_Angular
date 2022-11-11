import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { throwToolbarMixedModesError } from '@angular/material/toolbar';
import { DefaultService as ShinySorterService, TagEntry, TagsService } from 'angular-client';
import { interval, timer } from 'rxjs';

@Component({
  selector: 'app-tag-create-tile',
  templateUrl: './tag-create-tile.component.html',
  styleUrls: ['./tag-create-tile.component.sass']
})
export class TagCreateTileComponent implements OnInit {

  @Output() refetchRequired = new EventEmitter<undefined>();

  newName?: string
  newDescription: string = ""

  editing: boolean = false
  savePending: boolean = false // Set to true when we start the tag create call, set to false once it finishes

  constructor(private tagsService: TagsService, private snackbar: MatSnackBar) { }

  ngOnInit(): void { }

  submitChanges() {
    if (this.newName == undefined || this.newDescription == undefined || this.newName.length == 0) {
      return
    }

    this.savePending = true

    this.tagsService.createTag({
      userFriendlyName: this.newName,
      description: this.newDescription
    }).subscribe(_ => {
      this.editing = false
      this.savePending = false
      this.refetchRequired.emit()
      this.snackbar.open(`Tag '${this.newName}' created successfully`, undefined, { duration: 3000 })
    })
  }
}
