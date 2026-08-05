import type { ClientEntry } from '../registry';

/**
 * Contribution intake. The product has no backend, so the whole crowdsourcing
 * loop is GitHub issue forms plus a few `<a>` tags — nothing here does anything
 * at runtime beyond building a URL.
 *
 * The bottleneck this exists to attack is NOT code: it's reference material.
 * Every reproduction is rebuilt against a recording of the real app from a real
 * account (docs/FIDELITY.md), and the one thing a solo author cannot manufacture
 * is ten clients' worth of lived-in accounts. A Damus user with 500 follows can.
 *
 * The forms themselves live in `.github/ISSUE_TEMPLATE/` — that is where the
 * privacy protocol and the rights grant are written, and they are the load-
 * bearing part of this feature, not the links below.
 */
const REPO = 'https://github.com/ptrio42/sandstr.app';

/**
 * GitHub prefills an issue form from query params keyed by each field's `id`.
 * Dropdowns need an EXACT match against one of the YAML options — a miss just
 * leaves the field unselected rather than erroring, so this degrades quietly if
 * a client is ever renamed in configs.ts. If you rename one, update the
 * `client:` option lists in `.github/ISSUE_TEMPLATE/*.yml` to match.
 */
function issueUrl(template: string, fields: Record<string, string> = {}) {
  const q = new URLSearchParams({ template, ...fields });
  return `${REPO}/issues/new?${q.toString()}`;
}

/**
 * The highest-yield contribution in the whole scheme, which is why it gets the
 * in-app affordance rather than living on a contribute page nobody visits:
 * anyone who opens /c/damus and actually uses Damus is a free fidelity reviewer,
 * costs us no moderation, and — unlike a capture — risks leaking nothing, since
 * they're describing OUR app rather than uploading theirs.
 */
export const fidelityReportUrl = (entry: ClientEntry) =>
  issueUrl('1-fidelity-report.yml', {
    title: `[fidelity] ${entry.name}: `,
    client: entry.name,
    where: `https://sandstr.app/c/${entry.id}`,
  });

export const addReferenceUrl = () => issueUrl('2-add-reference.yml');

export const requestClientUrl = () => issueUrl('3-request-client.yml');
