import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastCustomComponent } from './toast-custom.component';
import { ToastService } from '@shared-services/toast.service';
import { of, Subject } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ToastCustomComponent', () => {
  let component: ToastCustomComponent;
  let fixture: ComponentFixture<ToastCustomComponent>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let toastSubject: Subject<any>;

  beforeEach(async () => {
    toastSubject = new Subject<any>();

    toastServiceSpy = jasmine.createSpyObj('ToastService', [], { toasts$: toastSubject.asObservable() });

    await TestBed.configureTestingModule({
      imports: [ToastCustomComponent],
      providers: [{ provide: ToastService, useValue: toastServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---------------------- INICIALIZACIÓN ----------------------
  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  // ---------------------- GESTIÓN DE TOASTS ----------------------
  describe('Toast Management', () => {
    it('should add toast when toastService emits', () => {
      const toast = { message: 'Test toast', type: 'success', duration: 3000 };
      toastSubject.next(toast);

      expect(component.toasts.length).toBe(1);
      expect(component.toasts[0]).toEqual(toast);
    });

    it('should remove toast after duration', fakeAsync(() => {
      const toast = { message: 'Auto remove', type: 'success', duration: 1000 };
      toastSubject.next(toast);

      expect(component.toasts.length).toBe(1);

      tick(1000);
      expect(component.toasts.length).toBe(0);
    }));

    it('should remove toast manually when removeToast is called', () => {
      const toast = { message: 'Manual remove', type: 'error', duration: 5000 };
      component.toasts.push(toast);

      component.removeToast(toast);
      expect(component.toasts.length).toBe(0);
    });

    it('should remove toast when close button is clicked', () => {
      const toast = { message: 'Click remove', type: 'info', duration: 5000 };
      component.toasts.push(toast);
      fixture.detectChanges();

      const closeButton = fixture.debugElement.query(By.css('.toast__close'));
      closeButton.triggerEventHandler('click', null);

      expect(component.toasts.length).toBe(0);
    });
  });

  // ---------------------- LIMPIEZA (DESTRUCCIÓN) ----------------------
  describe('Cleanup', () => {
    it('should unsubscribe from toastService on destroy', () => {
      spyOn(component.toastSubscription, 'unsubscribe');

      component.ngOnDestroy();

      expect(component.toastSubscription.unsubscribe).toHaveBeenCalled();
    });
  });
});
