/**
 * SAMPLE VISIONS AND STARTUPS.
 *
 * The two board pages — /ideation and /discover-startups — are the ones people
 * judge the product by, and both were empty. An empty board is indistinguishable
 * from a broken one, and it makes every feature that sits on top of it
 * (momentum flames, the burning-box treatment, filters, sorting, the credits
 * gate) impossible to review.
 *
 * So: twelve Visions and ten startups, spread deliberately across stages,
 * industries and engagement levels. Some are hot, most are not — a board where
 * everything burns tells you as little as one where nothing does.
 *
 * ⚠️ SAMPLE DATA. Boards must label it — see `isSample` — and never blend it
 * silently with real records.
 */

/**
 * Banners and logos are generated gradients rather than image files.
 *
 * There is no asset pipeline yet and stock photography would be a lie about
 * what these are. A deterministic gradient per record gives every card a
 * distinct, stable identity that survives a reload — and when real uploads
 * arrive, `bannerUrl`/`logoUrl` simply take precedence.
 */
export const BANNERS = [
  'linear-gradient(135deg,#ffbf5e 0%,#ff6f3c 55%,#8b6cff 100%)',
  'linear-gradient(135deg,#4fd8ff 0%,#8b6cff 60%,#ff4fd8 100%)',
  'linear-gradient(135deg,#3ee6a0 0%,#4fd8ff 60%,#8b6cff 100%)',
  'linear-gradient(135deg,#ff6fd8 0%,#8b6cff 55%,#4fd8ff 100%)',
  'linear-gradient(135deg,#ffbf5e 0%,#3ee6a0 60%,#4fd8ff 100%)',
  'linear-gradient(135deg,#8b6cff 0%,#4fd8ff 50%,#3ee6a0 100%)',
];

/** Stable per-id, so a card keeps its colours between renders. */
export function bannerFor(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return BANNERS[h % BANNERS.length];
}

// Sample data removed – now only real backend data is used.
// export const SAMPLE_STARTUPS = [ ... ];
// export const SAMPLE_VISIONS = [ ... ];
// export function withBoardFallback(...) { ... }