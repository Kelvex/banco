import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogCustomComponent } from './dialog-custom.component';
import { By } from '@angular/platform-browser';
import { ButtonCustomComponent } from '@components/button-custom/button-custom.component';

describe('DialogCustomComponent', () => {
  let component: DialogCustomComponent;
  let fixture: ComponentFixture<DialogCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCustomComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DialogCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ------------------ INICIALIZACIÓN ------------------
  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  // ------------------ INTERACCIÓN CON EL DIALOG ------------------
  describe('Dialog Interaction', () => {
    it('should display the question input', () => {
      component.question = '¿Eliminar producto?';
      fixture.detectChanges();
      const questionEl = fixture.debugElement.query(By.css('.dialog__question'));
      expect(questionEl.nativeElement.textContent).toContain('¿Eliminar producto?');
    });

    it('should call onAccept when Confirmar button clicked', () => {
      spyOn(component, 'onAccept');
      const confirmButton = fixture.debugElement
        .queryAll(By.directive(ButtonCustomComponent))
        .find(btn => btn.nativeElement.textContent.includes('Confirmar'));

      expect(confirmButton).toBeTruthy();
      confirmButton!.componentInstance.buttonClicked.emit();
      expect(component.onAccept).toHaveBeenCalled();
    });

    it('should call onDeny when Cancelar button clicked', () => {
      spyOn(component, 'onDeny');
      const cancelButton = fixture.debugElement
        .queryAll(By.directive(ButtonCustomComponent))
        .find(btn => btn.nativeElement.textContent.includes('Cancelar'));

      expect(cancelButton).toBeTruthy();
      cancelButton!.componentInstance.buttonClicked.emit();
      expect(component.onDeny).toHaveBeenCalled();
    });
  });

  // ------------------ EMISIÓN DE EVENTOS ------------------
  describe('Event Emission', () => {
    it('should emit true when onAccept is called', () => {
      spyOn(component.decision, 'emit');
      component.onAccept();
      expect(component.decision.emit).toHaveBeenCalledWith(true);
    });

    it('should emit false when onDeny is called', () => {
      spyOn(component.decision, 'emit');
      component.onDeny();
      expect(component.decision.emit).toHaveBeenCalledWith(false);
    });
  });

  // ------------------ INTERACCIÓN DE UI ------------------
  describe('UI Interaction', () => {
    it('should call onDeny when clicking outside the dialog', () => {
      spyOn(component, 'onDeny');
      const overlay = fixture.debugElement.query(By.css('.dialog-overlay'));
      overlay.triggerEventHandler('click', new Event('click'));
      expect(component.onDeny).toHaveBeenCalled();
    });

    it('should stop propagation when clicking inside the dialog container', () => {
      const container = fixture.debugElement.query(By.css('.dialog-container'));
      const event = { stopPropagation: jasmine.createSpy('stopPropagation') };
      container.triggerEventHandler('click', event);
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });
});
