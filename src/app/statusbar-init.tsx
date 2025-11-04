'use client';

import { useEffect } from 'react';

export default function StatusBarInit() {
  useEffect(() => {
    let mounted = true;

    const initializeStatusBar = async () => {
      try {
        // Wait for window to be available
        if (typeof window === 'undefined') return;

        // Dynamic import of Capacitor
        const { Capacitor } = await import('@capacitor/core');
        
        // Only proceed on native iOS platform
        if (!Capacitor.isNativePlatform()) {
          console.log('Not a native platform, skipping StatusBar init');
          return;
        }
        
        const platform = Capacitor.getPlatform();
        if (platform !== 'ios') {
          console.log('Not iOS platform, skipping StatusBar init');
          return;
        }

        console.log('Initializing StatusBar for iOS native platform');

        // Import StatusBar plugin
        const { StatusBar, Style } = await import('@capacitor/status-bar');

        // Configure status bar function
        const configureStatusBar = async () => {
          if (!mounted) return;

          try {
            console.log('Configuring StatusBar...');

            // 1) Do NOT overlay webview (puts content below the status bar)
            await StatusBar.setOverlaysWebView({ overlay: false });
            console.log('✓ StatusBar overlay set to false');

            // 2) Match your header background
            await StatusBar.setBackgroundColor({ color: '#ffffff' });
            console.log('✓ StatusBar background color set to white');

            // 3) Pick icon color to match your header (dark icons on light bg)
            await StatusBar.setStyle({ style: Style.Dark });
            console.log('✓ StatusBar style set to dark');

            console.log('✅ StatusBar configuration complete');
          } catch (err) {
            console.error('❌ Error configuring StatusBar:', err);
          }
        };

        // Wait for Capacitor bridge to be fully ready
        // This is crucial for remote URLs
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Initial configuration
        await configureStatusBar();

        // Re-configure on visibility change (handles app resume)
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            console.log('App visibility changed to visible, reconfiguring StatusBar');
            setTimeout(() => configureStatusBar(), 100);
          }
        };

        // Re-configure on page show (handles back navigation)
        const handlePageShow = () => {
          console.log('Page show event, reconfiguring StatusBar');
          setTimeout(() => configureStatusBar(), 100);
        };

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pageshow', handlePageShow);

        // Cleanup function
        return () => {
          mounted = false;
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          window.removeEventListener('pageshow', handlePageShow);
        };

      } catch (error) {
        console.error('StatusBar initialization error:', error);
      }
    };

    // Start initialization
    initializeStatusBar();

    // Cleanup on unmount
    return () => {
      mounted = false;
    };
  }, []);

  return null;
}


// 'use client';

// import { useEffect } from 'react';

// export default function StatusBarInit() {
//   useEffect(() => {
//     (async () => {
//       // Only run on devices with Capacitor + iOS
//       const isCap = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.();
//       const platform = (window as any).Capacitor?.getPlatform?.();
//       if (!isCap || platform !== 'ios') return;

//       try {
//         const { StatusBar, Style } = await import('@capacitor/status-bar');

//         // 1) Do NOT overlay webview (puts content below the status bar)
//         await StatusBar.setOverlaysWebView({ overlay: false });

//         // 2) Match your header background
//         await StatusBar.setBackgroundColor({ color: '#ffffff' });

//         // 3) Pick icon color to match your header (dark icons on light bg)
//         await StatusBar.setStyle({ style: Style.Dark });
//       } catch {
//         // no-op on web or if plugin not available
//       }
//     })();
//   }, []);

//   return null;
// }
