import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatRadioChange } from '@angular/material/radio';
import { Question } from 'src/app/apiserver.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.sass']
})
export class QuestionComponent implements OnInit {
  // undefined means hasn't loaded yet, null means we're done (no more questions), Question means current question
  @Input() question: Question | null | undefined = undefined
  @Input() selectedTags: number[] = []

  lastRadioSelection: number | undefined = undefined

  @Output() tagAdded = new EventEmitter<number>();
  @Output() tagRemoved = new EventEmitter<number>();

  constructor() { }

  isTagChecked(tagID: number): boolean {
    return this.selectedTags.some(t => t == tagID)
  }

  radioChanged(event: MatRadioChange): void {
    this.question?.tagOptions.forEach(to => {
      if (to.tagID == event.value) {
        // This is the tag option that we're adding: emit an added event
        this.tagAdded.emit(to.tagID)
        return
      }
      if (this.selectedTags.some(t => t == to.tagID)) {
        // This is a tag option that was selected, but since this is a radio button it no longer will be
        // Emit a removed event
        this.tagRemoved.emit(to.tagID)
      }
      // This is a tag option that was not, and still is not selected: do nothing
    })
    if (this.lastRadioSelection) {
      this.tagRemoved.emit(this.lastRadioSelection)
    }
    this.lastRadioSelection = event.value
  }

  checkboxChanged(forCheckbox: number) {
    return (event: MatCheckboxChange): void => {
      if (event.checked) {
        this.tagAdded.emit(forCheckbox)
      } else {
        this.tagRemoved.emit(forCheckbox)
      }
    }
  }

  ngOnInit(): void {
  }

}
