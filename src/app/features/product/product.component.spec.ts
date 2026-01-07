import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductComponent } from './product.component';
import { ProductService } from '@services/api/product.service';
import { ToastService } from '@shared-services/toast.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Product } from '@interfaces/data.interface';

describe('ProductComponent', () => {
  let component: ProductComponent;
  let fixture: ComponentFixture<ProductComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockProducts: Product[] = [
    { id: '1', name: 'Producto Uno', description: 'Desc uno', logo: '', date_release: new Date(), date_revision: new Date() },
    { id: '2', name: 'Producto Dos', description: 'Desc dos', logo: '', date_release: new Date(), date_revision: new Date() }
  ];

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj('ProductService', ['getProducts', 'deleteProduct']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showToast']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    productServiceSpy.getProducts.and.returnValue(of(mockProducts));

    await TestBed.configureTestingModule({
      imports: [ProductComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ProductService, useValue: productServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(component).toBeTruthy();
    });

    it('should load products on initialization', () => {
      expect(productServiceSpy.getProducts).toHaveBeenCalled();
      expect(component.products.length).toBe(2);
      expect(component.filteredProducts.length).toBe(2);
    });
  });

  describe('Filtering', () => {
    it('should filter products by text', () => {
      component.filterText = 'uno';
      component.applyFilter();
      expect(component.filteredProducts.length).toBe(1);
      expect(component.filteredProducts[0].name).toContain('Uno');
    });

    it('should respect the pageSize', () => {
      component.pageSize = 1;
      component.applyFilter();
      expect(component.filteredProducts.length).toBe(1);
    });
  });

  describe('Navigation', () => {
    it('should navigate to the form when adding', () => {
      component.onAdd();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/form']);
    });

    it('should navigate to edit product', () => {
      component.onEdit('1');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/form', '1']);
    });
  });

  describe('Deletion', () => {
    it('should show deletion dialog', () => {
      component.onDelete(mockProducts[0]);
      expect(component.showDeleteDialog).toBeTrue();
      expect(component.selectedProductId).toBe('1');
    });

    it('should show toast when deletion is canceled', () => {
      component.selectedProductId = '1';
      component.handleDeleteDecision(false);
      expect(toastServiceSpy.showToast).toHaveBeenCalledWith('Proceso cancelado', 'warning');
    });

    it('should delete product and show toast', () => {
      productServiceSpy.deleteProduct.and.returnValue(of({ message: 'Eliminado' }));
      component.selectedProductId = '1';
      component.deleteProduct();
      expect(productServiceSpy.deleteProduct).toHaveBeenCalledWith('1');
      expect(toastServiceSpy.showToast).toHaveBeenCalledWith('Eliminado', 'success');
      expect(component.products.length).toBe(1);
    });

    it('should show error toast if deletion fails', () => {
      productServiceSpy.deleteProduct.and.returnValue(throwError(() => new Error('Error')));
      component.selectedProductId = '1';
      component.deleteProduct();
      expect(toastServiceSpy.showToast).toHaveBeenCalledWith('Error', 'error');
    });
  });

  describe('Dropdown', () => {
    it('should toggle openDropdown when calling toggleDropdown', () => {
      component.toggleDropdown('abc');
      expect(component.openDropdown).toBe('abc');
      component.toggleDropdown('abc');
      expect(component.openDropdown).toBeNull();
    });
  });

  describe('Filter Change', () => {
    it('should update filterText in onFilterChange', () => {
      const event = { target: { value: 'test' } } as unknown as Event;
      component.onFilterChange(event);
      expect(component.filterText).toBe('test');
    });
  });

  describe('Page Size Change', () => {
    it('should update pageSize and apply filter in onPageSizeChange', () => {
      spyOn(component, 'applyFilter');
      const event = { target: { value: '10' } } as unknown as Event;
      component.onPageSizeChange(event);
      expect(component.pageSize).toBe(10);
      expect(component.applyFilter).toHaveBeenCalled();
    });
  });

  describe('Remove Product', () => {
    it('should remove product from lists with removeProductFromList', () => {
      component.removeProductFromList('1');
      expect(component.products.find(p => p.id === '1')).toBeUndefined();
      expect(component.filteredProducts.find(p => p.id === '1')).toBeUndefined();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ in ngOnDestroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      component.ngOnDestroy();
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
