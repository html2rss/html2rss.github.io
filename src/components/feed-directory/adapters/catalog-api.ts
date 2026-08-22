import { siteKeyFromId } from '../domain/entry';
import type { CatalogLoadError, FeedDirectoryEntry } from '../domain/types';

const SUPPORTED_CATALOG_VERSIONS = [1] as const;

interface CatalogWireEntry {
  id?: unknown;
  path?: unknown;
  channel?: { url?: unknown; language?: unknown };
  directory?: { title?: unknown; summary?: unknown; topics?: unknown };
  parameters?: { schema?: unknown; defaults?: unknown };
}

interface CatalogEnvelope {
  success?: unknown;
  data?: { configs?: unknown };
  meta?: { total?: unknown; catalog_version?: unknown };
}

export class CatalogDisabledError extends Error {
  constructor(message = 'Catalog is disabled on this instance.') {
    super(message);
    this.name = 'CatalogDisabledError';
  }
}

export class CatalogNetworkError extends Error {
  constructor(message = 'Could not reach the instance catalog.') {
    super(message);
    this.name = 'CatalogNetworkError';
  }
}

export class CatalogInvalidEnvelopeError extends Error {
  constructor(message = 'The instance returned an invalid catalog response.') {
    super(message);
    this.name = 'CatalogInvalidEnvelopeError';
  }
}

export class CatalogUnsupportedVersionError extends Error {
  constructor(message = 'This instance returned an unsupported catalog version.') {
    super(message);
    this.name = 'CatalogUnsupportedVersionError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function parseStringArray(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function parseParameterSchema(value: unknown): Readonly<Record<string, { type: string }>> {
  if (!isRecord(value)) return {};

  const schema: Record<string, { type: string }> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (!isRecord(raw)) continue;
    const type = asString(raw.type);
    if (type) schema[key] = { type };
  }
  return schema;
}

function parseParameterDefaults(value: unknown): Readonly<Record<string, string>> {
  if (!isRecord(value)) return {};

  const defaults: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === 'string') defaults[key] = raw;
  }
  return defaults;
}

function parseCatalogEntries(configs: unknown): FeedDirectoryEntry[] {
  if (!Array.isArray(configs)) return [];

  const entries: FeedDirectoryEntry[] = [];
  for (const row of configs) {
    if (!isRecord(row)) continue;
    const wire = row as CatalogWireEntry;
    const id = asString(wire.id);
    const path = asString(wire.path);
    const channelUrl = asString(wire.channel?.url);
    if (!id || !path || !channelUrl) continue;

    entries.push({
      id,
      path,
      siteKey: siteKeyFromId(id),
      title: asString(wire.directory?.title) ?? id,
      summary: asString(wire.directory?.summary) ?? '',
      topics: parseStringArray(wire.directory?.topics),
      channelUrl,
      language: asString(wire.channel?.language) ?? '',
      parameterSchema: parseParameterSchema(wire.parameters?.schema),
      parameterDefaults: parseParameterDefaults(wire.parameters?.defaults),
    });
  }

  return entries;
}

function parseCatalogVersion(meta: CatalogEnvelope['meta']): number {
  const version = meta?.catalog_version;
  if (typeof version !== 'number' || !Number.isFinite(version)) {
    throw new CatalogInvalidEnvelopeError();
  }
  if (!SUPPORTED_CATALOG_VERSIONS.includes(version as (typeof SUPPORTED_CATALOG_VERSIONS)[number])) {
    throw new CatalogUnsupportedVersionError();
  }
  return version;
}

function parseCatalogEnvelope(payload: unknown): {
  entries: FeedDirectoryEntry[];
  meta: { total: number; catalogVersion: number };
} {
  if (!isRecord(payload)) {
    throw new CatalogInvalidEnvelopeError();
  }

  const envelope = payload as CatalogEnvelope;
  if (envelope.success !== true || !isRecord(envelope.data)) {
    throw new CatalogInvalidEnvelopeError();
  }

  const entries = parseCatalogEntries(envelope.data.configs);
  const catalogVersion = parseCatalogVersion(envelope.meta);
  const totalRaw = envelope.meta?.total;
  const total = typeof totalRaw === 'number' && Number.isFinite(totalRaw) ? totalRaw : entries.length;

  return {
    entries,
    meta: { total, catalogVersion },
  };
}

export async function fetchCatalogResponse(
  instanceUrl: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ entries: FeedDirectoryEntry[]; meta: { total: number; catalogVersion: number } }> {
  const catalogUrl = new URL('/api/v1/configs', instanceUrl).toString();

  let response: Response;
  try {
    response = await fetchImpl(catalogUrl, { headers: { Accept: 'application/json' } });
  } catch {
    throw new CatalogNetworkError();
  }

  if (response.status === 404) {
    throw new CatalogDisabledError();
  }

  if (!response.ok) {
    throw new CatalogNetworkError(`Catalog request failed with status ${response.status}.`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new CatalogInvalidEnvelopeError();
  }

  return parseCatalogEnvelope(payload);
}

export function mapCatalogError(error: unknown): CatalogLoadError {
  if (error instanceof CatalogDisabledError) {
    return { kind: 'disabled', message: 'This instance has the feed catalog disabled.' };
  }
  if (error instanceof CatalogUnsupportedVersionError) {
    return {
      kind: 'unsupported_version',
      message: 'This instance returned an unsupported catalog version.',
    };
  }
  if (error instanceof CatalogInvalidEnvelopeError) {
    return { kind: 'invalid', message: 'The instance returned an unexpected catalog response.' };
  }
  if (error instanceof CatalogNetworkError) {
    return { kind: 'network', message: 'Could not load the feed catalog from this instance.' };
  }
  return { kind: 'unknown', message: 'Could not load the feed catalog.' };
}
