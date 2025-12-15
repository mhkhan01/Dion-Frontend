import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import StatusBarInit from './statusbar-init';
import { AppShell } from './AppShell';   // 👈 NEW

const inter = Inter({ subsets: ['latin'] });

const avenirNext = localFont({
  src: [
    {
      path: '../fonts/AvenirNextLTPro-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/AvenirNextLTPro-MediumCn.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/AvenirNextLTPro-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-avenir',
});

const avenirBold = localFont({
  src: '../fonts/AvenirNextLTPro-Bold.otf',
  weight: '700',
  style: 'normal',
  variable: '--font-avenir-bold',
});

const avenirRegular = localFont({
  src: '../fonts/AvenirNextLTPro-Regular.otf',
  weight: '400',
  style: 'normal',
  variable: '--font-avenir-regular',
});

export const metadata: Metadata = {
  title: 'Booking Hub' ,
  description: 'A modern booking platform for clients and partners',
  keywords: ['booking', 'rental', 'client', 'partner'],
  authors: [{ name: 'Booking Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Booking Hub',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  applicationName: 'Booking Hub',
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Booking Hub',
    title: 'Booking Hub',
    description: 'A modern property booking platform for clients and partners',
  },
  twitter: {
    card: 'summary',
    title: 'Booking Hub',
    description: 'A modern property booking platform for clients and partners',
  },
};

// ✅ Enables iOS safe-area variables (viewport-fit=cover)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0284c7',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${avenirNext.variable} ${avenirBold.variable} ${avenirRegular.variable}`}>
      {/* 🧠 Add PWA + iOS Safe Area Meta Tags here */}
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        
        {/* Preload critical images for faster loading */}
        <link rel="preload" href="/Port%20talbot-1.webp" as="image" type="image/webp" />
        <link rel="preload" href="/blue-teal.webp" as="image" type="image/webp" />
        <link rel="preload" href="/Houses.webp" as="image" type="image/webp" />
        <link rel="preload" href="/Houses-1.webp" as="image" type="image/webp" />
        
        {/* Preload carousel images */}
        <link rel="preload" href="/bedford.webp" as="image" type="image/webp" />
        <link rel="preload" href="/Birmingham.webp" as="image" type="image/webp" />
        <link rel="preload" href="/Bristol.webp" as="image" type="image/webp" />
        <link rel="preload" href="/Cardiff.webp" as="image" type="image/webp" />
        <link rel="preload" href="/Crane%20Cardiff.webp" as="image" type="image/webp" />
        <link rel="preload" href="/House%20driveway.webp" as="image" type="image/webp" />
        <link rel="preload" href="/Houses%20-%202.webp" as="image" type="image/webp" />
        <link rel="preload" href="/London.webp" as="image" type="image/webp" />
        <link rel="preload" href="/London%20Construction.webp" as="image" type="image/webp" />
        <link rel="preload" href="/Manchester.webp" as="image" type="image/webp" />
        <link rel="preload" href="/Milford%20heaven.webp" as="image" type="image/webp" />
        <link rel="preload" href="/NHS%20workers.webp" as="image" type="image/webp" />
        <link rel="preload" href="/Port%20Talbot.webp" as="image" type="image/webp" />
        <link rel="preload" href="/Rail%20Workers.webp" as="image" type="image/webp" />
        <link rel="preload" href="/sizewell.webp" as="image" type="image/webp" />
        <link rel="preload" href="/Swansea.webp" as="image" type="image/webp" />
        <link rel="preload" href="/Swansea%20-%201.webp" as="image" type="image/webp" />
        
        {/* Preload logo images */}
        <link rel="preload" href="/ABP-logo.webp" as="image" type="image/webp" />
        <link rel="preload" href="/celtic.webp" as="image" type="image/webp" />
        <link rel="preload" href="/Find-a-Business-Expert.webp" as="image" type="image/webp" />
        <link rel="preload" href="/morgan-sindall-65526.webp" as="image" type="image/webp" />
        <link rel="preload" href="/NPT-Council-Logo-300x238.webp" as="image" type="image/webp" />
        <link rel="preload" href="/SRM_Logo.webp" as="image" type="image/webp" />
        <link rel="preload" href="/swansea%20bay%20deal.webp" as="image" type="image/webp" />
        <link rel="preload" href="/Swansea_City_Council_Logo_svg.webp" as="image" type="image/webp" />
        <link rel="preload" href="/Tata%20Steel.webp" as="image" type="image/webp" />
      </head>

      <body className={`${inter.className} h-full`}>
        {/* Initialize Capacitor StatusBar if running native */}
        <StatusBarInit />

        <AuthProvider>
          <AppShell>
            <div className="min-h-full bg-gray-50 text-gray-900 antialiased">
              {children}
            </div>
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}


// import type { Metadata, Viewport } from 'next';
// import { Inter } from 'next/font/google';
// import './globals.css';
// import { AuthProvider } from '@/lib/auth-context';
// import StatusBarInit from './statusbar-init';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'Property Booking System',
//   description: 'A modern property booking platform for contractors and landlords',
//   keywords: ['property', 'booking', 'rental', 'contractor', 'landlord'],
//   authors: [{ name: 'Property Booking Team' }],
//   manifest: '/manifest.json',
//   icons: {
//     icon: [
//       { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
//       { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
//       { url: '/icons/icon-48x48.png', sizes: '48x48', type: 'image/png' },
//       { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
//       { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
//       { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
//     ],
//     apple: [
//       { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
//       { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
//     ],
//     shortcut: '/icons/icon-192x192.png',
//   },
//   appleWebApp: {
//     capable: true,
//     statusBarStyle: 'default',
//     title: 'Booking Hub',
//   },
//   other: {
//     'mobile-web-app-capable': 'yes',
//   },
//   applicationName: 'Property Booking Hub',
//   formatDetection: {
//     telephone: false,
//   },
//   openGraph: {
//     type: 'website',
//     siteName: 'Property Booking Hub',
//     title: 'Property Booking System',
//     description: 'A modern property booking platform for contractors and landlords',
//   },
//   twitter: {
//     card: 'summary',
//     title: 'Property Booking System',
//     description: 'A modern property booking platform for contractors and landlords',
//   },
// };

// // ✅ Enables iOS safe-area variables (viewport-fit=cover)
// export const viewport: Viewport = {
//   width: 'device-width',
//   initialScale: 1,
//   maximumScale: 1,
//   userScalable: false,
//   themeColor: '#0284c7',
//   viewportFit: 'cover',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" className="h-full">
//       <body className={`${inter.className} h-full`}>
//         <StatusBarInit />
//         <AuthProvider>
//           <div className="min-h-full bg-gray-50 text-gray-900 antialiased">
//             {children}
//           </div>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }