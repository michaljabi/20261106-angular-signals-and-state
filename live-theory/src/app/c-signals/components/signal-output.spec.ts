import { TestBed } from '@angular/core/testing';
import { SignalOutput } from './signal-output';

describe('SignalOutput', () => {
  it('child emits, parent updates state, new value flows back via input', async () => {
    const fixture = TestBed.createComponent(SignalOutput);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const rows = () => [...el.querySelectorAll('app-quantity-stepper')];
    const qty = (row: Element) => row.querySelector('code')?.textContent?.trim();
    const btn = (row: Element, text: string) =>
      [...row.querySelectorAll('button')].find((b) => b.textContent?.trim() === text)!;

    btn(rows()[0], '+').click();
    await fixture.whenStable();
    expect(qty(rows()[0])).toBe('2');
    expect(el.textContent).toContain('quantityChange(2) ← #1');

    btn(rows()[1], 'usuń').click();
    await fixture.whenStable();
    expect(rows().length).toBe(1);
    expect(el.textContent).toContain('removed() ← #2');
  });
});
