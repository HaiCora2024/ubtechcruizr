import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import legacy from "@vitejs/plugin-legacy";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages serves project sites under "/<repo>/". Auto-detect in Actions to avoid manual base edits.
  base: (() => {
    const fromEnv = process.env.VITE_BASE?.trim();
    if (fromEnv) return fromEnv;

    const repo = process.env.GITHUB_REPOSITORY?.split("/")?.[1]?.trim();
    if (!repo) return "/";

    // Special case for user/organization Pages (repo "<owner>.github.io") which is served at "/".
    if (repo.endsWith(".github.io")) return "/";

    return `/${repo}/`;
  })(),
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      modernPolyfills: true,
      polyfills: [
        'es.symbol',
        'es.array.iterator',
        'es.promise',
        'es.object.assign',
        'es.promise.finally',
        'es.string.includes',
        'es.array.includes',
      ],
    }),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
      format: {
        comments: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
