import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'HermesEntertainmentPack',
      formats: ['iife'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react/jsx-runtime': '__hermesJsxRuntime',
        },
        banner: `/* Hermes Entertainment Pack bootstrap */
try {
  var __SDK__ = window.__HERMES_PLUGIN_SDK__;
  if (__SDK__ && __SDK__.React) {
    var React = __SDK__.React;
    var ReactDOM = null;
    var __hermesJsxRuntime = {
      Fragment: React.Fragment,
      jsx: function(type, props, key) {
        var p = props ? Object.assign({}, props) : {};
        if (key !== void 0) p.key = key;
        var ch = p.children;
        delete p.children;
        if (ch === void 0) return React.createElement(type, p);
        if (Array.isArray(ch)) return React.createElement.apply(React, [type, p].concat(ch));
        return React.createElement(type, p, ch);
      },
      jsxs: function(type, props, key) {
        var p = props ? Object.assign({}, props) : {};
        if (key !== void 0) p.key = key;
        var ch = p.children;
        delete p.children;
        if (!Array.isArray(ch)) return React.createElement(type, p, ch);
        return React.createElement.apply(React, [type, p].concat(ch));
      }
    };
  } else {
    console?.error?.('[hermes-entertainment-pack] Plugin SDK not available');
  }
} catch (e) {
  console?.error?.('[hermes-entertainment-pack] Bootstrap failed', e);
}`,
      },
    },
  },
});
