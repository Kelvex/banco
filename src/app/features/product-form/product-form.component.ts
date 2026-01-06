import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '@services/api/product.service';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime } from 'rxjs/operators';
import { ButtonCustomComponent } from "@components/button-custom/button-custom.component";
import { ToastService } from '@shared-services/toast.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, ButtonCustomComponent],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  errorMessage: string = '';
  isEditMode: boolean = false;
  productId: string | null = null;

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
      id: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)], this.isEditMode ? [] : [this.idAsyncValidator()]],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', Validators.required],
      date_release: ['', [Validators.required, this.dateReleaseValidator()]],
      date_revision: ['', [Validators.required]]
    });

    if (this.isEditMode && this.productId) {
      this.loadProduct(this.productId);
    }

    this.form.get('date_revision')?.disable();
  }

  loadProduct(id: string) {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.form.patchValue({
          id: product?.id,
          name: product?.name,
          description: product?.description,
          logo: product?.logo,
          date_release: product?.date_release,
          date_revision: product?.date_revision
        });
        this.form.get('id')?.disable();
      },
      error: (err) => {
        this.errorMessage = err.message;
        console.error('Error al cargar el producto:', err);
      },
    });
  }

  idAsyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return this.productService.verifyProductName(control.value).pipe(
        debounceTime(300),
        map((exists: boolean) => {
          return exists ? { idAlreadyExists: true } : null;
        }),
        catchError(() => of(null))
      );
    };
  }

  dateReleaseValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(control.value);
      if (isNaN(selectedDate.getTime())) {
        return { invalidDateRelease: true };
      }

      const todayStr = today.toISOString().split('T')[0];
      const selectedDateStr = selectedDate.toISOString().split('T')[0];

      if (selectedDateStr < todayStr) {
        return { invalidDateRelease: true };
      }

      return null;
    };
  }

  onDateReleaseChange() { 
    const releaseDateValue = this.form.get('date_release')?.value;
    if (releaseDateValue) {
      const releaseDate = new Date(releaseDateValue);
      const revisionDate = new Date(releaseDate);
      revisionDate.setFullYear(revisionDate.getFullYear() + 1);
      const revisionDateStr = revisionDate.toISOString().split('T')[0];
      this.form.get('date_revision')?.setValue(revisionDateStr);
    } else {
      this.form.get('date_revision')?.setValue(null);
    }
  }

  // Función dinámica que devuelve los mensajes de error
  getErrorMessages(controlName: string): string[] {
    const control = this.form.get(controlName);

    if (!control) return [];

    const errors = control.errors;
    const errorMessages: string[] = [];

    if (errors) {
      if (errors['required']) {
        errorMessages.push(`${this.capitalizeFirstLetter(controlName)} es obligatorio`);
      }
      if (errors['minlength']) {
        errorMessages.push(`${this.capitalizeFirstLetter(controlName)} debe tener al menos ${errors['minlength'].requiredLength} caracteres`);
      }
      if (errors['maxlength']) {
        errorMessages.push(`${this.capitalizeFirstLetter(controlName)} debe tener máximo ${errors['maxlength'].requiredLength} caracteres`);
      }
      if (errors['invalidDateRelease']) {
        errorMessages.push('La fecha debe ser igual o posterior a la fecha actual');
      }
      if (errors['idAlreadyExists']) {
        errorMessages.push('Este ID ya existe');
      }
      // Agregar otros errores si es necesario
    }

    return errorMessages;
  }

  // Función para capitalizar la primera letra de un string (por ejemplo, 'id' -> 'Id')
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
    this.productService.postProduct(this.form.value).subscribe({
      next: (data) => {
        this.toastService.showToast(data.message, 'success');
      },
      error: (err) => {
        this.toastService.showToast(err.message, 'error');
      }
    });
  }

  private updateProduct() {
    this.productService.putProduct(this.form.value).subscribe({
      next: () => console.log('Producto actualizado exitosamente'),
      error: (err) => {
        this.errorMessage = err.message;
        console.error('Error al actualizar producto:', err);
      }
    });
  }

  resetForm() {
    this.form.reset();
  }
}
