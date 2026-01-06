import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonCustomComponent } from "@components/button-custom/button-custom.component";

@Component({
  selector: 'dialog-custom',
  standalone: true,
  imports: [ButtonCustomComponent],
  templateUrl: './dialog-custom.component.html',
  styleUrl: './dialog-custom.component.css'
})
export class DialogCustomComponent {

  @Input() question: string = '¿Estás seguro?';
  @Output() decision = new EventEmitter<boolean>();

  onAccept() {
    this.decision.emit(true);
  }

  onDeny() {
    this.decision.emit(false);
  }
}
