import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PricePipe, ProblemAlert } from '../../shared/ui';
import { toProblem } from '../../shared/util';
import { ArticlesService } from './articles.service';
import { toBlocks } from './articles.utils';

/** `/articles/:slug`: one article. */
@Component({
  selector: 'app-article-detail',
  imports: [RouterLink, PricePipe, ProblemAlert],
  template: `
    <a routerLink="/articles" class="small">‹ All articles</a>

    <app-problem-alert [problem]="problem()" />

    @if (article.hasValue()) {
      @let a = article.value();
      <article class="mt-3">
        <h1 class="h2">{{ a.title }}</h1>
        <p class="text-body-secondary">{{ date() }}</p>
        <p class="lead">{{ a.excerpt }}</p>

        @for (block of blocks(); track $index) {
          @switch (block.kind) {
            @case ('heading') {
              @switch (block.level) {
                @case (2) {
                  <h2 class="h4 mt-4">{{ block.text }}</h2>
                }
                @case (3) {
                  <h3 class="h5 mt-3">{{ block.text }}</h3>
                }
                @default {
                  <h4 class="h6 mt-3">{{ block.text }}</h4>
                }
              }
            }
            @case ('list') {
              <ul>
                @for (item of block.items; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            }
            @case ('paragraph') {
              <p>{{ block.text }}</p>
            }
          }
        }

        @if (a.products.length) {
          <h2 class="h5 mt-5">Products in this article</h2>
          <ul class="list-group">
            @for (p of a.products; track p.id) {
              <li class="list-group-item d-flex justify-content-between">
                <a [routerLink]="['/products', p.slug]">{{ p.name }}</a>
                <span class="text-body-secondary">{{ p.priceCents | price }}</span>
              </li>
            }
          </ul>
        }
      </article>
    } @else if (article.isLoading()) {
      <p class="text-body-secondary mt-3">Loading article…</p>
    }
  `,
})
export class ArticleDetailComponent {
  private readonly articlesService = inject(ArticlesService);

  /** `:slug` route param (router input binding). */
  readonly slug = input.required<string>();

  protected readonly article = this.articlesService.articleResource(this.slug);

  protected readonly blocks = computed(() =>
    this.article.hasValue() ? toBlocks(this.article.value().body) : [],
  );
  protected readonly date = computed(() =>
    this.article.hasValue()
      ? this.articlesService.formatDate(this.article.value().publishedAt)
      : '',
  );
  protected readonly problem = computed(() => {
    const error = this.article.error();
    return error ? toProblem(error) : null;
  });
}
