import {
  ComponentFixture,
  TestBed,
  discardPeriodicTasks,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '@services/api/product.service';
import { ToastService } from '@shared-services/toast.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Product } from '@interfaces/data.interface';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  const mockProduct: Product = {
    id: 'ABC123',
    name: 'Producto Test',
    description: 'Descripción válida de producto',
    logo: 'logo.png',
    date_release: new Date(),
    date_revision: new Date(),
  };

  function createComponentWithRoute(id: string | null) {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: {
        snapshot: {
          paramMap: {
            get: () => id,
          },
        },
      },
    });

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj('ProductService', [
      'getProductById',
      'verifyProductName',
      'postProduct',
      'putProduct',
    ]);

    toastSpy = jasmine.createSpyObj('ToastService', ['showToast']);

    await TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: ToastService, useValue: toastSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => null },
            },
          },
        },
      ],
    }).compileComponents();
  });

  // ------------------- INICIALIZACIÓN -------------------
  describe('Initialization', () => {
    it('should be created', () => {
      createComponentWithRoute(null);
      expect(component).toBeTruthy();
    });

    it('should initialize the form', () => {
      createComponentWithRoute(null);
      expect(component.form).toBeTruthy();
      expect(component.form.get('id')).toBeTruthy();
    });

    it('should be in create mode if there is no id', () => {
      createComponentWithRoute(null);
      expect(component.isEditMode).toBeFalse();
      expect(component.form.get('id')?.enabled).toBeTrue();
    });
  });

  // ------------------- MODO EDICIÓN -------------------
  describe('Edit Mode', () => {
    it('should load product in edit mode', () => {
      productServiceSpy.getProductById.and.returnValue(of(mockProduct));

      createComponentWithRoute('ABC123');

      expect(component.isEditMode).toBeTrue();
      expect(productServiceSpy.getProductById).toHaveBeenCalledWith('ABC123');
      expect(component.form.get('name')?.value).toBe('Producto Test');
    });

    it('should update product in edit mode', () => {
      productServiceSpy.getProductById.and.returnValue(of(mockProduct));
      productServiceSpy.putProduct.and.returnValue(
        of({ message: 'Actualizado', data: mockProduct })
      );

      createComponentWithRoute('ABC123');

      component.submit();

      expect(productServiceSpy.putProduct).toHaveBeenCalled();
      expect(toastSpy.showToast).toHaveBeenCalledWith('Actualizado', 'success');
    });
  });

  // ------------------- VALIDADORES -------------------
  describe('Validators', () => {
    it('should mark error if the ID already exists', fakeAsync(() => {
      productServiceSpy.verifyProductName.and.returnValue(of(true));
      createComponentWithRoute(null);

      const control = component.form.get('id')!;
      control.setValue('ABC123');

      tick(400);
      fixture.detectChanges();

      expect(control.errors).toEqual({ idAlreadyExists: true });
      discardPeriodicTasks();
    }));

    it('should mark idAlreadyExists in idAsyncValidator', fakeAsync(() => {
      productServiceSpy.verifyProductName.and.returnValue(of(true));
      createComponentWithRoute(null);

      const control = component.form.get('id')!;
      control.setValue('EXISTING');

      tick(400);
      fixture.detectChanges();

      expect(control.errors).toEqual({ idAlreadyExists: true });
      discardPeriodicTasks();
    }));

    it('should calculate the revision date', () => {
      createComponentWithRoute(null);

      component.form.get('date_release')?.setValue('2025-01-01');
      component.onDateReleaseChange();

      expect(component.form.get('date_revision')?.value).toBe('2026-01-01');
    });
  });

  // ------------------- FUNCIONES DE PRODUCTO -------------------
  describe('Product Operations', () => {
    it('should create product if the form is valid in create mode', fakeAsync(() => {
      productServiceSpy.verifyProductName = jasmine.createSpy().and.returnValue(of(false));

      const mockResponse = { message: 'Creado', data: mockProduct };
      productServiceSpy.postProduct.and.returnValue(of(mockResponse));

      createComponentWithRoute(null);

      component.form.patchValue({
        id: 'ABC123',
        name: 'Producto Test',
        description: 'Descripción válida de producto',
        logo: 'logo.png',
        date_release: new Date(),
        date_revision: new Date(),
      });

      component.submit();

      tick();
      fixture.detectChanges();

      expect(productServiceSpy.postProduct).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: 'ABC123',
          name: 'Producto Test',
          description: 'Descripción válida de producto',
          logo: 'logo.png',
          date_release: new Date(),
          date_revision: new Date(),
        })
      );

      expect(toastSpy.showToast).toHaveBeenCalledWith('Creado', 'success');

      flush();
      fixture.destroy();
    }));

    it('createProduct shows error toast if it fails', fakeAsync(() => {
      productServiceSpy.verifyProductName = jasmine.createSpy().and.returnValue(of(false));

      productServiceSpy.postProduct.and.returnValue(
        throwError(() => new Error('Error creación'))
      );

      createComponentWithRoute(null);

      component.form.patchValue({
        id: 'ABC123',
        name: 'Producto Test',
        description: 'Descripción válida de producto',
        logo: 'logo.png',
        date_release: new Date(),
        date_revision: new Date(),
      });

      component.submit();

      tick();
      fixture.detectChanges();

      expect(toastSpy.showToast).toHaveBeenCalledWith('Error creación', 'error');
      flush();
      fixture.destroy();
    }));
  });

  // ------------------- RESET FORM -------------------
  describe('Form Reset', () => {
    it('should reset the form', () => {
      createComponentWithRoute(null);

      component.form.patchValue({ name: 'Algo' });
      component.resetForm();

      expect(component.form.value.name).toBeNull();
    });
  });

  // ------------------- VALIDACIÓN DE FECHAS -------------------
  describe('Date Validators', () => {
    it('dateReleaseValidator accepts valid dates', () => {
      createComponentWithRoute(null);

      const today = new Date();
      const control = component.form.get('date_release')!;
      control.setValue(today.toISOString().split('T')[0]);

      const validator = component.dateReleaseValidator();
      expect(validator(control)).toBeNull();
    });

    it('dateReleaseValidator rejects invalid dates', () => {
      createComponentWithRoute(null);

      const control = component.form.get('date_release')!;
      control.setValue('invalid-date');

      const validator = component.dateReleaseValidator();
      expect(validator(control)).toEqual({ invalidDateRelease: true });
    });
  });

  // ------------------- ERROR MESSAGES -------------------
  describe('Error Messages', () => {
    it('getErrorMessages returns correct messages for known errors', () => {
      createComponentWithRoute(null);
      const control = component.form.get('name')!;
      control.setErrors({ required: true });
      expect(component.getErrorMessages('name')).toEqual(['Name es obligatorio']);
      control.setErrors({ minlength: { requiredLength: 5, actualLength: 2 } });
      expect(component.getErrorMessages('name')).toEqual([
        'Name debe tener al menos 5 caracteres',
      ]);
      control.setErrors({ maxlength: { requiredLength: 10, actualLength: 12 } });
      expect(component.getErrorMessages('name')).toEqual([
        'Name debe tener máximo 10 caracteres',
      ]);
    });

    it('getErrorMessages returns messages for custom errors', () => {
      createComponentWithRoute(null);
      const idControl = component.form.get('id')!;
      idControl.setErrors({ idAlreadyExists: true });
      expect(component.getErrorMessages('id')).toEqual(['Este ID ya existe']);
      const dateControl = component.form.get('date_release')!;
      dateControl.setErrors({ invalidDateRelease: true });
      expect(component.getErrorMessages('date_release')).toEqual([
        'La fecha debe ser igual o posterior a la fecha actual',
      ]);
    });

    it('getErrorMessages returns generic message for unknown errors', () => {
      createComponentWithRoute(null);
      const control = component.form.get('name')!;
      control.setErrors({ customError: true });
      expect(component.getErrorMessages('name')).toEqual(['Name no es válido']);
    });
  });
});
