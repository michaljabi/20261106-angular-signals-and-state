import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleSummary, ArticlesService } from './articles.service';

/** Card for one article on the list. */
@Component({
  selector: 'app-article-card',
  imports: [RouterLink],
  template: `
    @let a = article();
    <div class="card h-100">
      <div class="card-body d-flex flex-column">
        <h2 class="h5 card-title">
          <a [routerLink]="['/articles', a.slug]" class="stretched-link text-decoration-none">
            {{ a.title }}
          </a>
        </h2>
        <p class="card-text text-body-secondary">{{ a.excerpt }}</p>
        <p class="small text-body-secondary mt-auto mb-0">{{ date() }}</p>
      </div>
    </div>
  `,
})
export class ArticleCardComponent {
  private readonly articlesService = inject(ArticlesService);

  readonly article = input.required<ArticleSummary>();

  protected readonly date = computed(() =>
    this.articlesService.formatDate(this.article().publishedAt),
  );
}
