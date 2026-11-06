import { TestBed } from '@angular/core/testing';
import { SignalLinkedPrevious } from './signal-linked-previous';

describe('SignalLinkedPrevious', () => {
  it('keeps manual selection while visible, falls back when gone, survives refetch', async () => {
    const fixture = TestBed.createComponent(SignalLinkedPrevious);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const click = async (text: string) => {
      [...el.querySelectorAll('button')].find((b) => b.textContent?.includes(text))!.click();
      await fixture.whenStable();
    };
    const details = () => el.querySelector('.card-body h6')?.textContent?.trim();
    const price = () => el.querySelector('.card-body .fs-5')?.textContent?.trim();

    expect(details()).toBe('Klawiatura'); // first computation: list[0]

    await click('Mysz'); // manual set()
    await click('peryferia');
    expect(details()).toBe('Mysz'); // still visible → kept

    await click('monitory');
    expect(details()).toBe('Monitor 24"'); // gone → first

    await click('wszystkie');
    await click('Monitor 27"');
    const before = price();
    let after = before;
    for (let i = 0; i < 20 && after === before; i++) {
      await click('odśwież');
      after = price();
    }
    expect(details()).toBe('Monitor 27"'); // kept by id
    expect(after).not.toBe(before); // fresh object → new price
  });
});
