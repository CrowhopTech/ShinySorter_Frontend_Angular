import { Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { DefaultService as ShinySorterService, FileEntry, QuestionEntry } from 'angular-client';

const imageParam = "image"
const selectedTagsParam = "selectedTags"
const orderingIDParam = "orderingID"

// Responsible for:
// * Managing which question we're on (query params, navigating to next question, etc.)
// * Managing which tags we have selected
// * Giving us info about available/unavailable tags on a given question
@Injectable({
  providedIn: 'root'
})
export class QuestionManagerService {
  private _querySubscription?: Subscription = undefined
  private _restSubscription?: Subscription = undefined

  private _currentFileID?: string = undefined
  public get currentFileID() { return this._currentFileID }
  private _currentFile?: FileEntry = undefined
  public get currentFile() { return this._currentFile }

  private _selectedTags: number[] = []
  public get selectedTags() { return this._selectedTags }

  private _completionPercentage: number = 0
  public get completionPercentage() { return this._completionPercentage }

  private _fetchErr?: string
  public get fetchErr() { return this._fetchErr }

  private _questions?: QuestionEntry[] = undefined
  private _orderingID?: number = undefined
  private _currentQuestion: QuestionEntry | null | undefined = undefined // undefined means hasn't loaded yet, null means we're done (no more questions), Question means current question
  public get currentQuestion() { return this._currentQuestion }

  constructor(private router: Router, private route: ActivatedRoute, private apiService: ShinySorterService) { }

  private getNumberArrayParam(params: Params, param: string): number[] {
    const val: string = params[param]
    if (!val) {
      return []
    }

    const split = val.split(",")
    const parsed = split.map(s => parseInt(s))
    return parsed
  }

  private renavigate() {
    this.router.navigate([],
      {
        queryParamsHandling: 'merge',
        queryParams: {
          [orderingIDParam]: this._orderingID,
          [selectedTagsParam]: this._selectedTags.join(","),
        }
      }
    )
  }

  private wipeVars() {
    // Clear any stale data from past file
    this._currentFileID = undefined
    this._currentFile = undefined
    this._selectedTags = []
    this._questions = undefined
    this._currentQuestion = undefined

    this._fetchErr = undefined
  }

  // Call when navigating to a new file
  public establishFile(fileID: string, orderingID: number = 0) {
    this.wipeVars()

    this._currentFileID = fileID
    this._orderingID = orderingID

    const listQuestions = this.apiService.listQuestions()
    const getFile = this.apiService.getFileById(this._currentFileID)

    if (this._querySubscription) {
      this._querySubscription.unsubscribe()
    }
    // Use combineLatest to wait until the questions have loaded (ignore the value otherwise)
    this._querySubscription = combineLatest([this.route.queryParams, listQuestions]).subscribe(combined => {
      const queryParams = combined[0]
      const questions = combined[1]
      if (!questions) {
        return
      }

      this._selectedTags = this.getNumberArrayParam(queryParams, selectedTagsParam)

      const oid: number = queryParams[orderingIDParam]
      if (oid) {
        this._orderingID = oid
      } else {
        this._orderingID = 0 // This marks that query params have loaded, and that there was no ordering ID
      }

      // Find next highest ordering ID
      const nextQuestionIndex = questions.findIndex(q => this._orderingID != undefined && (q.orderingID ? q.orderingID : 0) >= this._orderingID)
      const nextQuestion = nextQuestionIndex >= 0 ? questions[nextQuestionIndex] : undefined
      if (nextQuestion === undefined) {
        // We're done! No more questions
        this._currentQuestion = null
        this._completionPercentage = 100
        return
      }
      if ((nextQuestion.orderingID ? nextQuestion.orderingID : 0) == this._orderingID) {
        // Our ordering ID matches! This is our current question
        this._currentQuestion = nextQuestion
        this._completionPercentage = (nextQuestionIndex / questions.length) * 100
        return
      }

      // Navigate if not equal, we're on an ID between questions
      this.router.navigate([`/tag`], { queryParamsHandling: 'merge', queryParams: { [orderingIDParam]: nextQuestion.orderingID, [imageParam]: this._currentFileID } })
    })

    if (this._restSubscription) {
      this._restSubscription.unsubscribe()
    }
    this._restSubscription = combineLatest( // Use combineLatest to wait until both have returned at least something
      [listQuestions, getFile]
    ).subscribe({
      next: result => {
        this._fetchErr = undefined

        if (!result[0] || !result[1]) {
          return // Should never happen, but just in case to prevent weirdness
        }

        this._questions = result[0]
        this._currentFile = result[1]

        if (this._currentFile.tags && this._currentFile.tags.length > 0) {
          this._selectedTags = this._currentFile.tags
        }

      },
      error: err => {
        this._fetchErr = err.toString()
      }
    })
  }

  public nextQuestion() {
    if (!this._questions || !this._currentFileID || !this._orderingID) {
      return
    }

    const lastQuestion = this._questions[this._questions.length - 1]

    if (lastQuestion.orderingID && this._orderingID > lastQuestion.orderingID) {
      console.log("Patching file")
      // If we're past the end, let's save this file
      // TODO: gracefully handle errors on tagging!
      // TODO: move this to an external event handler?
      this.apiService.patchFileById(this._currentFileID, {
        tags: this._selectedTags,
        hasBeenTagged: true
      }).subscribe(_ => {
        this.wipeVars()
        this.router.navigate(["/tag"], { queryParams: { [imageParam]: null, [orderingIDParam]: null, [selectedTagsParam]: null } })
      })
      return
    }

    this._orderingID++
    this._orderingID = lastQuestion.orderingID ? Math.min(lastQuestion.orderingID + 1, this._orderingID) : undefined // 1 over is okay, denotes we're done

    this.renavigate()
  }

  public previousQuestion() {
    if (!this._questions || !this._orderingID) {
      // Questions haven't loaded yet, don't do anything
      return
    }

    const allLowerQuestions = this._questions.filter(q => this._orderingID && q.orderingID && q.orderingID < this._orderingID)
    this._orderingID = allLowerQuestions.length > 0 ? allLowerQuestions[allLowerQuestions.length - 1].orderingID : 0

    this.renavigate()
  }

  public addTag(tag: number) {
    if (!this._selectedTags.some(t => t == tag)) {
      this._selectedTags.push(tag)
    }
    this.renavigate()
  }

  public removeTag(tag: number) {
    const idx = this._selectedTags.indexOf(tag)
    if (idx == -1) {
      return
    }
    this._selectedTags.splice(idx, 1)
    this.renavigate()
  }
}
