import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '@services/api/product.service';
import { Observable, of, Subject } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ButtonCustomComponent } from "@components/button-custom/button-custom.component";
import { ToastService } from '@shared-services/toast.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, ButtonCustomComponent],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  errorMessage: string = '';
  isEditMode: boolean = false;
  productId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;

    this.form = this.fb.group({
      id: [
        { value: '', disabled: this.isEditMode }, 
        [Validators.required, Validators.minLength(3), Validators.maxLength(10)], 
        this.isEditMode ? [] : [this.idAsyncValidator()]
      ],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', Validators.required],
      date_release: ['', [Validators.required, this.dateReleaseValidator()]],
      date_revision: [{ value: '', disabled: true }, [Validators.required]]
    });

    if (this.isEditMode && this.productId) {
      this.loadProduct(this.productId);
    }

    // Debounce para idAsyncValidator, evita llamadas innecesarias al servicio
    if (!this.isEditMode) {
      this.form.get('id')?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ).subscribe(() => this.form.get('id')?.updateValueAndValidity({ onlySelf: true }));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProduct(id: string) {
    this.productService.getProductById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (product) => {
        if (!product) return;

        this.form.patchValue({
          id: product.id,
          name: product.name,
          description: product.description,
          logo: product.logo,
          date_release: product.date_release,
          date_revision: product.date_revision
        });
      },
      error: (err) => {
        const msg = err?.message || 'Error al cargar el producto';
        this.errorMessage = msg;
      }
    });
  }

  idAsyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);

      return this.productService.verifyProductName(control.value).pipe(
        map((exists: boolean) => exists ? { idAlreadyExists: true } : null),
        catchError(() => of(null))
      );
    };
  }

  dateReleaseValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(control.value);
      if (isNaN(selectedDate.getTime())) return { invalidDateRelease: true };

      const todayStr = today.toISOString().split('T')[0];
      const selectedDateStr = selectedDate.toISOString().split('T')[0];

      return selectedDateStr < todayStr ? { invalidDateRelease: true } : null;
    };
  }

  onDateReleaseChange() {
    const releaseDateValue = this.form.get('date_release')?.value;
    if (releaseDateValue) {
      const releaseDate = new Date(releaseDateValue);
      const revisionDate = new Date(releaseDate);
      revisionDate.setFullYear(revisionDate.getFullYear() + 1);
      this.form.get('date_revision')?.setValue(revisionDate.toISOString().split('T')[0]);
    } else {
      this.form.get('date_revision')?.setValue(null);
    }
  }

  getErrorMessages(controlName: string): string[] {
    const control = this.form.get(controlName);
    if (!control || !control.errors) return [];

    const messages: string[] = [];
    const errors = control.errors;

    Object.keys(errors).forEach((errorKey) => {
      switch (errorKey) {
        case 'required':
          messages.push(`${this.capitalizeFirstLetter(controlName)} es obligatorio`);
          break;
        case 'minlength':
          messages.push(`${this.capitalizeFirstLetter(controlName)} debe tener al menos ${errors['minlength'].requiredLength} caracteres`);
          break;
        case 'maxlength':
          messages.push(`${this.capitalizeFirstLetter(controlName)} debe tener máximo ${errors['maxlength'].requiredLength} caracteres`);
          break;
        case 'invalidDateRelease':
          messages.push('La fecha debe ser igual o posterior a la fecha actual');
          break;
        case 'idAlreadyExists':
          messages.push('Este ID ya existe');
          break;
        default:
          messages.push(`${this.capitalizeFirstLetter(controlName)} no es válido`);
          break;
      }
    });

    return messages;
  }


  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  submit() {
    this.form.get('date_revision')?.enable();

    if (this.form.valid) {
      if (this.isEditMode) {
        this.form.get('id')?.enable();
        this.updateProduct();
        this.form.get('id')?.disable();
      } else {
        this.createProduct();
      }
    } else {
      this.form.markAllAsTouched();
    }

    this.form.get('date_revision')?.disable();
  }

  private createProduct() {
    this.productService.postProduct(this.form.value).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => this.toastService.showToast(data.message, 'success'),
      error: (err) => {
        const msg = err?.message || 'Error al crear el producto';
        this.toastService.showToast(msg, 'error');
      }
    });
  }

  private updateProduct() {
    this.productService.putProduct(this.form.value).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => this.toastService.showToast(data.message, 'success'),
      error: (err) => {
        const msg = err?.message || 'Error al actualizar el producto';
        this.toastService.showToast(msg, 'error');
      }
    });
  }

  resetForm() {
    this.form.reset();
  }
}
