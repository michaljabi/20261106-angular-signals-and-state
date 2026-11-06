import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Menu } from './core/menu';
import { MENU_SECTIONS } from './core/menu-sections';

@Component({
  imports: [RouterOutlet, RouterLink, Menu],
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
})
export class App {
  protected readonly sections = MENU_SECTIONS;
  // Mobile menu toggle: a signal instead of Bootstrap JS (collapse plugin).
  protected readonly menuOpen = signal(false);

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
