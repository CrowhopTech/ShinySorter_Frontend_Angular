import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DefaultService as ShinySorterService, QuestionEntry, QuestionPatch } from 'angular-client';

@Component({
  selector: 'app-question-settings',
  templateUrl: './question-settings.component.html',
  styleUrls: ['./question-settings.component.sass']
})
export class QuestionSettingsComponent implements OnInit {

  public questions?: QuestionEntry[]

  constructor(private apiService: ShinySorterService, private snackbar: MatSnackBar) { }

  ngOnInit(): void {
    this.refreshQuestions()
  }

  refreshQuestions() {
    this.apiService.listQuestions().subscribe(questions => {
      this.questions = questions
    })
  }

  updateQuestion(id: number, $event: QuestionPatch) {
    this.apiService.patchQuestionByID(id, $event).subscribe(_ => {
      this.refreshQuestions()
      this.snackbar.open("Question updated successfully", undefined, {
        duration: 3000
      })
    })
  }
}
