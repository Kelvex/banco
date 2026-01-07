import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DropdownCustomComponent } from './dropdown-custom.component';

describe('DropdownCustomComponent', () => {
  let component: DropdownCustomComponent;
  let fixture: ComponentFixture<DropdownCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownCustomComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---------------------- INICIALIZACIÓN ----------------------
  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  // ---------------------- EMISIÓN DE EVENTOS ----------------------
  describe('Event Emission', () => {
    it('should emit toggle event with dropdownId when toggleDropdown is called', () => {
      spyOn(component.toggle, 'emit');
      component.dropdownId = 'dropdown1';
      component.toggleDropdown();
      expect(component.toggle.emit).toHaveBeenCalledWith('dropdown1');
    });

    it('should emit edit event and close dropdown when onEdit is called', () => {
      spyOn(component.edit, 'emit');
      component.isOpened = true;
      component.onEdit();
      expect(component.edit.emit).toHaveBeenCalled();
      expect(component.isOpened).toBeFalse();
    });

    it('should emit delete event and close dropdown when onDelete is called', () => {
      spyOn(component.delete, 'emit');
      component.isOpened = true;
      component.onDelete();
      expect(component.delete.emit).toHaveBeenCalled();
      expect(component.isOpened).toBeFalse();
    });
  });

  // ---------------------- INTERACCIONES DE UI ----------------------
  describe('UI Interactions', () => {
    it('should toggle isOpened when toggle button is clicked', () => {
      spyOn(component.toggle, 'emit');
      component.dropdownId = 'dropdown2';

      const button = fixture.debugElement.query(By.css('.dropdown__icon'));
      button.triggerEventHandler('click', null);

      expect(component.toggle.emit).toHaveBeenCalledWith('dropdown2');
    });

    it('should close dropdown if clicked outside', () => {
      component.isOpened = true;

      const event = new MouseEvent('click', {
        bubbles: true
      });
      document.body.dispatchEvent(event);

      expect(component.isOpened).toBeFalse();
    });

    it('should not close dropdown if clicked inside', () => {
      component.isOpened = true;

      const dropdownEl = fixture.debugElement.query(By.css('.dropdown')).nativeElement;
      const event = new MouseEvent('click', {
        bubbles: true
      });
      dropdownEl.dispatchEvent(event);

      expect(component.isOpened).toBeTrue();
    });
  });
});
