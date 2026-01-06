import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiError } from '@interfaces/api-error.interface';
import { ApiResponseBase } from '@interfaces/api-response-base.interface';
import { ApiSuccess } from '@interfaces/api-success.interface';
import { Product } from '@interfaces/data.interface';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private API_URL = environment.API_URL;

  constructor(
    private http: HttpClient,
  ) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<{ data: Product[] }>(`${this.API_URL}/products`)
      .pipe(
        map((response: { data: any; }) => response.data)
      );
 }

  getProductById(id: string): Observable<Product | null> {
    return this.http.get<Product>(`${this.API_URL}/products/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  postProduct(product: Product): Observable<ApiSuccess<Product> | ApiError> {
    return this.http.post<ApiSuccess<Product>>(`${this.API_URL}/products`, product).pipe(
      map((response: ApiSuccess<Product>) => response),
      catchError(this.handleError)
    );
  }
  
  putProduct(product: Product): Observable<ApiSuccess<Product> | ApiError> {
    return this.http.put<ApiSuccess<Product>>(`${this.API_URL}/products/${product.id}`, product).pipe(
      map((response: ApiSuccess<Product>) => response),
      catchError(this.handleError)
    );
  }

  deleteProduct(id: string): Observable<ApiResponseBase | ApiError> {
    return this.http.delete<ApiResponseBase | ApiError>(`${this.API_URL}/products/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  verifyProductName(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/products/verification/${id}`);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 400) {
      const apiError: ApiError = error.error;
      return throwError(() => new Error(apiError.message));
    }
    
    return throwError(() => new Error('An unexpected error occurred'));
  }

}