import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const configuredUrl = env.VITE_SITE_URL?.trim();
  const siteUrl = configuredUrl ? new URL('/', configuredUrl).href : null;

  return {
    plugins: [{
      name: 'social-preview-urls',
      transformIndexHtml(html) {
        if (!siteUrl) return html;
        const imageUrl = new URL('brand/og.png', siteUrl).href;
        return {
          html: html.replaceAll('content="/brand/og.png"', `content="${imageUrl}"`),
          tags: [
            { tag: 'link', attrs: { rel: 'canonical', href: siteUrl }, injectTo: 'head' },
            { tag: 'meta', attrs: { property: 'og:url', content: siteUrl }, injectTo: 'head' }
          ]
        };
      }
    }]
  };
});
