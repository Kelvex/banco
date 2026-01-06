import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'button-custom',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-custom.component.html',
  styleUrl: './button-custom.component.css'
})
export class ButtonCustomComponent {

  @Input() buttonClass: string = '';
  @Input() isDisabled: boolean = false;
  @Output() buttonClicked = new EventEmitter<void>();

  
  onClick(): void {
    this.buttonClicked.emit();
  }

}
