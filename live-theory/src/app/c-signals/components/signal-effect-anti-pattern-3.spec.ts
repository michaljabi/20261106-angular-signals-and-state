import { TestBed } from '@angular/core/testing';
import { SignalEffectAntiPattern3 } from './signal-effect-anti-pattern-3';

describe('SignalEffectAntiPattern3', () => {
  it('bad effect loops until the fuse trips; good effect logs once per change', async () => {
    const fixture = TestBed.createComponent(SignalEffectAntiPattern3);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const [, plus, run] = el.querySelectorAll<HTMLButtonElement>('button');

    plus.click();
    await fixture.whenStable();
    expect(el.textContent).toContain('[0, 1]'); // ✅ one entry per change

    run.click(); // ❌ one click…
    await fixture.whenStable();
    expect(el.textContent).toContain('50×'); // …50 runs, then fuse
    expect(el.textContent).toContain('bezpiecznik zatrzymał pętlę');
  });
});
