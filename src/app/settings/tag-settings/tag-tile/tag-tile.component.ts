import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TagEntry, TagsService } from 'angular-client';
import { TagDeleteDialogComponent } from '../tag-delete-dialog/tag-delete-dialog.component';

@Component({
  selector: 'app-tag-tile',
  templateUrl: './tag-tile.component.html',
  styleUrls: ['./tag-tile.component.sass']
})
export class TagTileComponent implements OnInit {

  @Output() refetchRequired = new EventEmitter<undefined>();

  private _tag?: TagEntry
  @Input() set tag(newTag: TagEntry | undefined) {
    this._tag = newTag
    this.newName = newTag?.userFriendlyName // Use a setter so that we can reset the form values if the tag changes
    this.newDescription = newTag?.description
    this.savePending = false
  }
  get tag() {
    return this._tag
  }

  newName?: string
  newDescription?: string

  public editing: boolean = false
  public savePending: boolean = false // Set to true when we start the tag save call, set to false once it finishes

  constructor(private tagsService: TagsService, public dialog: MatDialog, private snackbar: MatSnackBar) { }

  ngOnInit(): void { }

  resetValues(): void {
    if (!this.tag) {
      return
    }

    this.newName = this.tag.userFriendlyName
    this.newDescription = this.tag.description
  }

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

  submitChanges() {
    if (!this.tag) {
      return
    }

    this.savePending = true

    this.tagsService.patchTagByID(this.tag.id, {
      userFriendlyName: this.newName,
      description: this.newDescription,
    }).subscribe(_ => {
      this.editing = false
      this.refetchRequired.emit()
      this.snackbar.open(`Tag '${this.newName}' updated successfully`, undefined, { duration: 3000 })
    })
  }

  deleteTag() {
    if (!this.tag) {
      return
    }

    this.dialog.open(TagDeleteDialogComponent, {
      data: {
        tagName: this.tag.userFriendlyName
      }
    }).afterClosed().subscribe((result: boolean) => {
      if (result && this.tag) {
        this.tagsService.deleteTag(this.tag.id).subscribe(_ => this.refetchRequired.emit())
      }
    });
  }
}
