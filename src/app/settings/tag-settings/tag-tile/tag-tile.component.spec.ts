import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagTileComponent } from './tag-tile.component';

describe('TagTileComponent', () => {
  let component: TagTileComponent;
  let fixture: ComponentFixture<TagTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagTileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
