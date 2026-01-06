import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastCustomComponent } from './toast-custom.component';

describe('ToastCustomComponent', () => {
  let component: ToastCustomComponent;
  let fixture: ComponentFixture<ToastCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastCustomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ToastCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
