import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * Top-level render-error catch-all so a thrown render can never blank the page
 * (mirrors screenwriter_app/music_app's provider-stack shape). It also handles
 * the specific failure that *did* blank the page here: a lazy route chunk that
 * fails to load — a stale hashed chunk after a redeploy, or the dev server
 * blipping — which React surfaces as "Failed to fetch dynamically imported
 * module". For that one case the right fix is a single hard reload to pull the
 * current chunks; a `sessionStorage` flag stops it from looping if the reload
 * does not help.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // A failed lazy chunk is usually transient (stale hash after a redeploy, a
    // server blip) and a reload fixes it. Reload at most once per 10s window so
    // a chunk that is genuinely gone shows the message instead of looping.
    if (isChunkLoadError(error) && !reloadedRecently()) {
      window.location.reload();
      return;
    }
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
          <div>
            <h1 className="text-xl font-semibold text-theme-text-primary">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-theme-text-secondary">
              Reload the page to try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md bg-theme-accent-primary px-4 py-2 text-sm font-medium text-white"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/** True if we auto-reloaded for a chunk error in the last 10s — stops a reload loop. */
function reloadedRecently(): boolean {
  const KEY = 'characterbuilder.chunkReloadAt';
  const now = Date.now();
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? '0');
    if (now - last < 10_000) return true;
    sessionStorage.setItem(KEY, String(now));
  } catch {
    /* storage blocked — allow the reload */
  }
  return false;
}

/** A dynamic `import()` that failed to fetch its chunk (stale hash, network blip). */
function isChunkLoadError(error: Error): boolean {
  const msg = `${error?.name ?? ''} ${error?.message ?? ''}`;
  return (
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    error?.name === 'ChunkLoadError'
  );
}
