import type { StyleProp, ViewStyle } from 'react-native';

import type { ArtName } from '../art/registry';
import { EmptyState } from './EmptyState';

export interface ErrorStateProps {
  /** The failed query's error (an ApiError from @pro/api, or any Error). */
  error: unknown;
  onRetry: () => void;
  title?: string;
  /** Art for a general failure. */
  art?: ArtName;
  style?: StyleProp<ViewStyle>;
}

/** Duck-typed so the design system does not depend on the API client. */
function describe(error: unknown) {
  const e = (typeof error === 'object' && error !== null ? error : {}) as { isNetworkError?: unknown; status?: unknown; message?: unknown };
  return {
    offline: e.isNetworkError === true,
    notFound: e.status === 404,
    message: typeof e.message === 'string' && e.message ? e.message : null,
  };
}

/** The error state for a failed load: offline, not found or a general failure, with a retry button. */
export function ErrorState({ error, onRetry, title, art = 'electric-light-bulb', style }: ErrorStateProps) {
  const { offline, notFound, message } = describe(error);
  return (
    <EmptyState
      art={offline ? 'electric-plug' : notFound ? 'compass' : art}
      title={title ?? (offline ? 'You seem to be offline' : notFound ? 'We could not find that' : 'Something went wrong')}
      message={offline ? 'Check your internet connection and try again.' : (message ?? 'Please try again in a moment.')}
      actionLabel="Try again"
      onAction={onRetry}
      style={style}
    />
  );
}
