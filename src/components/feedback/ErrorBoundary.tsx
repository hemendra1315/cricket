import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button } from '@/components/ui';
import { reportError } from '@/lib/logger';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { error: Error | null };

/**
 * Top-level render-error boundary. Everything it catches is funnelled through
 * `reportError`, the single place where an external sink is wired up.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(error, { componentStack: info.componentStack });
  }

  private reset = () => this.setState({ error: null });

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-fg text-xl font-semibold">The app hit an unexpected error</h1>
        <p className="text-fg-muted max-w-md text-sm">Something went wrong. Please try again.</p>
        <div className="flex gap-2">
          <Button onClick={this.reset}>Try again</Button>
          <Button variant="secondary" onClick={() => window.location.assign('/')}>
            Go home
          </Button>
        </div>
      </div>
    );
  }
}
