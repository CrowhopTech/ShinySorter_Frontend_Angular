import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-searching',
  templateUrl: './searching.component.html',
  styleUrls: ['./searching.component.sass']
})
export class SearchingComponent implements OnInit {
  constructor(public router: Router) { }

  ngOnInit(): void { }
}
