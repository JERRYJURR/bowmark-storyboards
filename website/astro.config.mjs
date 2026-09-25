// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Static by default. Every route in this milestone is prerendered HTML; the
// only client JS is the two islands (install selector, decompile scene).
export default defineConfig({
  integrations: [react()],
  // The dev toolbar overlays the bottom of the scene during visual review.
  devToolbar: { enabled: false },
});
