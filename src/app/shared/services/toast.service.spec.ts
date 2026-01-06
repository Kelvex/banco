import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { take } from 'rxjs/operators';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit toast with given message, type and duration', (done: DoneFn) => {
    const message = 'Test message';
    const type = 'error';
    const duration = 5000;

    service.toasts$.pipe(take(1)).subscribe(toast => {
      expect(toast.message).toBe(message);
      expect(toast.type).toBe(type);
      expect(toast.duration).toBe(duration);
      done();
    });

    service.showToast(message, type, duration);
  });

  it('should use default type and duration if not provided', (done: DoneFn) => {
    const message = 'Default toast';

    service.toasts$.pipe(take(1)).subscribe(toast => {
      expect(toast.message).toBe(message);
      expect(toast.type).toBe('success'); // default type
      expect(toast.duration).toBe(3000); // default duration
      done();
    });

    service.showToast(message);
  });
});
