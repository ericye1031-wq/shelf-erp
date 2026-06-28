import React, { ComponentType } from 'react';

/** React.lazy 封装，统一 Suspense fallback */
export function lazyLoad<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> {
  return React.lazy(factory);
}
