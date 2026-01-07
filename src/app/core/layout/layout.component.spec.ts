import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutComponent } from './layout.component';
import { provideRouter } from '@angular/router';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---------------------- INITIALIZATION ----------------------
  describe('Initialization', () => {
    it('should be created', () => {
      expect(component).toBeTruthy();
    });
  });

  // ---------------------- RENDERING ----------------------
  describe('Rendering', () => {
    it('should render the router-outlet', () => {
      const routerOutlet = fixture.nativeElement.querySelector('router-outlet');
      expect(routerOutlet).toBeTruthy();
    });

    it('should render the toast-custom', () => {
      const toast = fixture.nativeElement.querySelector('toast-custom');
      expect(toast).toBeTruthy();
    });
  });
});
