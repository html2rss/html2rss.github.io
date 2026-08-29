import { siteKeyFromId } from '../domain/entry';
import { isLastResultState } from '../domain/last-result';
import type { CatalogLoadError, FeedDirectoryEntry, LastResult } from '../domain/types';

const SUPPORTED_CATALOG_VERSIONS = [2] as const;

interface CatalogWireEntry {
  id?: unknown;
  path?: unknown;
  channel?: { url?: unknown; language?: unknown };
  directory?: { title?: unknown; summary?: unknown; topics?: unknown };
  parameters?: { schema?: unknown; defaults?: unknown };
  last_result?: unknown;
}

interface CatalogEnvelope {
  success?: unknown;
  data?: { configs?: unknown };
  meta?: { total?: unknown; catalog_version?: unknown; starters?: unknown };
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

/** Fail closed: missing or invalid last_result rejects the row. */
function parseLastResult(value: unknown): LastResult | null {
  if (!isRecord(value)) return null;
  if (!isLastResultState(value.state)) return null;

  const code = value.code;
  if (!(code === null || typeof code === 'string')) return null;

  const at = value.at;
  if (!(at === null || typeof at === 'string')) return null;

  return {
    state: value.state,
    code: code === null || code.trim() === '' ? null : code,
    at: at === null || at.trim() === '' ? null : at,
  };
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
    const lastResult = parseLastResult(wire.last_result);
    if (!id || !path || !channelUrl || !lastResult) continue;

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
      lastResult,
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

export interface CatalogMeta {
  total: number;
  catalogVersion: number;
  starters: readonly string[];
}

function parseCatalogEnvelope(payload: unknown): {
  entries: FeedDirectoryEntry[];
  meta: CatalogMeta;
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
  const starters = parseStringArray(envelope.meta?.starters);

  return {
    entries,
    meta: { total, catalogVersion, starters },
  };
}

export async function fetchCatalogResponse(
  instanceUrl: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ entries: FeedDirectoryEntry[]; meta: CatalogMeta }> {
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
