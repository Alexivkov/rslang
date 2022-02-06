import './style.scss';
import { ApplicationRoute } from './services/application-route';
import { Navbar } from './views/components/navbar';
import { Home } from './views/pages/home';
import { TextBook } from './views/pages/text-book';
import { Games } from './views/pages/games';
import { Statistics } from './views/pages/statistics';

const headerStart = document.createElement('header');
const pageContainer = document.createElement('div');

headerStart.classList.add('header');
headerStart.id = 'header';
document.body.appendChild(headerStart);
pageContainer.classList.add('container');
pageContainer.id = 'page_container';
document.body.appendChild(pageContainer);

const header = document.getElementById('header') as HTMLElement;
(async () => header.innerHTML = await Navbar())();

const content = document.getElementById('page_container') as HTMLDivElement;

const routes = {
  '/': Home,
  '/text-book': TextBook,
  '/games': Games,
  '/winners': Statistics,
};

const player = document.getElementById('ddd')

const notFound = async () => '<div>Not Found</div>';
const app = new ApplicationRoute(content, routes, notFound);
app.listen();
