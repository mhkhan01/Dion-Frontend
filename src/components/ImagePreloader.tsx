'use client';

import { useEffect } from 'react';

export default function ImagePreloader() {
  useEffect(() => {
    // Preload all critical images immediately on mount
    const images = [
      '/Port talbot-1.webp',
      '/Houses.webp',
      '/Houses-1.webp',
      '/Mobile-Mockup.png',
      '/blue-teal.webp',
      '/white-teal.webp',
      '/bedford.webp',
      '/Birmingham.webp',
      '/Bristol.webp',
      '/Cardiff.webp',
      '/Crane Cardiff.webp',
      '/House driveway.webp',
      '/Houses - 2.webp',
      '/London.webp',
      '/London Construction.webp',
      '/Manchester.webp',
      '/Milford heaven.webp',
      '/NHS workers.webp',
      '/Port Talbot.webp',
      '/Rail Workers.webp',
      '/sizewell.webp',
      '/Swansea.webp',
      '/Swansea - 1.webp',
      '/ABP-logo.webp',
      '/celtic.webp',
      '/Find-a-Business-Expert.webp',
      '/morgan-sindall-65526.webp',
      '/NPT-Council-Logo-300x238.webp',
      '/SRM_Logo.webp',
      '/swansea bay deal.webp',
      '/Swansea_City_Council_Logo_svg.webp',
      '/Tata Steel.webp',
      '/google-play.png'
    ];

    // Create Image objects to force browser to download
    images.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    // Also use fetch API for more aggressive preloading
    if ('caches' in window) {
      caches.open('image-preload-v1').then(cache => {
        images.forEach(src => {
          fetch(src)
            .then(response => {
              if (response.ok) {
                cache.put(src, response.clone());
              }
            })
            .catch(() => {
              // Silently fail for missing images
            });
        });
      });
    }
  }, []);

  return null; // This component doesn't render anything
}
