interface ImportMetaEnv {
  readonly PUBLIC_APPLY_URL?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  turnstile?: {
    render(container: HTMLElement, options: Record<string, unknown>): string;
    reset(widgetId?: string): void;
    remove(widgetId?: string): void;
  };
}
