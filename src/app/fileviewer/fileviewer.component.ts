import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { APIUtilityService } from '../apiutility.service';
import { SupabaseService, TaggedFileEntry } from '../supabase.service';

export type FileType = "image" | "video" | "unknown"

@Component({
  selector: 'app-fileviewer',
  templateUrl: './fileviewer.component.html',
  styleUrls: ['./fileviewer.component.sass']
})
export class FileviewerComponent implements OnInit {
  file: TaggedFileEntry | null = null
  fileError: string | undefined = undefined

  private _fileID: number = 0;
  imageNotFound: boolean = false;

  private _fileIDChanged: EventEmitter<number> = new EventEmitter<number>();

  @Input() set fileID(value: number) {
    this._fileID = value
    this._fileIDChanged.next(value)
  }

  get fileID() {
    return this._fileID
  }

  getFileType(): FileType {
    if (!this.file || !this.file.mimeType) {
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

  constructor(public apiUtility: APIUtilityService, public supaService: SupabaseService) {
    this._fileIDChanged.subscribe(async (value: number) => {
      const { data, error } = await this.supaService.getFileByID(value)
      if (error) {
        this.imageNotFound = false
        if (error instanceof HttpErrorResponse) {
          if (error.status == 404) {
            this.imageNotFound = true
            return
          }
          this.fileError = error.message
        } else {
          this.fileError = error.toString()
        }
        return
      }
      if (data as TaggedFileEntry) {
        this.file = data
      }
    })
  }

  ngOnInit(): void {
    this.apiUtility.updateTagCache()
  }
}
