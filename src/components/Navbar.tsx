// components/Navbar.tsx
'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isNative } from '@/lib/is-native'; // ✅ checks if running in Capacitor (native app)

export default function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const isCapacitor =
  typeof window !== 'undefined' &&
  (window as any).Capacitor?.isNativePlatform?.();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'contractor': return '/contractor';
      case 'landlord':   return '/partner';
      case 'admin':      return '/admin';
      default:           return '/';
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 ${
        isCapacitor ? 'pt-safe' : 'pt-0'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={getDashboardLink()} className="text-xl font-bold text-gray-900">
              BookingHub
            </Link>
          </div>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center space-x-8">
              <Link href={getDashboardLink()} className="nav-link">Dashboard</Link>
              {user.role === 'contractor' && (
                <Link href="/contractor/properties" className="nav-link">Browse Properties</Link>
              )}
              {user.role === 'landlord' && (
                <Link href="/partner/properties" className="nav-link">My Properties</Link>
              )}
              {user.role === 'admin' && (
                <Link href="/admin/bookings" className="nav-link">All Bookings</Link>
              )}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden sm:block text-sm text-gray-700">
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-gray-500 capitalize">{user.role}</div>
                </div>
                <button onClick={handleSignOut} className="btn btn-ghost text-sm">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-ghost">
                  Sign In
                </Link>
                <Link href="/auth/signup/client" className="btn btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}


// // components/Navbar.tsx
// 'use client';

// import { useAuth } from '@/lib/auth-context';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';

// export default function Navbar() {
//   const { user, signOut } = useAuth();
//   const router = useRouter();

//   const handleSignOut = async () => {
//     await signOut();
//     router.push('/');
//   };

//   const getDashboardLink = () => {
//     if (!user) return '/';
//     switch (user.role) {
//       case 'contractor': return '/contractor';
//       case 'landlord': return '/landlord';
//       case 'admin': return '/admin';
//       default: return '/';
//     }
//   };

//   return (
//     <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
//       <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           <div className="flex items-center">
//             <Link href={getDashboardLink()} className="text-xl font-bold text-gray-900">
//               BookingHub
//             </Link>
//           </div>

//           {user && (
//             <div className="hidden md:flex items-center space-x-8">
//               <Link href={getDashboardLink()} className="nav-link">Dashboard</Link>
//               {user.role === 'contractor' && <Link href="/contractor/properties" className="nav-link">Browse Properties</Link>}
//               {user.role === 'landlord' && <Link href="/landlord/properties" className="nav-link">My Properties</Link>}
//               {user.role === 'admin' && <Link href="/admin/bookings" className="nav-link">All Bookings</Link>}
//             </div>
//           )}

//           <div className="flex items-center space-x-4">
//             {user ? (
//               <>
//                 <div className="hidden sm:block text-sm text-gray-700">
//                   <div className="font-medium">{user.full_name}</div>
//                   <div className="text-gray-500 capitalize">{user.role}</div>
//                 </div>
//                 <button onClick={handleSignOut} className="btn btn-ghost text-sm">Sign Out</button>
//               </>
//             ) : (
//               <>
//                 <Link href="/auth/login" className="btn btn-ghost">Sign In</Link>
//                 <Link href="/auth/signup/client" className="btn btn-primary">Get Started</Link>
//               </>
//             )}
//           </div>
//         </div>
//       </nav>
//     </header>
//   );
// }


// // 'use client';

// // import { useAuth } from '@/lib/auth-context';
// // import { useRouter } from 'next/navigation';
// // import Link from 'next/link';

// // export default function Navbar() {
// //   const { user, signOut } = useAuth();
// //   const router = useRouter();

// //   const handleSignOut = async () => {
// //     await signOut();
// //     router.push('/');
// //   };

// //   const getDashboardLink = () => {
// //     if (!user) return '/';
    
// //     switch (user.role) {
// //       case 'contractor':
// //         return '/contractor';
// //       case 'landlord':
// //         return '/landlord';
// //       case 'admin':
// //         return '/admin';
// //       default:
// //         return '/';
// //     }
// //   };

// //   return (
// //     <nav 
// //       className="bg-white shadow-sm border-b border-gray-200 sticky top-500 z-50"
// //       style={{
// //         paddingTop: 'env(safe-area-inset-top, 500px)',
// //         paddingLeft: 'env(safe-area-inset-left, 0px)',
// //         paddingRight: 'env(safe-area-inset-right, 0px)',
// //       }}
// //     >
// //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //         <div className="flex justify-between items-center h-16">
// //           {/* Logo */}
// //           <div className="flex items-center">
// //             <Link href={getDashboardLink()} className="text-xl font-bold text-gray-900">
// //               PropertyBook
// //             </Link>
// //           </div>

// //           {/* Navigation Links */}
// //           {user && (
// //             <div className="hidden md:flex items-center space-x-8">
// //               <Link href={getDashboardLink()} className="nav-link">
// //                 Dashboard
// //               </Link>
              
// //               {user.role === 'contractor' && (
// //                 <Link href="/contractor/properties" className="nav-link">
// //                   Browse Properties
// //                 </Link>
// //               )}
              
// //               {user.role === 'landlord' && (
// //                 <Link href="/landlord/properties" className="nav-link">
// //                   My Properties
// //                 </Link>
// //               )}
              
// //               {user.role === 'admin' && (
// //                 <Link href="/admin/bookings" className="nav-link">
// //                   All Bookings
// //                 </Link>
// //               )}
// //             </div>
// //           )}

// //           {/* User Menu */}
// //           <div className="flex items-center space-x-4">
// //             {user ? (
// //               <div className="flex items-center space-x-4">
// //                 <div className="hidden sm:block text-sm text-gray-700">
// //                   <div className="font-medium">{user.full_name}</div>
// //                   <div className="text-gray-500 capitalize">{user.role}</div>
// //                 </div>
                
// //                 <div className="relative">
// //                   <button
// //                     onClick={handleSignOut}
// //                     className="btn btn-ghost text-sm"
// //                   >
// //                     Sign Out
// //                   </button>
// //                 </div>
// //               </div>
// //             ) : (
// //               <div className="flex items-center space-x-4">
// //                 <Link href="/auth/login" className="btn btn-ghost">
// //                   Sign In
// //                 </Link>
// //                 <Link href="/auth/signup/client" className="btn btn-primary">
// //                   Get Started
// //                 </Link>
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </nav>
// //   );
// // }


// // 'use client';

// // import { useAuth } from '@/lib/auth-context';
// // import { useRouter } from 'next/navigation';
// // import Link from 'next/link';

// // export default function Navbar() {
// //   const { user, signOut } = useAuth();
// //   const router = useRouter();

// //   const handleSignOut = async () => {
// //     await signOut();
// //     router.push('/');
// //   };

// //   const getDashboardLink = () => {
// //     if (!user) return '/';
// //     switch (user.role) {
// //       case 'contractor':
// //         return '/contractor';
// //       case 'landlord':
// //         return '/landlord';
// //       case 'admin':
// //         return '/admin';
// //       default:
// //         return '/';
// //     }
// //   };

// //   return (
// //     <header className="sticky top-0 z-50">
// //       {/* Safe-area spacer sits UNDER the notch, ABOVE the bar */}
// //       <div className="h-[env(safe-area-inset-top,0px)] bg-white/95 backdrop-blur border-b border-gray-200" />

// //       <nav className="bg-white/95 backdrop-blur border-b border-gray-200">
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //           <div className="flex justify-between items-center h-16">
// //             {/* Logo */}
// //             <div className="flex items-center">
// //               <Link href={getDashboardLink()} className="text-xl font-bold text-gray-900">
// //                 PropertyBook
// //               </Link>
// //             </div>

// //             {/* Navigation Links */}
// //             {user && (
// //               <div className="hidden md:flex items-center space-x-8">
// //                 <Link href={getDashboardLink()} className="nav-link">
// //                   Dashboard
// //                 </Link>

// //                 {user.role === 'contractor' && (
// //                   <Link href="/contractor/properties" className="nav-link">
// //                     Browse Properties
// //                   </Link>
// //                 )}

// //                 {user.role === 'landlord' && (
// //                   <Link href="/landlord/properties" className="nav-link">
// //                     My Properties
// //                   </Link>
// //                 )}

// //                 {user.role === 'admin' && (
// //                   <Link href="/admin/bookings" className="nav-link">
// //                     All Bookings
// //                   </Link>
// //                 )}
// //               </div>
// //             )}

// //             {/* User Menu */}
// //             <div className="flex items-center space-x-4">
// //               {user ? (
// //                 <div className="flex items-center space-x-4">
// //                   <div className="hidden sm:block text-sm text-gray-700">
// //                     <div className="font-medium">{user.full_name}</div>
// //                     <div className="text-gray-500 capitalize">{user.role}</div>
// //                   </div>

// //                   <button onClick={handleSignOut} className="btn btn-ghost text-sm">
// //                     Sign Out
// //                   </button>
// //                 </div>
// //               ) : (
// //                 <div className="flex items-center space-x-4">
// //                   <Link href="/auth/login" className="btn btn-ghost">
// //                     Sign In
// //                   </Link>
// //                   <Link href="/auth/signup/client" className="btn btn-primary">
// //                     Get Started
// //                   </Link>
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       </nav>
// //     </header>
// //   );
// // }
