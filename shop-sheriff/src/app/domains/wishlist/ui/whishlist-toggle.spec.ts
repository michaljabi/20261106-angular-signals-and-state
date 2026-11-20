import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WishlistToggle } from './whishlist-toggle';

describe('WishlistToggle', () => {
  let component: WishlistToggle;
  let fixture: ComponentFixture<WishlistToggle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistToggle],
    }).compileComponents();

    fixture = TestBed.createComponent(WishlistToggle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
