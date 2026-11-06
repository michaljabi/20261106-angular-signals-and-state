import { Component, computed, inject } from '@angular/core';
import { PageHeader, ProblemAlert } from '../../shared/ui';
import { toProblem } from '../../shared/util';
import { ArticleCardComponent } from './article-card.component';
import { ArticlesService } from './articles.service';

/** `/articles`: all live articles. */
@Component({
  selector: 'app-article-list',
  imports: [PageHeader, ProblemAlert, ArticleCardComponent],
  templateUrl: './article-list.component.html',
})
export class ArticleListComponent {
  protected readonly articles = inject(ArticlesService).listResource();

  protected readonly problem = computed(() => {
    const error = this.articles.error();
    return error ? toProblem(error) : null;
  });
}
