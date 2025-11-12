'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const PageLoader = dynamic(
  () => import('./page-loader').then((mod) => mod.PageLoader),
  { ssr: false, loading: () => null }
);

export default function PageLoaderWrapper() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const url = `${pathname}?${searchParams}`;

  useEffect(() => {
    // Function to handle link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor) {
        // Don't trigger for cart-related links/buttons
        if (anchor.closest('[data-cart-button]') || 
            anchor.closest('[data-add-to-cart]') ||
            anchor.closest('.cart-button') || 
            anchor.closest('.add-to-cart')) {
          return;
        }

        const href = anchor.getAttribute('href');
        // Only intercept internal links that change the page
        if (href && 
            !href.startsWith('http') && 
            !href.startsWith('mailto:') && 
            !href.startsWith('tel:') &&
            !href.startsWith('#') &&
            href !== '#' &&
            href !== window.location.pathname) {
          setIsLoading(true);
          document.body.style.overflow = 'hidden';
        }
      }
    };

    // Add click event listener to the document
    document.addEventListener('click', handleLinkClick, true);

    // Handle route changes (for programmatic navigation)
    const handleRouteChange = () => {
      // Only show if not already loading (to prevent showing on cart updates)
      if (!isLoading) {
        setIsLoading(true);
        document.body.style.overflow = 'hidden';
      }
    };

    // Listen for route changes
    window.addEventListener('routeChangeStart', handleRouteChange);

    // Listen for page load completion
    const handleLoad = () => {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setIsLoading(false);
        document.body.style.overflow = 'auto';
      }, 500);
    };

    // Check if the page is already loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Clean up
    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('routeChangeStart', handleRouteChange);
      window.removeEventListener('load', handleLoad);
      document.body.style.overflow = 'auto';
    };
  }, [isLoading, url]);

  return isLoading ? <PageLoader /> : null;
}