import { TestBed } from '@angular/core/testing';

import { APIServerService } from './apiserver.service';

describe('ApiserverService', () => {
  let service: APIServerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(APIServerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
