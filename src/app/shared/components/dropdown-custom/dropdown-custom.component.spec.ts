import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownCustomComponent } from './dropdown-custom.component';

describe('DropdownCustomComponent', () => {
  let component: DropdownCustomComponent;
  let fixture: ComponentFixture<DropdownCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownCustomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DropdownCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
