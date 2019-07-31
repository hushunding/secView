import { TestBed } from '@angular/core/testing';

import { DBDataService } from './dbdata.service';

describe('DBDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DBDataService = TestBed.get(DBDataService);
    expect(service).toBeTruthy();
  });
});
