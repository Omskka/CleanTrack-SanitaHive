import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      router.replace('/login');
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
