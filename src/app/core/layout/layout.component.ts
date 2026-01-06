import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { ToastCustomComponent } from "@components/toast-custom/toast-custom.component";

@Component({
  selector: 'layout',
  standalone: true,
  imports: [RouterOutlet, ToastCustomComponent],
  template: `
    <div class="layout">
      <router-outlet></router-outlet>
    </div>
    <toast-custom></toast-custom>
  `,
  styles: [`
    .layout {
      width: 100%;
      height: 100%;
    }
  `]
})
export class LayoutComponent {

}
