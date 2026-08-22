import { describe, expect, it } from 'vitest';
import { buildOpmlDocument } from './opml';
import type { FeedDirectoryEntry } from './types';

const entry: FeedDirectoryEntry = {
  id: 'anthropic.com/news',
  path: '/anthropic.com/news.rss',
  siteKey: 'anthropic.com',
  title: 'Anthropic — News',
  summary: 'Announcements.',
  topics: ['news'],
  channelUrl: 'https://www.anthropic.com/news',
  language: 'en',
  parameterSchema: {},
  parameterDefaults: {},
};

describe('buildOpmlDocument', () => {
  it('builds OPML with escaped titles and feed URLs', () => {
    const xml = buildOpmlDocument('https://instance.example/', [entry], {});
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('xmlUrl="https://instance.example/anthropic.com/news.rss"');
    expect(xml).toContain('htmlUrl="https://www.anthropic.com/news"');
    expect(xml).toContain('title="Anthropic — News"');
  });

  it('includes query parameters from overrides', () => {
    const parameterized: FeedDirectoryEntry = {
      ...entry,
      id: 'bbc.co.uk/available_episodes',
      path: '/bbc.co.uk/available_episodes.rss',
      siteKey: 'bbc.co.uk',
      title: 'BBC Sounds',
      parameterSchema: { id: { type: 'string' } },
      parameterDefaults: { id: 'b006wkfp' },
    };
    const xml = buildOpmlDocument('https://instance.example/', [parameterized], {
      'bbc.co.uk/available_episodes': { id: 'custom-id' },
    });
    expect(xml).toContain('xmlUrl="https://instance.example/bbc.co.uk/available_episodes.rss?id=custom-id"');
  });
});
