import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonCustomComponent } from './button-custom.component';

describe('ButtonCustomComponent', () => {
  let component: ButtonCustomComponent;
  let fixture: ComponentFixture<ButtonCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonCustomComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render content', () => {
    const button = fixture.nativeElement.querySelector('button');
    button.textContent = 'Click me';
    fixture.detectChanges();
    expect(button.textContent).toContain('Click me');
  });

  it('should apply buttonClass input', () => {
    component.buttonClass = 'my-class';
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList).toContain('my-class');
  });

  it('should disable button when isDisabled is true', () => {
    component.isDisabled = true;
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTrue();
  });

  it('should emit buttonClicked when clicked', () => {
    spyOn(component.buttonClicked, 'emit');
    const button = fixture.nativeElement.querySelector('button');

    button.click();
    expect(component.buttonClicked.emit).toHaveBeenCalled();
  });

  it('should not emit buttonClicked when disabled', () => {
    spyOn(component.buttonClicked, 'emit');
    component.isDisabled = true;
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');

    button.click();
    expect(component.buttonClicked.emit).not.toHaveBeenCalled();
  });
});
