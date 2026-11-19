import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhishlistToggle } from './whishlist-toggle';

describe('WhishlistToggle', () => {
  let component: WhishlistToggle;
  let fixture: ComponentFixture<WhishlistToggle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhishlistToggle],
    }).compileComponents();

    fixture = TestBed.createComponent(WhishlistToggle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
