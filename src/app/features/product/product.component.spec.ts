import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductComponent } from './product.component';
import { ProductService } from '@services/api/product.service';
import { ToastService } from '@shared-services/toast.service';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Product } from '@interfaces/data.interface';
import { By } from '@angular/platform-browser';

describe('ProductComponent', () => {
  let component: ProductComponent;
  let fixture: ComponentFixture<ProductComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  const mockProducts: Product[] = [
    { id: '1', name: 'Producto Uno', description: 'Desc uno', logo: '', date_release: new Date(), date_revision: new Date() },
    { id: '2', name: 'Producto Dos', description: 'Desc dos', logo: '', date_release: new Date(), date_revision: new Date() }
  ];

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj('ProductService', ['getProducts', 'deleteProduct']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showToast']);
    productServiceSpy.getProducts.and.returnValue(of(mockProducts));

    await TestBed.configureTestingModule({
      imports: [ProductComponent],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: productServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // 1️⃣ Creación
  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  // 2️⃣ Carga de productos
  it('debería cargar productos al iniciar', () => {
    expect(productServiceSpy.getProducts).toHaveBeenCalled();
    expect(component.products.length).toBe(2);
    expect(component.filteredProducts.length).toBe(2);
  });

  // 3️⃣ Filtro
  it('debería filtrar productos por texto', () => {
    component.filterText = 'uno';
    component.applyFilter();
    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].name).toContain('Uno');
  });

  // 4️⃣ Page size
  it('debería respetar el pageSize', () => {
    component.pageSize = 1;
    component.applyFilter();
    expect(component.filteredProducts.length).toBe(1);
  });

  // 5️⃣ Navegación agregar
  it('debería navegar al formulario al agregar', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.onAdd();
    expect(router.navigate).toHaveBeenCalledWith(['/form']);
  });

  // 6️⃣ Navegación editar
  it('debería navegar al editar producto', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.onEdit('1');
    expect(router.navigate).toHaveBeenCalledWith(['/form', '1']);
  });

  // 7️⃣ Abrir diálogo de eliminación
  it('debería mostrar diálogo de eliminación', () => {
    component.onDelete(mockProducts[0]);
    expect(component.showDeleteDialog).toBeTrue();
    expect(component.selectedProductId).toBe('1');
  });

  // 8️⃣ Cancelar eliminación
  it('debería mostrar toast al cancelar eliminación', () => {
    component.selectedProductId = '1';
    component.handleDeleteDecision(false);
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith('Proceso cancelado', 'warning');
  });

  // 9️⃣ Eliminar producto correctamente
  it('debería eliminar producto y mostrar toast', () => {
    productServiceSpy.deleteProduct.and.returnValue(of({ message: 'Eliminado' }));
    component.selectedProductId = '1';
    component.deleteProduct();
    expect(productServiceSpy.deleteProduct).toHaveBeenCalledWith('1');
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith('Eliminado', 'success');
    expect(component.products.length).toBe(1);
  });

  // 🔟 Error al eliminar
  it('debería mostrar toast de error si falla eliminación', () => {
    productServiceSpy.deleteProduct.and.returnValue(throwError(() => new Error('Error')));
    component.selectedProductId = '1';
    component.deleteProduct();
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith('Error', 'error');
  });

  // 1️⃣1️⃣ toggleDropdown
  it('debería alternar openDropdown al llamar toggleDropdown', () => {
    component.toggleDropdown('abc');
    expect(component.openDropdown).toBe('abc');
    component.toggleDropdown('abc');
    expect(component.openDropdown).toBeNull();
  });

  // 1️⃣2️⃣ onFilterChange
  it('debería actualizar filterText en onFilterChange', () => {
    const event = { target: { value: 'test' } } as unknown as Event;
    component.onFilterChange(event);
    expect(component.filterText).toBe('test');
  });

  // 1️⃣3️⃣ onPageSizeChange
  it('debería actualizar pageSize y aplicar filtro en onPageSizeChange', () => {
    spyOn(component, 'applyFilter');
    const event = { target: { value: '10' } } as unknown as Event;
    component.onPageSizeChange(event);
    expect(component.pageSize).toBe(10);
    expect(component.applyFilter).toHaveBeenCalled();
  });

  // 1️⃣4️⃣ removeProductFromList
  it('debería eliminar producto de las listas con removeProductFromList', () => {
    component.removeProductFromList('1');
    expect(component.products.find(p => p.id === '1')).toBeUndefined();
    expect(component.filteredProducts.find(p => p.id === '1')).toBeUndefined();
  });

  // 1️⃣5️⃣ ngOnDestroy
  it('debería completar destroy$ en ngOnDestroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
