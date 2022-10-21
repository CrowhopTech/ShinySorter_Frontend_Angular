import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-exclusivetoggle',
  templateUrl: './exclusivetoggle.component.html',
  styleUrls: ['./exclusivetoggle.component.sass']
})
export class ExclusivetoggleComponent implements OnInit {

  @Input() value: "all" | "any" = "all"

  @Output() valueChanged = new EventEmitter<"all" | "any">();

  constructor() { }

  ngOnInit(): void {
  }

  toggleValueChanged(newVal: MatSlideToggleChange): void {
    this.valueChanged.emit(newVal.checked ? "any" : "all")
  }
}
