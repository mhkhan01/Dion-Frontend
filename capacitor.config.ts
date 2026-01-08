import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bookinghub.app',
  appName: 'Booking-Hub',
  webDir: 'out', // ignored when server.url is set
  server: {
    // url: 'http://localhost:3000',  // For local development
    url: 'https://app.booking-hub.co.uk',  // For production testing
    cleartext: false  // must be https for iOS (you have https ✅)
  },
  // REMOVED ios.contentInset - this was causing the issue!
  // Let Capacitor handle safe area properly
  plugins: {
    StatusBar: {
      style: 'DARK',  // Dark icons on light background
      backgroundColor: '#ffffff',  // White background
      overlaysWebView: false  // Don't overlay - show status bar above content
    }
  }
};

export default config;


// import type { CapacitorConfig } from '@capacitor/cli';

// const config: CapacitorConfig = {
//   appId: 'com.bookinghub.app',
//   appName: 'Booking-Hub',
//   webDir: 'out', // ignored when server.url is set
//   server: {
//     // url: 'http://localhost:3000',
//     url: 'https://www.booking-hub.co.uk', // Live website URL
//     cleartext: false                      // must be https for iOS (you have https ✅)
//   },
//   ios : {
//     contentInset: 'never',
//   }
// };

// export default config;


// import type { CapacitorConfig } from '@capacitor/cli';

// const config: CapacitorConfig = {
//   appId: 'com.bookinghub.app',
//   appName: 'Booking-Hub',
//   webDir: 'out', // ignored when server.url is set
//   server: {
//     //   url: 'http://localhost:3000',
//      url: 'https://www.booking-hub.co.uk',//http://localhost:3000','https://www.booking-hub.co.uk',//'https://www.booking-hub.co.uk/', // your live app
//     cleartext: false                      // must be https for iOS (you have https ✅)
//   },
//   ios : {
//     contentInset: 'never',
//   }
// };

// export default config;