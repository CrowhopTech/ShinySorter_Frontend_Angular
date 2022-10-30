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

  private _fileID: string = "";
  imageNotFound: boolean = false;

  @Input() set fileID(value: string) {
    this._fileID = value
    this.apiServer.getFile(value).subscribe({
      next: (file: File) => this.file = file,
      error: (err: any) => {
        if (!(err instanceof HttpErrorResponse)) {
          throw err
        }

        const httpErr = err as HttpErrorResponse
        this.imageNotFound = (httpErr.status == 404)
      },
      complete: () => { }
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
