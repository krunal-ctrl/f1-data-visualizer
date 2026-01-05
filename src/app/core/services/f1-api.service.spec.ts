import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { F1ApiService } from './f1-api.service';
import { environment } from '../../../environments/environment';

describe('F1ApiService', () => {
  let service: F1ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [F1ApiService, provideHttpClientTesting()]
    });
    service = TestBed.inject(F1ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

})