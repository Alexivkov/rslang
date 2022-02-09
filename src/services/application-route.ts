import { PageContentRoutes, PageContentThunk } from './types';

export class ApplicationRoute {
  content: HTMLDivElement;

  routes: PageContentRoutes;

  notFound: PageContentThunk;

  constructor(content: HTMLDivElement, routes: PageContentRoutes, notFound: PageContentThunk) {
    this.content = content;
    this.routes = routes;
    this.notFound = notFound;
  }

  router() {
    const url1 = (window.location.hash.slice(1).toLowerCase() || '/').split('?');
    const url = url1[0];
    let query = {};
    if (url1[1]) {
      const params = url1[1].split('&').map((p) => p.split('='));
      query = Object.fromEntries(params);
    }
    const resource = url.split('/')[1];
    const request = { resource };
    const parsedURL = request.resource ? `/${request.resource}` : '/';
    if (this.routes[parsedURL]) return this.routes[parsedURL](query);
    return this.notFound();
  }

  async listen() {
    window.addEventListener('hashchange', async () => this.setHTML());
    window.addEventListener('load', async () => this.setHTML());
  }

  private async setHTML() {
    this.content.innerHTML = await this.router();
  }
}
