import { useEffect } from 'react';

export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} | BhaktVerse`;
    return () => { document.title = 'BhaktVerse - AI Spiritual Platform'; };
  }, [title]);
};
