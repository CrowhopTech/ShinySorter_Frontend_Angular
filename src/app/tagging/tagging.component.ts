import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { APIServerService, FileQuery, Question } from '../apiserver.service';

@Component({
  selector: 'app-tagging',
  templateUrl: './tagging.component.html',
  styleUrls: ['./tagging.component.sass']
})
export class TaggingComponent implements OnInit {
  selectedTagsParam = "selectedTags"
  orderingIDParam = "orderingID"

  currentFileID: string | undefined = undefined
  currentFile: File | undefined = undefined
  noMoreFiles: boolean = false
  navigateError: string | undefined = undefined

  private allQuestions: Question[] | undefined = undefined // undefined means hasn't loaded yet, Question[] means all questions loaded
  questionsError: string | undefined = undefined
  currentQuestion: Question | null | undefined = undefined // undefined means hasn't loaded yet, null means we're done (no more questions), Question means current question
  private orderingID: number = -1

  completionPercentage: number | undefined // undefined means hasn't loaded yet, number means we have percentage (out of 100)

  selectedTags: number[] = []
  tagsMap?: Map<number, string> = undefined // Stores the map of tag ID to tag text
  tagsMapErr: string | undefined = undefined

  constructor(public router: Router, private route: ActivatedRoute, public apiServer: APIServerService) { }

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

  private getNumberArrayParam(params: Params, param: string): number[] {
    const val: string[] | string | undefined = params[param]
    switch (typeof (val)) {
      case 'undefined':
        return []
      case 'string':
        if (val.length == 0) {
          return []
        }
        const split = val.split(",")
        return split.map(v => parseInt(v))
      case 'object':
        return val.map(s => parseInt(s))
    }
  }

  establishQuestion() {
    if (!this.allQuestions) {
      // Questions haven't loaded yet, don't do anything
      return
    }
    if (this.orderingID === -1) {
      // Query params haven't loaded yet, don't do anything
      return
    }

    const nextQuestionIndex = this.allQuestions.findIndex(q => q.orderingID >= this.orderingID)
    const nextQuestion = nextQuestionIndex >= 0 ? this.allQuestions[nextQuestionIndex] : undefined
    if (nextQuestion === undefined) {
      // We're done! No more questions
      this.currentQuestion = null
      this.completionPercentage = 100
      return
    }
    if (nextQuestion.orderingID == this.orderingID) {
      // Our ordering ID matches! This is our current question
      this.currentQuestion = nextQuestion
      this.completionPercentage = (nextQuestionIndex / this.allQuestions.length) * 100
      return
    }
    // We're on an ID between questions, let's navigate to the next highest one
    this.router.navigate([`/tag/${this.currentFileID}`], { queryParamsHandling: 'merge', queryParams: { [this.orderingIDParam]: nextQuestion.orderingID } })
  }

  renavigate() {
    this.router.navigate([],
      {
        queryParamsHandling: 'merge',
        queryParams: {
          [this.orderingIDParam]: this.orderingID,
          [this.selectedTagsParam]: this.selectedTags.join(","),
        }
      }
    )
  }

  tagAdded(tag: number) {
    if (!this.selectedTags.some(t => t == tag)) {
      this.selectedTags.push(tag)
    }
    this.renavigate()
  }

  tagRemoved(tag: number) {
    const idx = this.selectedTags.indexOf(tag)
    if (idx == -1) {
      return
    }
    this.selectedTags.splice(idx, 1)
    this.renavigate()
  }

  nextQuestion() {
    if (!this.allQuestions || !this.currentFileID) {
      return
    }

    if (this.orderingID > this.allQuestions[this.allQuestions.length - 1].orderingID) {
      // If we're past the end, let's save this
      // TODO: gracefully handle errors on tagging!
      this.apiServer.tagFile(this.currentFileID, this.selectedTags, true).subscribe(_ => this.router.navigate(['/tag']))
      return
    }

    this.orderingID++
    const maxQuestionID = this.allQuestions[this.allQuestions.length - 1].orderingID
    this.orderingID = Math.min(maxQuestionID + 1, this.orderingID) // 1 over is okay, denotes we're done

    this.renavigate()
  }

  prevQuestion() {
    if (!this.allQuestions) {
      // Questions haven't loaded yet, don't do anything
      return
    }

    const allLowerQuestions = this.allQuestions.filter(q => q.orderingID < this.orderingID)
    if (allLowerQuestions.length == 0) {
      this.router.navigate([], { queryParamsHandling: 'merge', queryParams: { [this.orderingIDParam]: 0 } })
      return
    }
    this.router.navigate([], { queryParamsHandling: 'merge', queryParams: { [this.orderingIDParam]: allLowerQuestions[allLowerQuestions.length - 1].orderingID } })
  }

  skipImage() {
    // TODO: fix this better so we don't have a chance to redirect to the same image again
    //       Maybe add a "not" flag, so we go to any image except that one?
    this.router.navigate(["/tag"])
  }

  ngOnInit(): void {


    this.route.params.subscribe(params => {
      const image = params["image"]

      if (image && image != "") {
        this.currentFileID = image
        return
      }

      this.apiServer.getRandomUntaggedFile().subscribe({
        next: untaggedFile => {
          this.navigateError = undefined
          if (untaggedFile === null) {
            this.noMoreFiles = true
            return
          }

          this.router.navigate([`/tag/${untaggedFile.id}`], { queryParamsHandling: 'preserve' })
        },
        error: (err: any) => {
          this.currentFileID = undefined
          if (err instanceof HttpErrorResponse) {
            this.navigateError = err.message
          } else {
            this.navigateError = err.toString()
          }
        }
      })
    })

    this.route.queryParams.subscribe(queryParams => {
      this.selectedTags = this.getNumberArrayParam(queryParams, this.selectedTagsParam)

      const oid: number = queryParams[this.orderingIDParam]
      if (oid) {
        this.orderingID = oid
      } else {
        this.orderingID = 0 // This marks that query params have loaded, and that ther was no ordering ID
      }

      this.establishQuestion()
    })

    this.apiServer.listQuestions().subscribe({
      next: questions => {
        this.allQuestions = questions

        this.establishQuestion()
      },
      error: (err: any) => {
        this.allQuestions = undefined
        if (err instanceof HttpErrorResponse) {
          this.questionsError = err.message
        } else {
          this.questionsError = err.toString()
        }
      }
    })

    this.apiServer.getTagsMap().subscribe({
      next: tagsMap => this.tagsMap = tagsMap,
      error: (err: any) => {
        this.tagsMap = undefined
        if (err instanceof HttpErrorResponse) {
          this.tagsMapErr = err.message
        } else {
          this.tagsMapErr = err.toString()
        }
      }
    })
  }
}
