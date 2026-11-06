import { TestBed } from '@angular/core/testing';
import { SignalEffectAntiPattern2 } from './signal-effect-anti-pattern-2';

describe('SignalEffectAntiPattern2', () => {
  it('user change re-runs only the effect without untracked()', async () => {
    const fixture = TestBed.createComponent(SignalEffectAntiPattern2);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const logLines = () =>
      [...el.querySelectorAll('ol')].map((ol) => ol.querySelectorAll('li').length);

    expect(logLines()).toEqual([1, 1]); // initial run of both effects

    const select = el.querySelector('select')!;
    select.value = 'Bartek';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(logLines()).toEqual([2, 1]); // ❌ fired, ✅ not

    el.querySelectorAll<HTMLButtonElement>('button')[1].click(); // +
    await fixture.whenStable();
    expect(logLines()).toEqual([3, 2]);
  });
});
