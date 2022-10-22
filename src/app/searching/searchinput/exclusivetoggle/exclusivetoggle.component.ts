import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { SearchMode } from 'src/app/apiserver.service';

@Component({
  selector: 'app-exclusivetoggle',
  templateUrl: './exclusivetoggle.component.html',
  styleUrls: ['./exclusivetoggle.component.sass']
})
export class ExclusivetoggleComponent implements OnInit {

  @Input() value: SearchMode = "all"

  @Output() valueChanged = new EventEmitter<SearchMode>();

  constructor() { }

  ngOnInit(): void {
  }

  toggleValueChanged(newVal: MatSlideToggleChange): void {
    this.valueChanged.emit(newVal.checked ? "any" : "all")
  }
}
