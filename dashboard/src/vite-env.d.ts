/// <reference types="vite/client" />

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare global {
  interface Window {
    __HERMES_SESSION_TOKEN__?: string;
    __HERMES_BASE_PATH__?: string;
    __HERMES_PLUGINS__?: {
      register: (name: string, component: unknown) => void;
      [key: string]: unknown;
    };
  }
}
