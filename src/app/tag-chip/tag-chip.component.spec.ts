import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatChipsModule } from '@angular/material/chips';
import { ApiModule } from 'angular-client';

import { TagChipComponent } from './tag-chip.component';

describe('TagChipComponent', () => {
  let component: TagChipComponent;
  let fixture: ComponentFixture<TagChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TagChipComponent],
      imports: [
        ApiModule,
        HttpClientModule,
        MatChipsModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TagChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
