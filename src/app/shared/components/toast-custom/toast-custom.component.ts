import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToastService } from '@shared-services/toast.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'toast-custom',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-custom.component.html',
  styleUrl: './toast-custom.component.css'
})
export class ToastCustomComponent {

  toasts: any[] = [];
  toastSubscription!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    
    this.toastSubscription = this.toastService.toasts$.subscribe(toast => {
      this.toasts.push(toast);
      setTimeout(() => {
        this.removeToast(toast);
      }, toast.duration);
    });
  }

  ngOnDestroy(): void {
    
    if (this.toastSubscription) {
      this.toastSubscription.unsubscribe();
    }
  }

  removeToast(toast: any): void {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

}
