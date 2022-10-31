import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { APIServerService, File } from '../apiserver.service';

export type FileType = "image" | "video" | "unknown"

@Component({
  selector: 'app-fileviewer',
  templateUrl: './fileviewer.component.html',
  styleUrls: ['./fileviewer.component.sass']
})
export class FileviewerComponent implements OnInit {
  file: File | null = null
  fileError: string | undefined = undefined

  private _fileID: string = "";
  imageNotFound: boolean = false;

  @Input() set fileID(value: string) {
    this._fileID = value
    this.apiServer.getFile(value).subscribe({
      next: (file: File) => this.file = file,
      error: (err: any) => {
        this.imageNotFound = false
        if (err instanceof HttpErrorResponse) {
          if (err.status == 404) {
            this.imageNotFound = true
            return
          }
          this.fileError = err.message
        } else {
          this.fileError = err.toString()
        }
      }
    })
  }

  get fileID() {
    return this._fileID
  }

  getFileType(): FileType {
    if (!this.file) {
      return "unknown"
    }
    if (this.file.mimeType.startsWith("video")) {
      return "video"
    }
    if (this.file.mimeType.startsWith("image")) {
      return "image"
    }
    return "unknown"
  }

  constructor(public apiServer: APIServerService) { }

  ngOnInit(): void {

  }

}
