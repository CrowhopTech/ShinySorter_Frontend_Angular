import { TestBed } from '@angular/core/testing';

import { QueryManagerService } from './querymanager.service';

describe('QueryManagerService', () => {
  let service: QueryManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
