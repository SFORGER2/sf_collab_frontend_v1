/**
 * Translates between the profile schema's flat field keys and the API's nested
 * user shape.
 *
 * The API splits a person across three places: a handful of columns on `user`
 * itself (`firstName`, `email`), a `profile` blob for everything descriptive,
 * and `profile.socialLinks` for URLs. The schema is deliberately flat — 56
 * fields, one key each — because that is what the UI and the assistant want to
 * reason about. This file is the only place that knows about the difference.
 *
 * BACKEND NOTE: only the fields listed in ROOT / SOCIAL below have a confirmed
 * home today. Everything else is written into the `profile` blob under its
 * schema key. If the backend later gives those columns real names, change
 * `LOCATION` here — nothing else needs to move.
 */

import { FIELDS_BY_KEY } from './profileSchema';

/** Fields that live as columns on the user record itself. */
const ROOT = new Set(['firstName', 'lastName', 'email', 'status', 'role', 'roles']);

/** Fields that live inside `profile.socialLinks`. */
const SOCIAL = new Set([
  'website', 'github', 'linkedin', 'twitter', 'dribbble', 'youtube', 'portfolio',
]);

/** Schema keys the API happens to name differently inside `profile`. */
const PROFILE_ALIASES = {
  currentCompany: 'company',
  profilePicture: 'picture',
  coverPhoto: 'cover',
};

/** Where does this field live? `'root' | 'social' | 'profile'` */
export function locationOf(key) {
  if (ROOT.has(key)) return 'root';
  if (SOCIAL.has(key)) return 'social';
  return 'profile';
}

/**
 * Build the flat, schema-keyed object the profile UI renders from.
 *
 * Later sources win, so the dashboard payload (freshest, most complete)
 * overrides the auth user. Reads are forgiving: a field is looked up under its
 * schema key, its profile alias, and its snake_case spelling, because different
 * endpoints in this codebase disagree about casing.
 */
export function toSchemaProfile(...sources) {
  const merged = {};
  for (const src of sources) {
    if (!src || typeof src !== 'object') continue;
    Object.assign(merged, flattenOne(src));
  }
  return merged;
}

function flattenOne(src) {
  const profile = src.profile || {};
  const social = profile.socialLinks || src.socialLinks || {};
  const out = { ...src, ...profile, ...social };

  for (const key of Object.keys(FIELDS_BY_KEY)) {
    if (out[key] != null && out[key] !== '') continue;

    const alias = PROFILE_ALIASES[key];
    const snake = toSnake(key);
    const candidate =
      (alias != null ? profile[alias] ?? src[alias] : undefined) ??
      profile[snake] ??
      src[snake] ??
      social[snake];

    if (candidate != null && candidate !== '') out[key] = candidate;
  }

  return out;
}

function toSnake(key) {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

/**
 * Build the PUT body for a single-field save.
 *
 * `currentProfile` is needed because `profile` and `socialLinks` are blobs —
 * sending a partial one would drop every other key. Returns `null` for derived
 * fields, which are earned rather than entered and must never be posted.
 */
export function fieldPayload(key, value, currentProfile = {}) {
  const field = FIELDS_BY_KEY[key];
  if (field?.aiFill === 'derived') return null;

  const where = locationOf(key);

  if (where === 'root') return { [key]: value };

  const profile = { ...(currentProfile.profile || {}) };

  if (where === 'social') {
    profile.socialLinks = { ...(profile.socialLinks || {}), [key]: value };
    return { profile };
  }

  profile[PROFILE_ALIASES[key] || key] = value;
  return { profile };
}
