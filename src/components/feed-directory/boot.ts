import { FeedDirectoryApp } from './app/FeedDirectoryApp';

export function bootFeedDirectory(): void {
  const root = document.getElementById('feed-directory-app');
  if (!root) return;
  const app = new FeedDirectoryApp(root);
  app.start();
}
