'use client';

import { useState, useEffect } from 'react';
import ImagePreloader from '../../components/ImagePreloader';


export default function HomePage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openFAQs, setOpenFAQs] = useState<Set<number>>(new Set());
  const [visibleFAQCount, setVisibleFAQCount] = useState(6);
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isLogoCarouselPaused, setIsLogoCarouselPaused] = useState(false);
  const [logoScrollPosition, setLogoScrollPosition] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isReviewTransitioning, setIsReviewTransitioning] = useState(true);

  // Rotating words for the headline
  const rotatingWords = ['Contractor', 'Corporate', 'Emergency', 'Temporary', 'Worker'];

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as Element;
        if (!target.closest('.mobile-menu-container')) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Handle screen size detection for carousel
  useEffect(() => {
    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 641);
      }
    };

    // Check on mount
    checkScreenSize();

    // Add resize listener
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkScreenSize);
      return () => window.removeEventListener('resize', checkScreenSize);
    }
  }, []);

  // Rotating word animation
  useEffect(() => {
    let isFirstCycle = true;
    
    const interval = setInterval(() => {
      if (isFirstCycle) {
        // On first cycle, skip animation and go directly to next word
        isFirstCycle = false;
        setIsInitialLoad(false);
        setCurrentWordIndex(1); // Jump to Corporate
      } else {
        setIsAnimating(true);
        
        setTimeout(() => {
          setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
          setIsAnimating(false);
        }, 600); // Half of animation duration for word change
      }
    }, 3000); // Change word every 3 seconds

    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  // Auto-scroll for logo carousel - continuous infinite scroll
  useEffect(() => {
    if (isLogoCarouselPaused) return;

    const interval = setInterval(() => {
      setLogoScrollPosition(prev => {
        const logoWidth = isMobile ? 128 : 160; // Mobile per-item width incl. gap
        const totalWidth = logoData.length * logoWidth;
        const newPosition = prev + 0.5; // Move 0.5px at a time for smooth scroll
        
        // Reset to 0 when we've scrolled through the first set of logos
        // The second set will seamlessly continue the loop
        if (newPosition >= totalWidth) {
          return 0;
        }
        return newPosition;
      });
    }, 16); // Update every 16ms for smooth 60fps animation

    return () => clearInterval(interval);
  }, [isLogoCarouselPaused, isMobile]);



  const nextImage = () => {
    // Calculate max position based on viewport to ensure last tile is fully visible
    const tileWidth = (typeof window !== 'undefined' && window.innerWidth >= 768) ? 320 : (typeof window !== 'undefined' && window.innerWidth >= 640) ? 240 : 160;
    const gapWidth = (typeof window !== 'undefined' && window.innerWidth >= 768) ? 24 : (typeof window !== 'undefined' && window.innerWidth >= 640) ? 16 : 8;
    const viewportWidth = (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 1280 : (typeof window !== 'undefined' && window.innerWidth >= 640) ? 672 : 320;
    const totalWidth = 10 * tileWidth + 9 * gapWidth; // 10 tiles total
    const maxScroll = totalWidth - viewportWidth;
    const slideDistance = tileWidth + gapWidth;
    // Ensure enough scroll positions for all tiles - add extra buffer for smaller mobile screens
    const calculatedMax = Math.ceil(maxScroll / slideDistance) + 2;
    setCurrentImageIndex(prev => Math.min(prev + 1, calculatedMax));
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => Math.max(prev - 1, 0)); // Move one position at a time, min position 0
  };

  // Logo carousel navigation functions
  const nextLogo = () => {
    const logoWidth = isMobile ? 120 : 160;
    setLogoScrollPosition(prev => {
      const newPosition = prev + logoWidth;
      const totalWidth = logoData.length * logoWidth;
      return newPosition >= totalWidth ? 0 : newPosition;
    });
  };

  const prevLogo = () => {
    const logoWidth = isMobile ? 120 : 160;
    setLogoScrollPosition(prev => {
      const newPosition = prev - logoWidth;
      const totalWidth = logoData.length * logoWidth;
      return newPosition < 0 ? totalWidth - logoWidth : newPosition;
    });
  };

  // Logo data - actual company logos
  const logoData = [
    { 
      src: "/ABP-logo.webp",
      alt: "ABP Logo"
    },
    { 
      src: "/celtic.webp",
      alt: "Celtic Logo"
    },
    { 
      src: "/Find-a-Business-Expert.webp",
      alt: "Find a Business Expert Logo"
    },
    { 
      src: "/morgan-sindall-65526.webp",
      alt: "Morgan Sindall Logo"
    },
    { 
      src: "/NPT-Council-Logo-300x238.webp",
      alt: "NPT Council Logo"
    },
    { 
      src: "/SRM_Logo.webp",
      alt: "SRM Logo"
    },
    { 
      src: "/swansea bay deal.webp",
      alt: "Swansea Bay Deal Logo"
    },
    { 
      src: "/Swansea_City_Council_Logo_svg.webp",
      alt: "Swansea City Council Logo"
    },
    { 
      src: "/Tata Steel.webp",
      alt: "Tata Steel Logo"
    }
  ];

  // Reviews data - static data that can be replaced with API data later
  const reviewsData = [
    {
      reviewerName: "Gabrielle Majidi",
      timePosted: "7 months ago",
      text: "Mike and Mark are great, fabulous service, highly recommend and amazing prices!"
    },
    {
      reviewerName: "Derrick G.Y.",
      timePosted: "1 year ago", 
      text: "We had a great experience with Booking Hub. The team was professional and attentive following their client's interest...more"
    },
    {
      reviewerName: "JO STIRROP",
      timePosted: "1 year ago",
      text: "I'm thrilled to have discovered Booking Hub! The communication with Booking Hub is top-notch. The team are...more"
    },
    {
      reviewerName: "Sarah Johnson",
      timePosted: "6 months ago",
      text: "Excellent service and support throughout our corporate stay. The team went above and beyond to ensure our comfort and satisfaction."
    },
    {
      reviewerName: "Michael Chen",
      timePosted: "3 months ago",
      text: "Outstanding accommodation options and seamless booking process. Highly recommend for any corporate travel needs."
    }
  ];

  // Auto-rotate reviews carousel with seamless infinite loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => prev + 1);
    }, 5000); // Change review every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Reset review index for seamless loop
  useEffect(() => {
    // When we reach the duplicate (showing the same content as index 0)
    if (currentReviewIndex === reviewsData.length) {
      const timeout = setTimeout(() => {
        setIsReviewTransitioning(false);
        setCurrentReviewIndex(0);
        setTimeout(() => {
          setIsReviewTransitioning(true);
        }, 50);
      }, 700); // Wait for transition to complete
      return () => clearTimeout(timeout);
    }
  }, [currentReviewIndex]);

  // FAQ data generator with proper visible count
  const generateFAQData = () => {
    const allFAQs = [
      {
        id: 1,
        question: "How quickly can you confirm accommodation?",
        answer: "Most bookings are confirmed within 24 hours. Same‑day placements are also possible depending on location and availability."
      },
      {
        id: 2,
        question: "Can you accommodate multiple teams or long-term stays?",
        answer: "Yes — we specialise in group bookings, project teams, and extended stays lasting from a few weeks to several months."
      },
      {
        id: 3,
        question: "Can I book Monday to Friday only?",
        answer: "Yes. Many contractor teams work away during the week. We tailor bookings to suit your schedule — weekdays only or full 7‑day stays."
      },
      {
        id: 4,
        question: "Are your properties suitable for corporate and contractor use?",
        answer: "Yes. All accommodation is provided by professional partners who confirm they're fully insured and compliant with local regulations and safety standards."
      },
      {
        id: 5,
        question: "Do you work with councils or insurance companies?",
        answer: "Yes — we arrange emergency housing, insurance relocations, and council placements through our trusted partner network."
      },
      {
        id: 6,
        question: "What areas do you cover?",
        answer: "Nationwide. Our network spans all major industrial and business regions across the UK."
      },
      {
        id: 7,
        question: "How can we pay?",
        answer: "Pay by invoice, BACS transfer, or instant payment — whichever works best for your company."
      },
      {
        id: 8,
        question: "What if there's a problem with a booking?",
        answer: "If any issue arises, we'll step in quickly to resolve it and, if needed, arrange a suitable replacement property so your team isn't left without accommodation."
      }
    ];

    // Return only the number of FAQs specified by visibleFAQCount
    return allFAQs.slice(0, visibleFAQCount);
  };

  const handleFAQClick = (faqId: number) => {
    const wasOpen = openFAQs.has(faqId);
    
    setOpenFAQs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
      }
      return newSet;
    });
    
    // Check if this FAQ is in the last row (last 2 FAQs for 2-column layout)
    const isInLastRow = faqId >= visibleFAQCount - 1;
    
    // If this FAQ is in the last row and it's being opened (not closed), show more FAQs
    if (isInLastRow && !wasOpen) {
      setTimeout(() => {
        setVisibleFAQCount(prev => prev + 3);
      }, 300); // Small delay for smooth UX
    }
  };

  return (
    <>
      <style jsx>{`
        input[type="date"]::-webkit-datetime-edit-text,
        input[type="date"]::-webkit-datetime-edit-month-field,
        input[type="date"]::-webkit-datetime-edit-day-field,
        input[type="date"]::-webkit-datetime-edit-year-field {
          color: #4B4E53;
        }
        input[type="date"]::-webkit-datetime-edit-text:focus,
        input[type="date"]::-webkit-datetime-edit-month-field:focus,
        input[type="date"]::-webkit-datetime-edit-day-field:focus,
        input[type="date"]::-webkit-datetime-edit-year-field:focus {
          color: #4B4E53;
        }
        
        /* Image loading placeholder - prevents empty spaces */
        img {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        img[src] {
          animation: none;
          background: transparent;
        }
        
        /* Rotating word animation */
        @keyframes slideOutLeft {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          40% {
            opacity: 0.5;
          }
          70% {
            opacity: 0;
          }
          100% {
            transform: translateX(-100%);
            opacity: 0;
          }
        }
        
        @keyframes slideInRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          30% {
            opacity: 0;
          }
          60% {
            opacity: 0.5;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .word-slide-out {
          animation: slideOutLeft 0.6s ease-in-out forwards;
        }
        
        .word-slide-in {
          animation: slideInRight 0.6s ease-in-out forwards;
        }
        
        .rotating-word {
          display: inline-flex;
          position: relative;
          transition: all 0.4s ease-in-out;
        }
        
        h1 span {
          transition: transform 0.4s ease-in-out;
        }
        
        /* Responsive carousel transform calculations */
        @media (max-width: 640px) {
          .carousel-slide {
            transform: translateX(-${currentImageIndex * (120 + 8)}px) !important;
          }
        }
        
        @media (min-width: 641px) {
          .carousel-slide {
            transform: translateX(-${currentImageIndex * (320 + 24)}px) !important;
          }
        }
      `}</style>

      {/* Aggressive image preloader using Cache API */}
      <ImagePreloader />

      {/* Hidden images for eager loading - forces browser to download all images immediately */}
      <div style={{ display: 'none' }} aria-hidden="true">
        {/* Hero and section backgrounds */}
        <img src="/Port talbot-1.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Houses.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Houses-1.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Mobile-Mockup.webp" alt="" fetchPriority="high" loading="eager" />
        
        {/* Carousel property images */}
        <img src="/bedford.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Birmingham.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Bristol.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Cardiff.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/London.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Manchester.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Milford heaven.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Port Talbot.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/sizewell.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Swansea.webp" alt="" fetchPriority="high" loading="eager" />
        
        {/* Logo carousel images */}
        <img src="/ABP-logo.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/celtic.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Find-a-Business-Expert.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/morgan-sindall-65526.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/NPT-Council-Logo-300x238.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/SRM_Logo.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/swansea bay deal.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Swansea_City_Council_Logo_svg.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Tata Steel.webp" alt="" fetchPriority="high" loading="eager" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F6F6F4] px-4 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-8 overflow-visible">
        <div className="w-full lg:max-w-none mx-auto flex items-center justify-center overflow-visible">
          <div className="w-full max-w-7xl flex items-center justify-between overflow-visible">
          {/* Logo */}
          <div className="flex items-center overflow-visible">
            <a href="/" className="block py-2">
              <img src="/blue-teal.webp" alt="Booking Hub Logo" fetchPriority="high" loading="eager" className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain block" style={{ maxWidth: '100%', display: 'block' }} />
            </a>
          </div>

          {/* Desktop Navigation - Hidden on mobile, visible on tablet and up */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 ml-auto mr-4 lg:mr-6">
            <a href="/contact" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-[#0B1D37] hover:text-[#00BAB5] transition-colors text-base md:text-lg lg:text-xl">Contact Us</a>
            <a 
              href="/booking-request" 
              style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }}
              className="bg-[#00BAB5] text-white hover:bg-[#009a96] transition-colors px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 rounded-md text-base md:text-lg lg:text-xl border-2 border-[#0B1D37]"
            >
              Request a Booking
            </a>
            <a 
              href="/auth/signup/partner" 
              style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }}
              className="bg-[#E9ECEF] text-[#0B1D37] hover:bg-[#dee2e6] transition-colors px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 rounded-md text-base md:text-lg lg:text-xl border-2 border-[#0B1D37]"
            >
              List Your Property
            </a>
          </nav>

          {/* Desktop User Menu - Hidden on mobile, visible on tablet and up */}
          <div className="hidden md:block relative">
            <button 
              onClick={() => { window.location.href = '/signup-choice'; }}
              className="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
            >
              <svg className="w-5 h-5 md:w-7 md:h-7 lg:w-8 lg:h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </button>
            <span 
              style={{ 
                fontFamily: 'var(--font-avenir)', 
                fontWeight: 700,
                color: '#00BAB5',
                letterSpacing: '0.05em'
              }}
              className="absolute top-full left-1/2 transform -translate-x-1/2 text-sm lg:text-base mt-1 whitespace-nowrap"
            >
              Login
            </span>
          </div>

          {/* Mobile Menu Button - Visible only on mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          </div>
        </div>

        {/* Mobile Sidebar Menu - Visible only on mobile */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            
            {/* Sidebar */}
            <div className="md:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 mobile-menu-container">
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <a href="/" className="py-2">
                    <img src="/blue-teal.webp" alt="Booking Hub Logo" fetchPriority="high" loading="eager" className="h-7 w-auto object-contain" style={{ maxWidth: '100%' }} />
                  </a>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Sidebar Navigation */}
                <div className="flex-1 px-6 py-8">
                  <nav className="space-y-4">
                    <a 
                      href="/contact" 
                      style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
                      className="block text-[#0B1D37] hover:text-[#00BAB5] transition-colors text-base py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact Us
                    </a>
                    <a 
                      href="/booking-request" 
                      style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
                      className="block bg-[#00BAB5] text-white hover:bg-[#009a96] transition-colors px-4 py-2 rounded-md text-base text-center border-2 border-[#0B1D37]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Request a Booking
                    </a>
                    <a 
                      href="/auth/signup/partner" 
                      style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
                      className="block bg-[#E9ECEF] text-[#0B1D37] hover:bg-[#dee2e6] transition-colors px-4 py-2 rounded-md text-base text-center border-2 border-[#0B1D37]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      List Your Property
                    </a>
                  </nav>
                </div>

                {/* Sidebar Footer with User Menu */}
                <div className="p-6 border-t border-gray-200">
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <button 
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          window.location.href = '/signup-choice';
                        }}
                        className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <span 
                        style={{ 
                          fontFamily: 'var(--font-avenir)', 
                          fontWeight: 500,
                          color: '#00BAB5',
                          letterSpacing: '0.05em'
                        }}
                        className="text-sm mt-1"
                      >
                        Login
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section 
        className="relative h-[50vh] sm:h-[60vh] md:h-[65vh] lg:h-[60vh] xl:h-[65vh] flex items-center justify-center"
        style={{
          backgroundImage: 'url(/Port%20talbot-1.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-[rgba(11,29,52,0.88)]"></div>
        
        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32 xl:py-40 max-w-6xl mx-auto">
          <div className="flex justify-center w-full mb-2 sm:mb-4 md:mb-3 mt-4 sm:mt-6 md:mt-8 lg:mt-10 xl:mt-12">
            <h1 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 justify-center leading-none sm:leading-normal md:leading-loose">
              <span className="inline-block">Your</span>
              <span className="text-[#00BAB5] rotating-word items-center justify-center relative" style={{ overflowX: 'clip', overflowY: 'visible', width: 'auto', minWidth: 'fit-content' }}>
                <span className={isInitialLoad ? '' : (isAnimating ? 'word-slide-out' : 'word-slide-in')} style={{ display: 'inline-block' }} key={currentWordIndex}>
                  {rotatingWords[currentWordIndex]}
                </span>
              </span>
              <span className="inline-block">Accommodation,</span>
              <span className="inline-block w-full sm:w-auto text-center sm:text-left">Sorted.</span>
            </h1>
          </div>
          <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-3 sm:mb-6 md:mb-3 md:mt-8 text-gray-200 max-w-4xl mx-auto leading-tight md:leading-loose text-center">
            One Request, One Invoice. Built for Business.
          </p>
          <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-base sm:text-lg md:text-2xl lg:text-3xl mb-3 sm:mb-6 md:mb-3 text-gray-200 max-w-4xl mx-auto leading-tight md:leading-loose text-center tracking-normal md:tracking-wide lg:tracking-wide">
            Fully furnished properties nationwide. Book from one week to<br className="sm:hidden" /> one year.<br className="hidden sm:inline" /> Outsource your accommodation problems to us.
          </p>
          <div className="flex justify-center w-full mb-4 sm:mb-6 md:mb-8 lg:mb-10 xl:mb-12">
            <button 
              onClick={() => { if (typeof window !== 'undefined') window.location.href = '/booking-request'; }}
              style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }}
              className="bg-[#00BAB5] text-white px-6 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-4 md:py-5 lg:py-6 rounded-lg text-base sm:text-lg md:text-xl lg:text-2xl hover:bg-[#00A5A0] transition-colors mt-1 sm:mt-4 md:mt-6"
            >
              Book Accommodation
            </button>
          </div>
        </div>
      </section>

      {/* Proud To Support Section */}
      <section className="bg-white pt-8 sm:pt-12 md:pt-16 lg:pt-20 pb-8 sm:pb-10 md:pb-12 px-4 sm:px-6 lg:px-12">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-0 sm:mb-2">
            <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-3xl md:text-4xl lg:text-5xl text-[#0B1D37]">
              Trusted By
            </h2>
          </div>

          {/* Logo Carousel */}
          <div className="relative flex items-center justify-center">
            

            {/* Carousel Container */}
            <div 
              className="flex items-center gap-4 sm:gap-6 md:gap-8 overflow-hidden w-full max-w-xs sm:max-w-4xl lg:max-w-5xl mx-auto"
              onMouseEnter={() => setIsLogoCarouselPaused(true)}
              onMouseLeave={() => setIsLogoCarouselPaused(false)}
            >
              <div 
                className="flex gap-4 sm:gap-6 md:gap-8"
                style={{ 
                  transform: `translateX(-${logoScrollPosition}px)`,
                  willChange: 'transform'
                }}
              >
                {/* First set of logos */}
                {logoData.map((logo, index) => (
                  <div key={`first-${index}`} className="flex-shrink-0">
                    <div className="bg-transparent p-3 sm:p-8 md:p-10 flex items-center justify-center w-28 sm:w-56 md:w-64 h-24 sm:h-36 md:h-40 hover:shadow-lg transition-all duration-300">
                      <img 
                        src={logo.src} 
                        alt={logo.alt}
                        loading="eager" className="max-w-full max-h-full object-contain transition-all duration-300"
                      />
                    </div>
                  </div>
                ))}
                {/* Duplicate set for infinite loop */}
                {logoData.map((logo, index) => (
                  <div key={`second-${index}`} className="flex-shrink-0">
                    <div className="bg-transparent p-3 sm:p-8 md:p-10 flex items-center justify-center w-28 sm:w-56 md:w-64 h-24 sm:h-36 md:h-40 hover:shadow-lg transition-all duration-300">
                      <img 
                        src={logo.src} 
                        alt={logo.alt}
                        loading="eager" className="max-w-full max-h-full object-contain transition-all duration-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            
          </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-[#F6F6F4] pt-4 sm:pt-6 md:pt-8 lg:pt-10 pb-6 sm:pb-12 md:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-12">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-7xl">
          <div className="text-center mb-6 sm:mb-12 md:mb-16">
            <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-3xl md:text-4xl lg:text-5xl text-[#0B1D37] mb-2 sm:mb-4">How It Works</h2>
            <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#4B4E53] max-w-3xl mx-auto leading-relaxed">Three simple steps to streamline your corporate accommodation process</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 text-center h-full flex flex-col">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="w-6 h-6 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white text-xs sm:text-lg mx-auto mb-2 sm:mb-4 md:mb-6">01</div>
              <div className="w-8 h-8 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 md:mb-6 flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#0B1D37]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-base sm:text-lg md:text-2xl lg:text-3xl text-[#0B1D37] mb-2 sm:mb-3 md:mb-4">Tell Us What You Need</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-sm sm:text-sm md:text-xl lg:text-2xl text-[#4B4E53] leading-tight sm:leading-relaxed flex-grow">Location, dates, number of people, budget. It takes 2 minutes.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 text-center h-full flex flex-col">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="w-6 h-6 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white text-xs sm:text-lg mx-auto mb-2 sm:mb-4 md:mb-6">02</div>
              <div className="w-8 h-8 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 md:mb-6 flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#0B1D37]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-base sm:text-lg md:text-2xl lg:text-3xl text-[#0B1D37] mb-2 sm:mb-3 md:mb-4">We Find Properties</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-sm sm:text-sm md:text-xl lg:text-2xl text-[#4B4E53] leading-tight sm:leading-relaxed flex-grow">Our partner network responds. We shortlist suitable options.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 text-center h-full flex flex-col sm:col-span-2 lg:col-span-1">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="w-6 h-6 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white text-xs sm:text-lg mx-auto mb-2 sm:mb-4 md:mb-6">03</div>
              <div className="w-8 h-8 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 md:mb-6 flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#0B1D37]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-base sm:text-lg md:text-2xl lg:text-3xl text-[#0B1D37] mb-2 sm:mb-3 md:mb-4">Book & Confirm</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-sm sm:text-sm md:text-xl lg:text-2xl text-[#4B4E53] leading-tight sm:leading-relaxed flex-grow">Select your fully serviced property. Pay by invoice.</p>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-12">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-7xl">
          {/* Section Header with Better Visual Hierarchy */}
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <div className="inline-flex items-center justify-center w-10 sm:w-16 h-1 bg-[#00BAB5] rounded-full mb-4"></div>
          <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-3xl md:text-4xl lg:text-5xl text-[#0B1D37] mb-2 sm:mb-4 leading-tight">
            Who We Serve
          </h2>
          <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#4B4E53] max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8">Solving accommodation problems for organisations across the UK - from emergency placements to long-term projects</p>
          </div>

          {/* Three Core Sectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-12 lg:gap-16 mb-6 sm:mb-8">
            {/* Construction & Engineering */}
            <div className="text-center">
              <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <img src="/helmet.webp" alt="Construction Helmet" className="w-10 h-10 sm:w-16 sm:h-16 object-contain" />
              </div>
              <h4 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-base sm:text-lg md:text-2xl lg:text-3xl text-[#0B1D37] mb-2 sm:mb-3">
                Construction & Engineering Companies
              </h4>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-sm sm:text-sm md:text-xl lg:text-2xl text-[#4B4E53] leading-tight sm:leading-relaxed">
                Housing teams working on major construction, civil, and industrial infrastructure projects.
              </p>
            </div>

            {/* Councils & Housing Associations */}
            <div className="text-center mt-8 sm:mt-0">
              <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <img src="/government.webp" alt="Government Building" className="w-10 h-10 sm:w-16 sm:h-16 object-contain" />
              </div>
              <h4 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-base sm:text-lg md:text-2xl lg:text-3xl text-[#0B1D37] mb-2 sm:mb-3">
                Councils & Housing Associations
              </h4>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-sm sm:text-sm md:text-xl lg:text-2xl text-[#4B4E53] leading-tight sm:leading-relaxed">
                Providing compliant, short‑notice accommodation for emergency or planned placements.
              </p>
            </div>

            {/* Insurance & Loss Adjusters */}
            <div className="text-center mt-8 sm:mt-0">
              <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <img src="/insurance.webp" alt="Insurance Shield" className="w-10 h-10 sm:w-16 sm:h-16 object-contain" />
              </div>
              <h4 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-base sm:text-lg md:text-2xl lg:text-3xl text-[#0B1D37] mb-2 sm:mb-3">
                Insurance & Loss Adjusters
              </h4>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-sm sm:text-sm md:text-xl lg:text-2xl text-[#4B4E53] leading-tight sm:leading-relaxed">
                Arranging temporary accommodation for policyholders affected by fire, flood, or property damage.
              </p>
            </div>
          </div>

          {/* Enhanced CTA Button */}
          <div className="text-center">
            <button 
              onClick={() => { if (typeof window !== 'undefined') window.location.href = '/booking-request'; }}
              style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} 
              className="group bg-[#00BAB5] sm:bg-gradient-to-r sm:from-[#00BAB5] sm:to-[#00A5A0] text-white px-5 sm:px-10 py-2.5 sm:py-5 rounded-lg sm:rounded-xl text-sm sm:text-xl hover:bg-[#00A5A0] sm:hover:from-[#00A5A0] sm:hover:to-[#00BAB5] transition-colors sm:transition-all sm:duration-300 sm:shadow-lg sm:hover:shadow-xl sm:transform sm:hover:-translate-y-1"
            >
              BOOK ACCOMMODATION
            </button>
          </div>
          </div>
        </div>
      </section>

      {/* Why Choose Booking Hub Section */}
      <section 
        className="relative py-12 sm:py-16 md:py-20 px-6 sm:px-6 lg:px-12"
        style={{
          backgroundImage: 'url(/Houses.webp)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-[rgba(11,29,52,0.88)]"></div>
        
        {/* Content */}
        <div className="relative z-10 w-full flex justify-center">
          <div className="w-full max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-3xl md:text-4xl lg:text-5xl text-white mb-3 sm:mb-4">The Problem With Tourist Platforms</h2>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 md:gap-6 lg:gap-8">
            {/* Card 1: Week-by-Week Chaos */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:px-8 md:py-5 lg:px-10 lg:py-6 text-center flex flex-col">
              <div className="w-8 h-8 sm:w-16 sm:h-16 bg-[#00BAB5] rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg className="w-5 h-5 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-base sm:text-lg md:text-2xl lg:text-3xl text-[#0B1D37] mb-2 sm:mb-3 md:mb-4 md:h-16 lg:h-20 flex items-center justify-center">Week-by-Week Chaos</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-sm sm:text-sm md:text-xl lg:text-2xl text-[#4B4E53] leading-tight sm:leading-relaxed flex-grow md:mb-4 lg:mb-6">You can't block-book Monday to Friday. You waste hours rebooking every week. Seasonal availability and nothing available long-term</p>
            </div>

            {/* Card 2: No Business Invoicing or Flexibility */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:px-8 md:py-5 lg:px-10 lg:py-6 text-center flex flex-col">
              <div className="w-8 h-8 sm:w-16 sm:h-16 bg-[#00BAB5] rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg className="w-5 h-5 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-base sm:text-lg md:text-2xl lg:text-3xl text-[#0B1D37] mb-2 sm:mb-3 md:mb-4 md:h-16 lg:h-20 flex items-center justify-center">No Business Invoicing or Flexibility</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-sm sm:text-sm md:text-xl lg:text-2xl text-[#4B4E53] leading-tight sm:leading-relaxed flex-grow md:mb-4 lg:mb-6">You're forced to use credit cards. Your finance team can't get invoices or reclaim VAT. You can't extend or adjust when plans change.</p>
            </div>

            {/* Card 3: Unpredictable Quality and Support */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:px-8 md:py-5 lg:px-10 lg:py-6 text-center flex flex-col">
              <div className="w-8 h-8 sm:w-16 sm:h-16 bg-[#00BAB5] rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg className="w-5 h-5 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-base sm:text-lg md:text-2xl lg:text-3xl text-[#0B1D37] mb-2 sm:mb-3 md:mb-4 md:h-16 lg:h-20 flex items-center justify-center">Unpredictable Quality and Support</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-sm sm:text-sm md:text-xl lg:text-2xl text-[#4B4E53] leading-tight sm:leading-relaxed flex-grow md:mb-4 lg:mb-6">You deal with unprofessional hosts and substandard accommodation. When things go wrong, you're left with no support.</p>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* We're Built For Business Section */}
      <section className="bg-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-12">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-7xl lg:max-w-screen-2xl">
            {/* Section Header */}
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-3xl md:text-4xl lg:text-5xl text-[#0B1D37] mb-2 sm:mb-4">We're Built For Business</h2>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 md:gap-6 lg:gap-8 mb-8 sm:mb-12">
              {/* Card 1: A Complete System */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 sm:p-6 md:px-8 md:py-3 lg:px-10 lg:py-3 text-center flex flex-col">
                <div className="w-8 h-8 sm:w-16 sm:h-16 bg-[#00BAB5] rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4 md:mb-2">
                  <svg className="w-5 h-5 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                </div>
                <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-base sm:text-lg md:text-2xl lg:text-3xl text-[#0B1D37] mb-2 sm:mb-3 md:mb-1 text-center flex items-center justify-center">A Complete System</h3>
                <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-sm sm:text-sm md:text-xl lg:text-2xl text-[#4B4E53] leading-tight md:leading-tight text-center flex-grow md:mb-2 lg:mb-2">You benefit from flexible payment terms, purchase orders, and VAT invoicing. Block-book Monday to Friday, book long-term, manage multiple locations. Extend or amend easily when plans change. One dashboard manages everything.</p>
              </div>

              {/* Card 2: Not Just a Platform */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 sm:p-6 md:px-8 md:py-3 lg:px-10 lg:py-3 text-center flex flex-col">
                <div className="w-8 h-8 sm:w-16 sm:h-16 bg-[#00BAB5] rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4 md:mb-2">
                  <svg className="w-5 h-5 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-base sm:text-lg md:text-2xl lg:text-3xl text-[#0B1D37] mb-2 sm:mb-3 md:mb-1 text-center flex items-center justify-center">Not Just a Platform</h3>
                <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-sm sm:text-sm md:text-xl lg:text-2xl text-[#4B4E53] leading-tight md:leading-tight text-center flex-grow md:mb-2 lg:mb-2">Book on the platform or hand your accommodation problems to us. Our team sources properties not listed anywhere else, handles everything, and provides dedicated support. We become your outsourced accommodation service.</p>
              </div>

              {/* Card 3: Professional Partners */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 sm:p-6 md:px-8 md:py-3 lg:px-10 lg:py-3 text-center flex flex-col">
                <div className="w-8 h-8 sm:w-16 sm:h-16 bg-[#00BAB5] rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4 md:mb-2">
                  <svg className="w-5 h-5 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-base sm:text-lg md:text-2xl lg:text-3xl text-[#0B1D37] mb-2 sm:mb-3 md:mb-1 text-center flex items-center justify-center">Professional Partners</h3>
                <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-sm sm:text-sm md:text-xl lg:text-2xl text-[#4B4E53] leading-tight md:leading-tight text-center flex-grow md:mb-2 lg:mb-2">You get compliant serviced accommodation from professional partners across the UK. Pre-vetted properties managed by professionals who understand your business requirements, not leisure bookings.</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <button 
                onClick={() => { if (typeof window !== 'undefined') window.location.href = '/booking-request'; }}
                style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} 
                className="group bg-[#00BAB5] sm:bg-gradient-to-r sm:from-[#00BAB5] sm:to-[#00A5A0] text-white px-5 sm:px-10 py-2.5 sm:py-5 rounded-lg sm:rounded-xl text-sm sm:text-xl hover:bg-[#00A5A0] sm:hover:from-[#00A5A0] sm:hover:to-[#00BAB5] transition-colors sm:transition-all sm:duration-300 sm:shadow-lg sm:hover:shadow-xl sm:transform sm:hover:-translate-y-1"
              >
                BOOK ACCOMMODATION
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Google Reviews Section */}
      <section className="bg-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-12">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-3xl md:text-4xl lg:text-5xl text-[#0B1D37] mr-4">What Our Clients Say</h2>
              <div className="flex items-center">
                {/* 5 stars - 4 full, 1 partial */}
                <div className="flex">
                  {[...Array(4)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" style={{clipPath: 'polygon(0 0, 80% 0, 80% 100%, 0% 100%)'}}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-base sm:text-sm md:text-xl lg:text-2xl text-[#4B4E53]">Google Reviews</span>
              </div>
            </div>
          </div>

          {/* Reviews Carousel */}
          <div className="relative mx-8 sm:mx-0">
            {/* Left Arrow Button */}
            <button 
              onClick={() => {
                setCurrentReviewIndex(prev => {
                  if (prev === 0) {
                    // Jump to end of first set (last review) without transition
                    setIsReviewTransitioning(false);
                    setCurrentReviewIndex(reviewsData.length - 1);
                    setTimeout(() => setIsReviewTransitioning(true), 50);
                    return reviewsData.length - 1;
                  }
                  return prev - 1;
                });
              }}
              className="absolute -left-4 sm:-left-12 md:-left-16 lg:-left-20 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-all duration-500 ease-in-out shadow-lg hover:scale-110 z-40"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-[#0B1D37] transition-all duration-500 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Reviews Container */}
            <div className="flex items-center gap-4 sm:gap-6 md:gap-8 overflow-hidden w-full max-w-xs sm:max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-0">
              <div 
                className={`flex gap-4 sm:gap-6 md:gap-8 items-stretch ${isReviewTransitioning ? 'transition-transform duration-700 ease-out' : ''}`}
                style={{ 
                  transform: `translateX(-${currentReviewIndex * (isMobile ? 272 : 320)}px)`,
                  willChange: 'transform'
                }}
              >
                {/* First set of reviews */}
                {reviewsData.map((review, index) => (
                  <div key={`first-${index}`} className="flex-shrink-0">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 sm:p-6 w-64 sm:w-80 h-full flex flex-col">
                      {/* Stars */}
                      <div className="flex items-center mb-1 sm:mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          ))}
                        </div>
                        {/* Google Logo */}
                        <div className="ml-auto">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                        </div>
                      </div>
                      
                      {/* Time Posted */}
                      <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-xs md:text-xl lg:text-2xl text-[#4B4E53] mb-1 sm:mb-3">{review.timePosted}</div>
                      
                      {/* Review Text */}
                      <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-sm sm:text-sm md:text-xl lg:text-2xl text-[#0B1D37] mb-2 sm:mb-4 leading-tight sm:leading-relaxed flex-grow">{review.text}</p>
                      
                      {/* Reviewer Name */}
                      <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-sm md:text-xl lg:text-2xl text-[#0B1D37]">{review.reviewerName}</div>
                    </div>
                  </div>
                ))}
                {/* Duplicate set for seamless infinite loop */}
                {reviewsData.map((review, index) => (
                  <div key={`second-${index}`} className="flex-shrink-0">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 sm:p-6 w-64 sm:w-80 h-full flex flex-col">
                      {/* Stars */}
                      <div className="flex items-center mb-1 sm:mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          ))}
                        </div>
                        {/* Google Logo */}
                        <div className="ml-auto">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                        </div>
                      </div>
                      
                      {/* Time Posted */}
                      <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-xs md:text-xl lg:text-2xl text-[#4B4E53] mb-1 sm:mb-3">{review.timePosted}</div>
                      
                      {/* Review Text */}
                      <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-sm sm:text-sm md:text-xl lg:text-2xl text-[#0B1D37] mb-2 sm:mb-4 leading-tight sm:leading-relaxed flex-grow">{review.text}</p>
                      
                      {/* Reviewer Name */}
                      <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-sm md:text-xl lg:text-2xl text-[#0B1D37]">{review.reviewerName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow Button */}
            <button 
              onClick={() => {
                setCurrentReviewIndex(prev => prev + 1);
              }}
              className="absolute -right-4 sm:-right-12 md:-right-16 lg:-right-20 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-all duration-500 ease-in-out shadow-lg hover:scale-110 z-40"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-[#0B1D37] transition-all duration-500 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          </div>
        </div>
      </section>


            {/* In Demand Locations Section */}
            <section className="bg-[#F6F6F4] py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-12">
              <div className="w-full flex justify-center">
                <div className="w-full max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-3xl md:text-4xl lg:text-5xl text-[#0B1D37] mb-3 sm:mb-4">In Demand Locations</h2>
          </div>

          {/* Property Cards */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 w-full">
            {/* All property data */}
            {(() => {
              const propertyData = [
                { src: "/bedford.webp", alt: "Bedford", title: "Bedford" },
                { src: "/Birmingham.webp", alt: "Birmingham", title: "Birmingham" },
                { src: "/Bristol.webp", alt: "Bristol", title: "Bristol" },
                { src: "/Cardiff.webp", alt: "Cardiff", title: "Cardiff" },
                { src: "/London.webp", alt: "London", title: "London" },
                { src: "/Manchester.webp", alt: "Manchester", title: "Manchester" },
                { src: "/Milford heaven.webp", alt: "Milford Haven", title: "Milford Haven" },
                { src: "/Port Talbot.webp", alt: "Port Talbot", title: "Port Talbot" },
                { src: "/sizewell.webp", alt: "Sizewell", title: "Sizewell" },
                { src: "/Swansea.webp", alt: "Swansea", title: "Swansea" }
              ];

              return (
                <>
                  {/* Carousel Wrapper with arrows */}
                  <div className="relative flex items-center justify-center">
                    {/* Left Arrow Button - positioned absolutely */}
                    {currentImageIndex > 0 && (
                      <button 
                        onClick={prevImage}
                        className="absolute -left-4 sm:-left-12 md:-left-16 lg:-left-20 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-all duration-500 ease-in-out shadow-lg hover:scale-110 z-40"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-[#0B1D37] transition-all duration-500 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}

                    {/* Carousel Container with sliding animation - shows 3 images */}
                    <div className="flex items-center gap-2 sm:gap-4 md:gap-6 overflow-hidden w-full max-w-xs sm:max-w-2xl lg:max-w-6xl mx-auto">
                      <div 
                        className="flex gap-2 sm:gap-4 md:gap-6 transition-transform duration-700 ease-out carousel-slide"
                        style={{ 
                          transform: `translateX(-${currentImageIndex * ((typeof window !== 'undefined' && window.innerWidth >= 768) ? 344 : (typeof window !== 'undefined' && window.innerWidth >= 640) ? 256 : 168)}px)`,
                          width: (typeof window !== 'undefined' && window.innerWidth >= 768) ? 'calc(10 * 320px + 9 * 24px)' : (typeof window !== 'undefined' && window.innerWidth >= 640) ? 'calc(10 * 240px + 9 * 16px)' : 'calc(10 * 160px + 9 * 8px)',
                          willChange: 'transform'
                        }}
                      >
                        {propertyData.map((property, index) => (
                          <div key={index} className="flex-shrink-0">
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden w-40 sm:w-60 md:w-80 h-48 sm:h-72 md:h-96">
                              <img 
                                src={property.src} 
                                alt={property.alt} 
                                loading="eager" className="w-full h-36 sm:h-56 md:h-80 object-cover rounded-t-lg"
                              />
                              <div className="p-2 sm:p-3 md:p-4 text-center">
                                <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-sm md:text-xl lg:text-2xl text-[#0B1D37]">{property.title}</h3>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Arrow Button - positioned absolutely */}
                    {(() => {
                      // Calculate max position based on viewport to ensure last tile is fully visible
                      const tileWidth = (typeof window !== 'undefined' && window.innerWidth >= 768) ? 320 : (typeof window !== 'undefined' && window.innerWidth >= 640) ? 240 : 160;
                      const gapWidth = (typeof window !== 'undefined' && window.innerWidth >= 768) ? 24 : (typeof window !== 'undefined' && window.innerWidth >= 640) ? 16 : 8;
                      const viewportWidth = (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 1280 : (typeof window !== 'undefined' && window.innerWidth >= 640) ? 672 : 320;
                      const totalWidth = propertyData.length * tileWidth + (propertyData.length - 1) * gapWidth;
                      const maxScroll = totalWidth - viewportWidth;
                      const slideDistance = tileWidth + gapWidth;
                      // Ensure enough scroll positions for all tiles - add extra buffer for smaller mobile screens
                      const maxPosition = Math.ceil(maxScroll / slideDistance) + 2;
                      return currentImageIndex < maxPosition;
                    })() && (
                      <button 
                        onClick={nextImage}
                        className="absolute -right-4 sm:-right-12 md:-right-16 lg:-right-20 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-all duration-500 ease-in-out shadow-lg hover:scale-110 z-40"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-[#0B1D37] transition-all duration-500 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
                </div>
              </div>
            </section>

            {/* Our Property Partners Section */}
            <section 
              className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-12"
              style={{
                backgroundImage: 'url(/Houses-1.webp)',
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-[rgba(11,29,52,0.88)]"></div>
              
              {/* Content */}
              <div className="relative z-10 w-full flex justify-center px-8 sm:px-0">
                <div className="w-full max-w-4xl text-center">
                <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-3xl md:text-4xl lg:text-5xl text-white mb-6 sm:mb-8">
                  Our Property Partners
                </h2>
                
                <div className="space-y-3 md:space-y-6 mb-8 sm:mb-10">
                  <p style={{ fontFamily: 'var(--font-avenir)' }} className="text-base sm:text-lg md:text-2xl lg:text-3xl text-white leading-relaxed tracking-normal md:tracking-wide lg:tracking-wide font-medium md:font-normal">
                    We work with a trusted network of professional property partners across the UK to provide quality, compliant accommodation for our clients.
                  </p>
                  <p style={{ fontFamily: 'var(--font-avenir)' }} className="text-base sm:text-lg md:text-2xl lg:text-3xl text-white leading-relaxed tracking-normal md:tracking-wide lg:tracking-wide font-medium md:font-normal">
                    Our partners benefit from steady professional bookings, reliable income, and full support from our team.
                  </p>
                  <p style={{ fontFamily: 'var(--font-avenir)' }} className="text-base sm:text-lg md:text-2xl lg:text-3xl text-white leading-relaxed tracking-normal md:tracking-wide lg:tracking-wide font-medium md:font-normal">
                    If you own or manage suitable properties, we'd like to hear from you.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <button 
                    onClick={() => { if (typeof window !== 'undefined') window.location.href = '/auth/signup/partner'; }}
                    style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }}
                    className="bg-[#00BAB5] text-white px-6 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-4 md:py-5 lg:py-6 rounded-lg text-base sm:text-lg md:text-xl lg:text-2xl hover:bg-[#00A5A0] transition-colors"
                  >
                    BECOME A PARTNER
                  </button>
                  <p style={{ fontFamily: 'var(--font-avenir)' }} className="text-base sm:text-lg md:text-2xl lg:text-3xl text-white font-medium md:font-normal">
                    Join our network of trusted accommodation providers
                  </p>
                </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-[#F6F6F4] py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-12">
              <div className="w-full flex justify-center">
                <div className="w-full max-w-7xl">
                {/* Section Header */}
                <div className="text-center mb-8 sm:mb-12 md:mb-16">
                  <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-3xl md:text-4xl lg:text-5xl text-[#0B1D37] mb-3 sm:mb-4">FAQ</h2>
                </div>

                {/* FAQ Accordion - One Column on Mobile, Two Columns on Desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {generateFAQData().map((faq) => (
                    <div key={faq.id} className="bg-white rounded-lg shadow-lg overflow-hidden self-start md:self-stretch">
                      <button
                        onClick={() => handleFAQClick(faq.id)}
                        className="w-full px-6 sm:px-8 py-4 sm:py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-base sm:text-lg md:text-2xl lg:text-3xl text-[#0B1D37] pr-2 sm:pr-4 flex-1">
                          {faq.question}
                        </span>
                        <svg 
                          className={`w-3 h-3 sm:w-6 sm:h-6 flex-shrink-0 text-[#00BAB5] transition-transform duration-200 ${openFAQs.has(faq.id) ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className={`transition-all duration-300 ease-in-out ${openFAQs.has(faq.id) ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                        <div className="px-6 sm:px-8 pb-4 sm:pb-6 border-t border-gray-100">
                          <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-base sm:text-lg md:text-2xl lg:text-3xl text-[#00BAB5] leading-relaxed pt-4 sm:pt-6">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </div>
            </section>

            {/* App Download Section */}
            <section className="bg-white pt-12 sm:pt-16 md:pt-20 px-4 sm:px-6 lg:px-12">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-[1.2fr_0.8fr] sm:grid-cols-2 gap-1 sm:gap-4 lg:gap-8 items-start justify-items-center">
                  {/* Left Content */}
                  <div className="text-left lg:pr-4 justify-self-start sm:mt-12">
                    <div className="mb-1 md:mb-2">
                      <span style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-2xl md:text-3xl text-[#00BAB5] leading-tight">Download the</span>
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-3xl md:text-4xl lg:text-5xl text-[#0B1D37] mb-1 md:mb-3 leading-tight">
                      <span className="sm:hidden">BOOKING HUB MOBILE APP</span>
                      <span className="hidden sm:inline">Booking Hub Mobile App</span>
                    </h2>
                    <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-2xl md:text-3xl text-[#00BAB5] mb-2 md:mb-4 leading-tight">
                      List your Properties and Manage<br className="sm:hidden" /> Your Bookings <span className="md:whitespace-nowrap">on the Go</span>
                    </p>
                    
                    {/* Download Buttons */}
                    <div className="flex flex-col gap-2 sm:gap-4 sm:flex-row justify-start md:mt-6 lg:mt-8">
                      {/* App Store Button */}
                      <a 
                        href="#" 
                        className="inline-flex items-center justify-center bg-black text-white px-1 sm:px-8 md:px-12 lg:px-14 py-2 sm:py-4 md:py-4 lg:py-5 rounded-lg hover:bg-gray-800 transition-colors max-w-[140px] sm:max-w-none"
                      >
                        <svg className="w-6 h-6 mr-2 sm:mr-3 md:w-8 md:h-8 md:mr-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                        <div className="text-left">
                          <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-[9px] sm:text-sm md:text-base lg:text-lg md:tracking-wide lg:tracking-wider">Download on the</div>
                          <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-xl md:text-2xl lg:text-3xl">App Store</div>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Right Content - Mobile Mockup Image */}
                  <div className="flex items-start justify-end sm:justify-start lg:justify-center justify-self-end sm:justify-self-start h-full sm:mt-0">
                    <div className="relative ml-2 sm:ml-0 mr-12 sm:mr-0">
                      <img 
                        src="/Mobile-Mockup.webp" 
                        alt="Booking Hub Mobile App Mockup" 
                        className="w-full max-w-[650px] sm:max-w-md md:max-w-lg lg:max-w-xl [transform:scaleX(2.7)_scaleY(2.7)] sm:[transform:scaleX(1.3)_scaleY(1.3)]"
                        style={{ transformOrigin: 'top' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* UK Government Funded Logo Section */}
            <section className="bg-white pt-4 sm:pt-6 md:pt-0 lg:pt-0 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-12">
              <div className="w-full flex justify-center">
                <div className="w-full max-w-7xl">
                  <div className="flex justify-start">
                    <img 
                      src="/Funded-by-UK-Gov.webp" 
                      alt="Funded by UK Government" 
                      className="h-16 sm:h-20 md:h-24 lg:h-28 ml-3 sm:ml-4 md:ml-6"
                      style={{ transform: 'scaleX(1.3)' }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Footer Section */}
            <footer className="bg-[#0B1D37] py-6 sm:py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-12 overflow-visible">
              <div className="w-full flex justify-center overflow-visible">
                <div className="w-full max-w-7xl overflow-visible">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-12 mb-6 sm:mb-8 overflow-visible">
                  {/* Branding Section */}
                  <div className="space-y-4 sm:space-y-6 overflow-visible">
                    {/* Logo */}
                    <div className="flex items-start py-3 overflow-visible">
                      <img src="/white-teal.webp" alt="Booking Hub Logo" loading="eager" className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain block" style={{ maxWidth: '100%', display: 'block' }} />
                    </div>
                    
                    {/* Description */}
                    <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-gray-300 text-sm sm:text-sm md:text-lg lg:text-xl leading-snug sm:leading-relaxed">
                      A trading name of Dion Wright Property Ltd.<br />
                      Registered in England & Wales No. 15312220.
                    </p>
                    
                    {/* Social Media Icons - Hidden on mobile, visible on larger screens */}
                    <div className="hidden sm:flex space-x-3 sm:space-x-4">
                      <a href="#" className="w-7 h-7 sm:w-8 sm:h-8 bg-[#00BAB5] rounded-full flex items-center justify-center hover:bg-[#00A5A0] transition-colors">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                      <a href="#" className="w-7 h-7 sm:w-8 sm:h-8 bg-[#00BAB5] rounded-full flex items-center justify-center hover:bg-[#00A5A0] transition-colors">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Quick Links Section */}
                  <div className="space-y-2 sm:space-y-6">
                    <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-white text-base sm:text-lg md:text-xl lg:text-2xl">Quick Links</h3>
                    <ul className="space-y-0 sm:space-y-3">
                      <li><a href="#" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-gray-300 hover:text-[#00BAB5] transition-colors text-sm sm:text-base md:text-lg lg:text-xl leading-none sm:leading-normal">Home</a></li>
                      <li><a href="#" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-gray-300 hover:text-[#00BAB5] transition-colors text-sm sm:text-base md:text-lg lg:text-xl leading-none sm:leading-normal">How We Help You</a></li>
                      <li><a href="/booking-request" onClick={(e) => { e.preventDefault(); window.location.href = '/booking-request'; }} style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-gray-300 hover:text-[#00BAB5] transition-colors text-sm sm:text-base md:text-lg lg:text-xl leading-none sm:leading-normal">Book Accommodation</a></li>
                      <li><a href="/auth/signup/partner" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-gray-300 hover:text-[#00BAB5] transition-colors text-sm sm:text-base md:text-lg lg:text-xl leading-none sm:leading-normal">Become a Partner</a></li>
                      <li><a href="/contact" onClick={(e) => { e.preventDefault(); window.location.href = '/contact'; }} style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-gray-300 hover:text-[#00BAB5] transition-colors text-sm sm:text-base md:text-lg lg:text-xl leading-none sm:leading-normal">Contact Us</a></li>
                    </ul>
                  </div>

                  {/* Contact Info Section */}
                  <div className="space-y-2 sm:space-y-6">
                    <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-white text-base sm:text-lg md:text-xl lg:text-2xl">Contact Info</h3>
                    <div className="space-y-3 sm:space-y-4">
                      {/* Email */}
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#00BAB5] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                        </svg>
                        <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-gray-300 text-sm sm:text-sm md:text-lg lg:text-xl leading-none sm:leading-normal">info@booking-hub.co.uk</div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#00BAB5] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                        </svg>
                        <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-gray-300 text-sm sm:text-sm md:text-lg lg:text-xl leading-none sm:leading-normal">0330 043 7522</div>
                      </div>

                      {/* Address */}
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#00BAB5] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                        </svg>
                        <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-gray-300 text-sm sm:text-sm md:text-lg lg:text-xl leading-snug sm:leading-normal">SA12 Business Centre, Seaway Parade, Baglan Energy Park, Port Talbot SA12 7BR</div>
                      </div>
                    </div>

                    {/* Social Media Icons - Visible on mobile only, hidden on larger screens */}
                    <div className="flex sm:hidden space-x-3 mt-4">
                      <a href="#" className="w-7 h-7 bg-[#00BAB5] rounded-full flex items-center justify-center hover:bg-[#00A5A0] transition-colors">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                      <a href="#" className="w-7 h-7 bg-[#00BAB5] rounded-full flex items-center justify-center hover:bg-[#00A5A0] transition-colors">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Bottom Section - Legal Links */}
                <div className="border-t border-gray-700 pt-4 sm:pt-6 md:pt-8">
                  <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row space-x-6 md:space-x-8">
                      <span style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-gray-300 text-sm sm:text-sm md:text-lg lg:text-xl leading-none sm:leading-normal">
                        <a href="/privacy-policy" className="hover:text-[#00BAB5] transition-colors">Privacy Policy</a>
                        <span className="mx-0.5 sm:mx-2">|</span>
                        <a href="/terms-and-conditions" className="hover:text-[#00BAB5] transition-colors">Terms & Conditions</a>
                        <span className="mx-0.5 sm:mx-2">|</span>
                        <a href="#" className="hover:text-[#00BAB5] transition-colors">Cookie Notice</a>
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-gray-400 text-sm sm:text-sm md:text-lg lg:text-xl text-right leading-none sm:leading-normal">
                      © 2025 Booking Hub. All rights reserved.
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </footer>
      </div>
        </>
      );
}