import { TestBed } from '@angular/core/testing';

import { BatchActionsService } from './batch-actions.service';

describe('BatchActionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BatchActionsService = TestBed.get(BatchActionsService);
    expect(service).toBeTruthy();
  });
});
