import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastSubject = new Subject<any>();
  toasts$ = this.toastSubject.asObservable();

  showToast(message: string, type: string = 'success', duration: number = 3000): void {
    const toast = { message, type, duration };
    this.toastSubject.next(toast);
  }
}
