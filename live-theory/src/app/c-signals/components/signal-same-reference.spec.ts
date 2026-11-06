import { TestBed } from '@angular/core/testing';
import { SignalSameReference } from './signal-same-reference';

describe('SignalSameReference', () => {
  it('mutation + set(same ref) leaves computed stale; update() resyncs', async () => {
    const fixture = TestBed.createComponent(SignalSameReference);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const [bad, good] = el.querySelectorAll<HTMLButtonElement>('button');
    const values = () => [...el.querySelectorAll('td code')].map((c) => c.textContent?.trim());

    expect(values()).toEqual(['30', '30']);

    bad.click();
    await fixture.whenStable();
    expect(values()).toEqual(['31', '30']); // direct read sees mutation, computed stale
    expect(el.querySelector('.alert-danger')).not.toBeNull();

    good.click();
    await fixture.whenStable();
    expect(values()).toEqual(['32', '32']);
    expect(el.querySelector('.alert-danger')).toBeNull();
  });
});
