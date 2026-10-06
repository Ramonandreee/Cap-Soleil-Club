// Configuração do Astro (site estático).
// O endereço público vem de SITE_URL (defina em Cloudflare Pages › Settings ›
// Environment variables). Sem ele, usa o endereço que a hospedagem informa
// no build, e por último o do computador.
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const site =
  process.env.SITE_URL ||
  process.env.CF_PAGES_URL ||
  "http://localhost:4321";

export default defineConfig({
  site,
  trailingSlash: "never",
  build: {
    // privacy.html em vez de privacy/index.html: a Cloudflare serve como /privacy.
    format: "file",
    // A CSP bloqueia <style> e <script> escritos no HTML: tudo vira arquivo.
    inlineStylesheets: "never",
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
      // Um só arquivo de CSS: menos pedidos antes do primeiro quadro.
      cssCodeSplit: false,
    },
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/404"),
    }),
  ],
});
