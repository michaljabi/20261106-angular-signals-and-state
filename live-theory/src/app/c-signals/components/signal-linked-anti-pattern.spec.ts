import { TestBed } from '@angular/core/testing';
import { SignalLinkedAntiPattern } from './signal-linked-anti-pattern';

describe('SignalLinkedAntiPattern', () => {
  it('polling wipes the naive draft, keeps the dirty one; save/discard make it clean', async () => {
    const fixture = TestBed.createComponent(SignalLinkedAntiPattern);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const bad = el.querySelector<HTMLInputElement>('#bad-name')!;
    const good = el.querySelector<HTMLInputElement>('#good-name')!;
    const click = async (text: string) => {
      [...el.querySelectorAll('button')].find((b) => b.textContent?.includes(text))!.click();
      await fixture.whenStable();
    };
    const type = async (input: HTMLInputElement, value: string) => {
      input.value = value;
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };

    await type(bad, 'Klawiatura PRO');
    await type(good, 'Klawiatura PRO');
    await click('odświeżenie'); // only stock changes, name stays the same

    expect(bad.value).toBe('Klawiatura'); // ❌ edit lost
    expect(good.value).toBe('Klawiatura PRO'); // ✅ kept

    await click('zapisz');
    expect(el.textContent).toContain('serwer: Klawiatura PRO');
    expect(el.querySelector('.badge')).toBeNull();

    await type(good, 'X');
    await click('odrzuć');
    expect(good.value).toBe('Klawiatura PRO');
  });
});
