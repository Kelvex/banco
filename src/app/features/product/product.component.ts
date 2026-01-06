import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '@interfaces/data.interface';
import { ProductService } from '@services/api/product.service';
import { Router } from '@angular/router';
import { DropdownCustomComponent } from "@components/dropdown-custom/dropdown-custom.component";
import { ButtonCustomComponent } from "@components/button-custom/button-custom.component";

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownCustomComponent, ButtonCustomComponent],
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
  openDropdown: string | null = null;

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

  toggleDropdown(dropdownId: string): void {
    
    if (this.openDropdown === dropdownId) {
      this.openDropdown = null;
    } else {
      this.openDropdown = dropdownId;
    }
    
  }

  onEdit(productId: string) {
    this.router.navigate(['/form', productId]);
  }
}
