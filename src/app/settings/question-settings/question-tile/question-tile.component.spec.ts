import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionTileComponent } from './question-tile.component';

describe('QuestionTileComponent', () => {
  let component: QuestionTileComponent;
  let fixture: ComponentFixture<QuestionTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionTileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
