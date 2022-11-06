import { TestBed } from '@angular/core/testing';

import { QuestionManagerService } from './questionmanager.service';

describe('QuestionmanagerService', () => {
  let service: QuestionManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestionManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
