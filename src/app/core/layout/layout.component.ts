import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="layout">
      <router-outlet></router-outlet>
    </div>
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
