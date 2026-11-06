import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render brand', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar-brand')?.textContent).toContain('Angular Live Theory');
  });

  it('should toggle mobile menu via signal', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const menu = compiled.querySelector('#app-menu')!;
    expect(menu.classList).toContain('d-none');

    compiled.querySelector<HTMLButtonElement>('.navbar-toggler')!.click();
    await fixture.whenStable();
    expect(menu.classList).not.toContain('d-none');
  });
});
