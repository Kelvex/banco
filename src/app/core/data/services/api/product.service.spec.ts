import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '@interfaces/data.interface';
import { ApiSuccess } from '@interfaces/api-success.interface';
import { ApiError } from '@interfaces/api-error.interface';
import { environment } from 'src/environment/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const API_URL = environment.API_URL;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  // ===== getProducts =====
  it('debería devolver un array de productos', () => {
    const mockProducts: Product[] = [
      { id: '1', name: 'Producto 1', description: 'Desc', logo: '', date_release: new Date(), date_revision: new Date() }
    ];

    service.getProducts().subscribe(products => {
      expect(products.length).toBe(1);
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne(`${API_URL}/products`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockProducts });
  });

  // ===== getProductById =====
  it('debería devolver un producto por id', () => {
    const mockProduct: Product = { id: '1', name: 'Producto 1', description: 'Desc', logo: '', date_release: new Date(), date_revision: new Date() };

    service.getProductById('1').subscribe(product => {
      expect(product).toEqual(mockProduct);
    });

    const req = httpMock.expectOne(`${API_URL}/products/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  it('debería devolver null si hay error', () => {
    service.getProductById('999').subscribe(product => {
      expect(product).toBeNull();
    });

    const req = httpMock.expectOne(`${API_URL}/products/999`);
    req.error(new ErrorEvent('Not Found'), { status: 404 });
  });

  // ===== postProduct =====
  it('debería crear un producto y devolver ApiSuccess', () => {
    const newProduct: Product = { id: '2', name: 'Producto 2', description: 'Desc', logo: '', date_release: new Date(), date_revision: new Date() };
    const response: ApiSuccess<Product> = { message: 'Creado', data: newProduct };

    service.postProduct(newProduct).subscribe(res => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(`${API_URL}/products`);
    expect(req.request.method).toBe('POST');
    req.flush(response);
  });

  it('debería manejar error 400 en postProduct', () => {
    const newProduct: Product = { id: '2', name: 'Producto 2', description: 'Desc', logo: '', date_release: new Date(), date_revision: new Date() };
    const apiError: ApiError = { message: 'Error', name: 'BadRequest', errors: [] };

    service.postProduct(newProduct).subscribe({
      next: () => fail('Debe fallar con error'),
      error: (err) => expect(err.message).toBe('Error')
    });

    const req = httpMock.expectOne(`${API_URL}/products`);
    req.flush(apiError, { status: 400, statusText: 'Bad Request' });
  });

  // ===== putProduct =====
  it('debería actualizar un producto', () => {
    const product: Product = { id: '1', name: 'Producto 1', description: 'Desc', logo: '', date_release: new Date(), date_revision: new Date() };
    const response: ApiSuccess<Product> = { message: 'Actualizado', data: product };

    service.putProduct(product).subscribe(res => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(`${API_URL}/products/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(response);
  });

  it('debería manejar error 400 en putProduct', () => {
    const product: Product = { id: '1', name: 'Producto 1', description: 'Desc', logo: '', date_release: new Date(), date_revision: new Date() };
    const apiError: ApiError = { message: 'Error', name: 'BadRequest', errors: [] };

    service.putProduct(product).subscribe({
      next: () => fail('Debe fallar con error'),
      error: (err) => expect(err.message).toBe('Error')
    });

    const req = httpMock.expectOne(`${API_URL}/products/1`);
    req.flush(apiError, { status: 400, statusText: 'Bad Request' });
  });

  // ===== deleteProduct =====
  it('debería eliminar un producto', () => {
    const response = { message: 'Eliminado' };

    service.deleteProduct('1').subscribe(res => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(`${API_URL}/products/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(response);
  });

  it('debería manejar error 400 en deleteProduct', () => {
    const apiError: ApiError = { message: 'Error', name: 'BadRequest', errors: [] };

    service.deleteProduct('1').subscribe({
      next: () => fail('Debe fallar con error'),
      error: (err) => expect(err.message).toBe('Error')
    });

    const req = httpMock.expectOne(`${API_URL}/products/1`);
    req.flush(apiError, { status: 400, statusText: 'Bad Request' });
  });

  // ===== verifyProductName =====
  it('debería verificar si el nombre existe', () => {
    service.verifyProductName('1').subscribe(exists => {
      expect(exists).toBeTrue();
    });

    const req = httpMock.expectOne(`${API_URL}/products/verification/1`);
    expect(req.request.method).toBe('GET');
    req.flush(true);
  });

  it('debería devolver false si no existe', () => {
    service.verifyProductName('999').subscribe(exists => {
      expect(exists).toBeFalse();
    });

    const req = httpMock.expectOne(`${API_URL}/products/verification/999`);
    expect(req.request.method).toBe('GET');
    req.flush(false);
  });

});
