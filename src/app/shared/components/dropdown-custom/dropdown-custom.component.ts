import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'dropdown-custom',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-custom.component.html',
  styleUrl: './dropdown-custom.component.css'
})
export class DropdownCustomComponent {
  @Input() isOpened = false;
  @Input() dropdownId = '';

  @Output() toggle = new EventEmitter<string>(); 
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  // Alternar el estado de apertura del dropdown
  toggleDropdown() {
    this.toggle.emit(this.dropdownId);
  }

  // Emitir evento para editar
  onEdit(): void {
    this.edit.emit();
    this.isOpened = false;
  }

  // Emitir evento para eliminar
  onDelete(): void {
    this.delete.emit();
    this.isOpened = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.dropdown')) {
      this.isOpened = false;
    }
  }

}
