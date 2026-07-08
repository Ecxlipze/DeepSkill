// Build-mode helpers for the dual deploy targets (see next.config.js).
// These run only inside getStaticProps/getStaticPaths (Node, build time),
// so reading a non-NEXT_PUBLIC env var is safe.
const IS_EXPORT = process.env.NEXT_OUTPUT === 'export';

export const isExportBuild = IS_EXPORT;

// Spread into a getStaticProps return value: { props, ...maybeRevalidate(60) }.
// ISR is unsupported with output:'export', where Next hard-errors on `revalidate`.
export function maybeRevalidate(seconds) {
  return IS_EXPORT ? {} : { revalidate: seconds };
}

// Use as getStaticPaths' fallback. Export mode only supports fallback:false;
// on the Node deploy 'blocking' lets new slugs render on first request.
export function staticFallback(mode = 'blocking') {
  return IS_EXPORT ? false : mode;
}
