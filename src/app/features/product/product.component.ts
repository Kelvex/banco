import { Component, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '@interfaces/data.interface';
import { ProductService } from '@services/api/product.service';
import { Router } from '@angular/router';
import { DropdownCustomComponent } from "@components/dropdown-custom/dropdown-custom.component";
import { ButtonCustomComponent } from "@components/button-custom/button-custom.component";
import { DialogCustomComponent } from "@components/dialog-custom/dialog-custom.component";
import { ToastService } from '@shared-services/toast.service';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownCustomComponent, ButtonCustomComponent, DialogCustomComponent],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnDestroy, AfterViewInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  filterText = '';
  pageSizeOptions = [5, 10, 25, 50];
  pageSize = 5;

  openDropdown: string | null = null;

  showDeleteDialog = false;
  selectedProductId: string | null = null;
  messageConfirmDelete = "";

  private destroy$ = new Subject<void>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(
    private productService: ProductService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.loadProducts();
  }

  ngAfterViewInit() {
    fromEvent(this.searchInput.nativeElement, 'input').pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.applyFilter());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts() {
    this.productService.getProducts().pipe(
      takeUntil(this.destroy$)
    ).subscribe(res => {
      this.products = res;
      this.applyFilter();
    });
  }

  applyFilter() {
    const text = this.filterText.toLowerCase();
    this.filteredProducts = this.products.filter(
      p => p.name.toLowerCase().includes(text) || p.description.toLowerCase().includes(text)
    ).slice(0, this.pageSize);
  }

  onFilterChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.filterText = target.value;
  }

  onPageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.pageSize = Number(target.value);
    this.applyFilter();
  }

  onAdd() {
    this.router.navigate(['/form']);
  }

  toggleDropdown(dropdownId: string): void {
    this.openDropdown = this.openDropdown === dropdownId ? null : dropdownId;
  }

  onEdit(productId: string) {
    this.router.navigate(['/form', productId]);
  }

  onDelete(product: Product) {
    this.selectedProductId = product.id;
    this.messageConfirmDelete = `¿Estás seguro que deseas eliminar el producto ${product.name}?`;
    this.showDeleteDialog = true;
  }

  handleDeleteDecision(result: boolean) {
    this.showDeleteDialog = false;

    if (result && this.selectedProductId) {
      this.deleteProduct();
    } else {
      this.selectedProductId = null;
      this.toastService.showToast('Proceso cancelado', 'warning');
    }
  }

  deleteProduct() {
    if (!this.selectedProductId) return;

    this.productService.deleteProduct(this.selectedProductId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.toastService.showToast(data.message, 'success');
        this.removeProductFromList(this.selectedProductId!);
        this.selectedProductId = null;
      },
      error: (err) => {
        this.toastService.showToast(err.message || 'Error al eliminar', 'error');
        this.selectedProductId = null;
      }
    });
  }

  removeProductFromList(productId: string) {
    this.filteredProducts = this.filteredProducts.filter(p => p.id !== productId);
    this.products = this.products.filter(p => p.id !== productId);
  }

}
