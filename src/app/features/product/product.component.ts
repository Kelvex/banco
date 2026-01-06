import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '@interfaces/data.interface';
import { ProductService } from '@services/api/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  filterText = '';
  pageSizeOptions = [5, 10, 25, 50];
  pageSize = 5;
  activeDropdown: HTMLElement | null = null;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe((res) => {
      this.products = res;
      this.applyFilter();
    });
  }

  applyFilter() {
    const text = this.filterText.toLowerCase();
    this.filteredProducts = this.products.filter(
      p =>
        p.name.toLowerCase().includes(text) ||
        p.description.toLowerCase().includes(text)
    ).slice(0, this.pageSize);
  }

  onFilterChange(event: any) {
    this.filterText = event.target.value;
    this.applyFilter();
  }

  onPageSizeChange(event: any) {
    this.pageSize = Number(event.target.value);
    this.applyFilter();
  }

  onAdd() {
    this.router.navigate(['/form']);
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();

    const button = event.currentTarget as HTMLElement;
    const dropdownMenu = button.nextElementSibling as HTMLElement;

    if (!dropdownMenu) return;

    // Cierra otro dropdown si hay uno abierto
    if (this.activeDropdown && this.activeDropdown !== dropdownMenu) {
      this.activeDropdown.style.display = 'none';
    }

    // Calcula posición: esquina inferior derecha del botón
    const rect = button.getBoundingClientRect();
    dropdownMenu.style.position = 'absolute';
    dropdownMenu.style.top = `${rect.bottom + window.scrollY}px`;
    dropdownMenu.style.left = `${rect.right - dropdownMenu.offsetWidth + window.scrollX}px`;

    // Toggle display
    if (dropdownMenu.style.display === 'block') {
      dropdownMenu.style.display = 'none';
      this.activeDropdown = null;
    } else {
      dropdownMenu.style.display = 'block';
      this.activeDropdown = dropdownMenu;
    }
  }

  // Cierra el dropdown si clickeamos afuera
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.product__dropdown-btn') && this.activeDropdown) {
      this.activeDropdown.style.display = 'none';
      this.activeDropdown = null;
    }
  }

  onEdit(productId: string) {
    this.router.navigate(['/form', productId]);
  }
}
