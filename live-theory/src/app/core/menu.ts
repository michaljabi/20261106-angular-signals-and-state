import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface MenuLink {
  kind: 'link';
  label: string;
  link: string;
}

/** Not ready yet – rendered disabled with "wkrótce" badge. */
export interface MenuPlaceholder {
  kind: 'placeholder';
  label: string;
}

/** Group of examples for one topic (e.g. many `computed()` demos). */
export interface MenuGroup {
  kind: 'group';
  label: string;
  children: (MenuLink | MenuPlaceholder)[];
}

export type MenuItem = MenuLink | MenuPlaceholder | MenuGroup;

export interface MenuSection {
  part: string;
  title: string;
  items: MenuItem[];
}

/** Presentational: only inputs/outputs, no injected state. */
@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Menu przykładów">
      @for (section of sections(); track section.part) {
        <h2 class="h6 text-uppercase text-body-secondary small mt-3 mb-2">
          {{ section.part }} – <strong>{{ section.title }}</strong>
        </h2>
        <div class="list-group list-group-flush">
          @for (item of section.items; track item.label) {
            @switch (item.kind) {
              @case ('link') {
                <a
                  class="list-group-item list-group-item-action"
                  [routerLink]="item.link"
                  routerLinkActive="active"
                  ariaCurrentWhenActive="page"
                  (click)="navigated.emit()"
                >
                  {{ item.label }}
                </a>
              }
              @case ('placeholder') {
                <span
                  class="list-group-item disabled d-flex justify-content-between align-items-center"
                  aria-disabled="true"
                >
                  {{ item.label }}
                  <span class="badge text-bg-secondary">wkrótce</span>
                </span>
              }
              @case ('group') {
                <!-- Group = static header + indented children (second menu level) -->
                <div class="list-group-item fw-semibold">{{ item.label }}</div>
                @for (child of item.children; track child.label) {
                  @if (child.kind === 'link') {
                    <a
                      class="list-group-item list-group-item-action ps-5 small"
                      [routerLink]="child.link"
                      routerLinkActive="active"
                      ariaCurrentWhenActive="page"
                      (click)="navigated.emit()"
                    >
                      {{ child.label }}
                    </a>
                  } @else {
                    <span
                      class="list-group-item disabled ps-5 small d-flex justify-content-between align-items-center"
                      aria-disabled="true"
                    >
                      {{ child.label }}
                      <span class="badge text-bg-secondary">wkrótce</span>
                    </span>
                  }
                }
              }
            }
          }
        </div>
      }
    </nav>
  `,
})
export class Menu {
  readonly sections = input.required<MenuSection[]>();
  readonly navigated = output();
}
