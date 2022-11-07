import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagCreateTileComponent } from './tag-create-tile.component';

describe('TagCreateTileComponent', () => {
  let component: TagCreateTileComponent;
  let fixture: ComponentFixture<TagCreateTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TagCreateTileComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TagCreateTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
