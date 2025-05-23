import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    // Use requestAnimationFrame to ensure navigation happens after initial render
    const raf = requestAnimationFrame(() => {
      // Redirect user to the login page on app start
      router.replace('/login');
    });

    // Clean up the animation frame when the component unmounts
    return () => cancelAnimationFrame(raf);
  }, []);

  // This component does not render any UI
  return null;
}