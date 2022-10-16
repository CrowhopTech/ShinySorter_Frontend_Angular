import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tagging',
  templateUrl: './tagging.component.html',
  styleUrls: ['./tagging.component.sass']
})
export class TaggingComponent implements OnInit {
  constructor(public router: Router) { }

  ngOnInit(): void { }
}
