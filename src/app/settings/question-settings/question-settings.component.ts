import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DefaultService as ShinySorterService, QuestionCreate, QuestionEntry, QuestionPatch, TagEntry } from 'angular-client';
import { combineLatest } from 'rxjs';
import { QuestionEditDialogComponent } from './question-edit-dialog/question-edit-dialog.component';

@Component({
  selector: 'app-question-settings',
  templateUrl: './question-settings.component.html',
  styleUrls: ['./question-settings.component.sass']
})
export class QuestionSettingsComponent implements OnInit {

  public questions?: QuestionEntry[]
  public allUnusedTags?: Map<number, TagEntry>
  public get unusedTagIDs(): number[] | undefined {
    if (this.allUnusedTags == undefined) {
      return undefined
    }
    const ids: number[] = []
    this.allUnusedTags.forEach(t => ids.push(t.id))
    return ids
  }

  constructor(private apiService: ShinySorterService, private snackbar: MatSnackBar, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.refreshQuestions()
  }

  refreshQuestions() {
    const listQuestions = this.apiService.listQuestions()
    const listTags = this.apiService.listTags()
    combineLatest([listQuestions, listTags]).subscribe(entry => {
      this.questions = entry[0]

      // Populate the allUnusedTags set with all existing question IDs: we'll then remove all ones in use to get all unused
      this.allUnusedTags = new Map<number, TagEntry>();
      entry[1].forEach(tag => this.allUnusedTags?.set(tag.id, tag))
      this.questions.forEach(q => q.tagOptions.forEach(to => this.allUnusedTags?.delete(to.tagID)))
    })
  }

  openCreateDialog() {
    this.dialog.open(QuestionEditDialogComponent, {
      data: {
        question: {
          questionID: -1,
          questionText: "",
          mutuallyExclusive: false,
          orderingID: -1,
          tagOptions: []
        } as QuestionEntry
      }
    }).afterClosed().subscribe((result?: QuestionPatch) => {
      if (result) {
        this.apiService.createQuestion({
          questionText: result.questionText ? result.questionText : "",
          orderingID: result.orderingID ? result.orderingID : -1,
          mutuallyExclusive: result.mutuallyExclusive ? (result.mutuallyExclusive == QuestionPatch.MutuallyExclusiveEnum.True) : false,
          tagOptions: result.tagOptions ? result.tagOptions : []
        }).subscribe(_ => {
          this.refreshQuestions()
          this.snackbar.open("Question created successfully", undefined, {
            duration: 3000
          })
        })
      }
    });
  }

  updateQuestion(id: number, $event: QuestionPatch) {
    this.apiService.patchQuestionByID(id, $event).subscribe(_ => {
      this.refreshQuestions()
      this.snackbar.open("Question updated successfully", undefined, {
        duration: 3000
      })
    })
  }

  deleteQuestion(id: number) {
    this.apiService.deleteQuestion(id).subscribe(_ => {
      this.refreshQuestions()
      this.snackbar.open("Question deleted successfully", undefined, {
        duration: 3000
      })
    })
  }

  reorderQuestions(newOrder: number[]) {
    this.apiService.reorderQuestions(newOrder).subscribe(_ => {
      this.refreshQuestions()
      this.snackbar.open("Question reordered successfully", undefined, {
        duration: 3000
      })
    })
  }
}

@Component({
  selector: 'app-question-delete-dialog',
  templateUrl: './question-delete-dialog.component.html',
  styleUrls: ['./question-delete-dialog.component.sass']
})
export class QuestionDeleteDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<QuestionDeleteDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: { questionText: string }) { }

  ngOnInit(): void {
  }

}

@Component({
  selector: 'app-question-reorder-dialog',
  templateUrl: './question-reorder-dialog.component.html',
  styleUrls: ['./question-reorder-dialog.component.sass']
})
export class QuestionReorderDialogComponent implements OnInit {
  questions?: QuestionEntry[]
  questionsBackup?: QuestionEntry[] // Keep a backup, it's easier to copy this and move around our entry
  questionErr?: string

  newOrder?: number[] = undefined

  selectedQuestionIndex: number = -1

  constructor(public dialogRef: MatDialogRef<QuestionReorderDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: { reorderQuestion: QuestionEntry }, private apiServer: ShinySorterService) { }

  ngOnInit(): void {
    this.apiServer.listQuestions().subscribe({
      next: questions => {
        this.questions = questions
        this.questionsBackup = questions
        // Find index of given question, selected question is the one before that
        const indexOfOurQuestion = this.questions.findIndex(q => q.questionID == this.data.reorderQuestion.questionID)
        if (indexOfOurQuestion == 0) {
          this.selectedQuestionIndex = -1
        } else {
          const questionBeforeOurs = this.questions[indexOfOurQuestion - 1]
          this.selectedQuestionIndex = questionBeforeOurs.questionID
        }
      },
      error: err => {
        this.questionErr = err.toString()
      }
    })
  }

  questionPrecursorChanged($event: MatSelectChange) {
    // Start building a new list in a loop
    // If the question we're on matches the one we're going after, also add the moving question
    let newOrder: QuestionEntry[] = []
    if ($event.value == -1) {
      newOrder.push(this.data.reorderQuestion) // Move this question to be first
    }
    this.questionsBackup?.forEach(q => {
      if (q.questionID == this.data.reorderQuestion.questionID) {
        return
      }

      newOrder.push(q)
      if (q.questionID == $event.value) {
        newOrder.push(this.data.reorderQuestion)
      }
    })

    this.questions = newOrder
  }

}