import { useEffect } from 'react';

/** Sets the document title to "<title> · puffx" for the lifetime of the page. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · puffx` : 'puffx';
    return () => {
      document.title = 'puffx';
    };
  }, [title]);
}
