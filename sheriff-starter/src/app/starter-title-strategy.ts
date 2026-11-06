import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** Prefixes every route `title` with `Starter - ` (distinguishes tab from Sheriff Shop). */
@Injectable()
export class StarterTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    this.title.setTitle(title ? `Starter - ${title}` : 'Starter');
  }
}
