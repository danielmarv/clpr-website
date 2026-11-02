// Re-exports the engine's pinned-link helpers and adds the helpers this site's content uses
// (named in pack.json `refHelpers`).
import { docLink, pinned } from '@kse/lib/sources';

export * from '@kse/lib/sources';

/** The design document (clpr-service.md). */
export function design(anchor = ''): string {
  return docLink('design', anchor);
}

/** The protocol specification (clpr-service-spec.md). */
export function spec(anchor = ''): string {
  return docLink('spec', anchor);
}

/** A file in the Solidity contracts repo. */
export function sol(path: string, line?: number): string {
  return pinned('clpr-smart-contracts', path, line ? `L${line}` : '');
}
