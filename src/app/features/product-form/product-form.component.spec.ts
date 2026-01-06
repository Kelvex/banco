import {
  ComponentFixture,
  TestBed,
  discardPeriodicTasks,
  fakeAsync,
  flush,
  flushMicrotasks,
  tick,
} from '@angular/core/testing';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '@services/api/product.service';
import { ToastService } from '@shared-services/toast.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Product } from '@interfaces/data.interface';
import { Validators } from '@angular/forms';

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

  // 1️⃣ Creación
  it('debería crearse', () => {
    createComponentWithRoute(null);
    expect(component).toBeTruthy();
  });

  // 2️⃣ Inicialización formulario
  it('debería inicializar el formulario', () => {
    createComponentWithRoute(null);
    expect(component.form).toBeTruthy();
    expect(component.form.get('id')).toBeTruthy();
  });

  // 3️⃣ Modo crear
  it('debería estar en modo crear si no hay id', () => {
    createComponentWithRoute(null);
    expect(component.isEditMode).toBeFalse();
    expect(component.form.get('id')?.enabled).toBeTrue();
  });

  // 4️⃣ Modo editar
  it('debería cargar producto en modo edición', () => {
    productServiceSpy.getProductById.and.returnValue(of(mockProduct));

    createComponentWithRoute('ABC123');

    expect(component.isEditMode).toBeTrue();
    expect(productServiceSpy.getProductById).toHaveBeenCalledWith('ABC123');
    expect(component.form.get('name')?.value).toBe('Producto Test');
  });

  it('debería marcar error si el ID ya existe', fakeAsync(() => {
    productServiceSpy.verifyProductName.and.returnValue(of(true));
    createComponentWithRoute(null);

    const control = component.form.get('id')!;
    control.setValue('ABC123');

    tick(400);
    fixture.destroy();

    expect(control.errors).toEqual({ idAlreadyExists: true });
  }));

  // 6️⃣ Fecha de revisión automática
  it('debería calcular la fecha de revisión', () => {
    createComponentWithRoute(null);

    component.form.get('date_release')?.setValue('2025-01-01');
    component.onDateReleaseChange();

    expect(component.form.get('date_revision')?.value).toBe('2026-01-01');
  });

  // 8️⃣ Submit editar producto
  it('debería actualizar producto en modo edición', () => {
    productServiceSpy.getProductById.and.returnValue(of(mockProduct));
    productServiceSpy.putProduct.and.returnValue(
      of({ message: 'Actualizado', data: mockProduct })
    );

    createComponentWithRoute('ABC123');

    component.submit();

    expect(productServiceSpy.putProduct).toHaveBeenCalled();
    expect(toastSpy.showToast).toHaveBeenCalledWith('Actualizado', 'success');
  });

  // 🔟 Reset
  it('debería resetear el formulario', () => {
    createComponentWithRoute(null);

    component.form.patchValue({ name: 'Algo' });
    component.resetForm();

    expect(component.form.value.name).toBeNull();
  });

  // -------------------- VALIDADORES ASÍNC / DATE --------------------
  it('debería marcar idAlreadyExists en idAsyncValidator', fakeAsync(() => {
    productServiceSpy.verifyProductName.and.returnValue(of(true));
    createComponentWithRoute(null);

    const control = component.form.get('id')!;
    control.setValue('EXISTING');

    tick(400);
    fixture.detectChanges();

    expect(control.errors).toEqual({ idAlreadyExists: true });

    discardPeriodicTasks();
  }));

  it('submit crea producto si el formulario es válido en modo crear', fakeAsync(() => {
    
    productServiceSpy.verifyProductName = jasmine
      .createSpy()
      .and.returnValue(of(false));

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

  it('dateReleaseValidator acepta fechas válidas', () => {
    createComponentWithRoute(null);

    const today = new Date();
    const control = component.form.get('date_release')!;
    control.setValue(today.toISOString().split('T')[0]);

    const validator = component.dateReleaseValidator();
    expect(validator(control)).toBeNull();
  });

  it('dateReleaseValidator rechaza fechas pasadas', () => {
    createComponentWithRoute(null);

    const past = new Date();
    past.setDate(past.getDate() - 1);
    const control = component.form.get('date_release')!;
    control.setValue(past.toISOString().split('T')[0]);

    const validator = component.dateReleaseValidator();
    expect(validator(control)).toEqual({ invalidDateRelease: true });
  });

  it('dateReleaseValidator rechaza fechas inválidas', () => {
    createComponentWithRoute(null);

    const control = component.form.get('date_release')!;
    control.setValue('invalid-date');

    const validator = component.dateReleaseValidator();
    expect(validator(control)).toEqual({ invalidDateRelease: true });
  });

  // -------------------- capitalizeFirstLetter --------------------
  it('capitalizeFirstLetter capitaliza correctamente', () => {
    createComponentWithRoute(null);
    expect(component.capitalizeFirstLetter('test')).toBe('Test');
    expect(component.capitalizeFirstLetter('')).toBe('');
  });

  // -------------------- submit EDITAR --------------------
  it('submit actualiza producto si el formulario es válido en modo edición', fakeAsync(() => {
    productServiceSpy.getProductById.and.returnValue(of(mockProduct));
    productServiceSpy.putProduct.and.returnValue(
      of({ message: 'Actualizado', data: mockProduct })
    );

    createComponentWithRoute('ABC123');

    component.submit();

    expect(productServiceSpy.putProduct).toHaveBeenCalled();
    expect(toastSpy.showToast).toHaveBeenCalledWith('Actualizado', 'success');
  }));

  // -------------------- submit INVALIDO --------------------
  it('submit marca todos los controles como touched si es inválido', () => {
    createComponentWithRoute(null);

    component.submit();

    Object.values(component.form.controls).forEach((ctrl) => {
      expect(ctrl.touched).toBeTrue();
    });
  });

  it('createProduct muestra toast de error si falla', fakeAsync(() => {
    productServiceSpy.verifyProductName = jasmine
      .createSpy()
      .and.returnValue(of(false));

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

  it('updateProduct muestra toast de error si falla', fakeAsync(() => {
    productServiceSpy.getProductById.and.returnValue(of(mockProduct));
    productServiceSpy.putProduct.and.returnValue(
      throwError(() => new Error('Error actualización'))
    );
    createComponentWithRoute('ABC123');

    component.submit();

    expect(toastSpy.showToast).toHaveBeenCalledWith(
      'Error actualización',
      'error'
    );
  }));

  it('getErrorMessages devuelve mensajes correctos para errores conocidos', () => {
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

  it('getErrorMessages devuelve mensajes para errores personalizados', () => {
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

  it('getErrorMessages devuelve mensaje genérico para errores desconocidos', () => {
    createComponentWithRoute(null);
    const control = component.form.get('name')!;
    control.setErrors({ customError: true });
    expect(component.getErrorMessages('name')).toEqual(['Name no es válido']);
  });
});
