import { ArrayDataSource } from '@angular/cdk/collections';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DefaultService as ShinySorterService, QuestionEntry, QuestionPatch, TagEntry, TagOption, TagPatch } from 'angular-client';
import { APIUtilityService } from 'src/app/apiutility.service';

@Component({
  selector: 'app-question-edit-dialog',
  templateUrl: './question-edit-dialog.component.html',
  styleUrls: ['./question-edit-dialog.component.sass']
})
export class QuestionEditDialogComponent implements OnInit {
  private _questionID: number
  public questionCopy: QuestionPatch
  public mutexString = ""
  public tags?: TagEntry[]

  boolToStr = (b: boolean) => b ? 'true' : 'false'

  constructor(public dialogRef: MatDialogRef<QuestionEditDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: { question: QuestionEntry }, private apiService: ShinySorterService, public apiUtility: APIUtilityService) {
    this._questionID = data.question.questionID
    this.questionCopy = {
      mutuallyExclusive: data.question.mutuallyExclusive ? "true" : "false",
      orderingID: data.question.orderingID,
      questionText: data.question.questionText,
      tagOptions: JSON.parse(JSON.stringify(data.question.tagOptions))
    }
    this.mutexString = data.question.mutuallyExclusive ? "Allow only one selection" : "Allow selecting multiple"
  }

  ngOnInit(): void {
    this.apiUtility.updateTagCache()
    this.apiService.listTags().subscribe(tags => {
      this.tags = tags
    })
  }

  mutexChange($event: MatSlideToggleChange) {
    this.questionCopy.mutuallyExclusive = this.boolToStr($event.checked)
    this.mutexString = $event.checked ? "Allow only one selection" : "Allow selecting multiple"
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

  removeTag(tagID: number) {
    if (!this.questionCopy || !this.questionCopy.tagOptions) {
      return
    }

    const idx = this.questionCopy.tagOptions.findIndex(to => to.tagID == tagID)
    if (idx == -1) {
      return
    }

    this.questionCopy.tagOptions.splice(idx, 1)
  }

  addOption() {
    if (!this.tags) {
      return
    }

    // Find the lowest tag ID, just to give a consistent starting value
    const lowestTagID = this.tags.map(t => t.id).reduce((p, c) => Math.min(p, c))
    const lowestTagName = this.apiUtility.getTagName(lowestTagID)

    this.questionCopy.tagOptions?.push({ tagID: lowestTagID, optionText: lowestTagName ? lowestTagName : "" })
  }
}

@Component({
  selector: 'app-tag-option-edit',
  templateUrl: './tag-option-edit.component.html',
  styleUrls: ['./tag-option-edit.component.sass']
})
/**
 * This is abstracted out to a separate class because it makes management of individual tag options a *lot* easier to reason about.
 * Renders a selector for which tag(s) goes to which options, and a text box for the text displayed
 */
export class TagOptionEditComponent implements OnInit {
  private _tagOption?: TagOption
  @Input() set tagOption(to: TagOption | undefined) {
    this._tagOption = to
    this._originalText = to ? to.optionText : ""
    this._originalTag = to ? to.tagID : -1
  }
  get tagOption() {
    return this._tagOption
  }

  @Input() tags?: TagEntry[] // Pass this in as an input so we don't have to fetch it n times

  private _originalText: string = ""
  private _originalTag: number = -1

  @Output() removeTag = new EventEmitter<number>();

  constructor() {
  }

  ngOnInit(): void {

  }

  optionTextChange($event: any) {
    if (!this.tagOption) {
      return
    }

    this.tagOption.optionText = $event.target.value
  }

  resetOption() {
    if (!this.tagOption) { return }

    this.tagOption.optionText = this._originalText
    this.tagOption.tagID = this._originalTag
  }

  tagChange($event: MatSelectChange) {
    if (!this.tagOption) {
      return
    }

    this.tagOption.tagID = $event.value
  }
}