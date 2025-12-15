'use client';

import { useState, useEffect } from 'react';


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
      setIsMobile(window.innerWidth < 641);
    };

    // Check on mount
    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
    // Both mobile and desktop: max position 19 (shows all 20 images one by one)
    const maxPosition = 19;
    setCurrentImageIndex(prev => Math.min(prev + 1, maxPosition));
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
      text: "We had a great experience with Comfy Workers. The team was professional and attentive following their client's interest...more"
    },
    {
      reviewerName: "JO STIRROP",
      timePosted: "1 year ago",
      text: "I'm thrilled to have discovered Comfy Workers! The communication with Comfy Workers is top-notch. The team are...more"
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
    },
    {
      reviewerName: "Emma Williams",
      timePosted: "2 months ago",
      text: "Professional, reliable, and always available when needed. The quality of service exceeded our expectations."
    }
  ];

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

      {/* Hidden images for eager loading - forces browser to download all images immediately */}
      <div style={{ display: 'none' }} aria-hidden="true">
        {/* Hero and section backgrounds */}
        <img src="/Port talbot-1.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Houses.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Houses-1.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Mobile-Mockup.png" alt="" fetchPriority="high" loading="eager" />
        
        {/* Carousel property images */}
        <img src="/bedford.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Birmingham.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Bristol.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Cardiff.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Crane Cardiff.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/House driveway.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Houses - 2.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/London.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/London Construction.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Manchester.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Milford heaven.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/NHS workers.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Port Talbot.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Rail Workers.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/sizewell.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Swansea.webp" alt="" fetchPriority="high" loading="eager" />
        <img src="/Swansea - 1.webp" alt="" fetchPriority="high" loading="eager" />
        
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

      <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F6F6F4] px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/">
              <img src="/Asset 3@4x.png" alt="Booking Hub Logo" fetchPriority="high" loading="eager" className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto" />
            </a>
          </div>

          {/* Desktop Navigation - Hidden on mobile, visible on tablet and up */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 ml-auto mr-4 lg:mr-6">
            <a href="#" className="text-[#0B1D37] hover:text-[#00BAB5] transition-colors text-base lg:text-lg">About</a>
            <a href="/contact" className="text-[#0B1D37] hover:text-[#00BAB5] transition-colors text-base lg:text-lg">Contact</a>
            <a href="/booking-request" className="text-[#0B1D37] hover:text-[#00BAB5] transition-colors text-base lg:text-lg">Request a Booking</a>
            <a href="/auth/signup/landlord" className="text-[#0B1D37] hover:text-[#00BAB5] transition-colors text-base lg:text-lg">List Your Property</a>
          </nav>

          {/* Desktop User Menu - Hidden on mobile, visible on tablet and up */}
          <div className="hidden md:block relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 lg:w-36 shadow-lg z-50 rounded-lg bg-white border border-gray-200">
                <div className="py-1">
                  <a href="/auth/signup/contractor" className="block px-3 py-2 text-sm text-[#00BAB5] hover:bg-gray-100 text-center">Client login</a>
                  <a href="/auth/signup/landlord" className="block px-3 py-2 text-sm text-[#00BAB5] hover:bg-gray-100 text-center">Partner login</a>
                </div>
              </div>
            )}
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
                  <a href="/">
                    <img src="/Asset 3@4x.png" alt="Booking Hub Logo" fetchPriority="high" loading="eager" className="h-8 w-auto" />
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
                      href="#" 
                      className="block text-[#0B1D37] hover:text-[#00BAB5] transition-colors text-base font-medium py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      About
                    </a>
                    <a 
                      href="/contact" 
                      className="block text-[#0B1D37] hover:text-[#00BAB5] transition-colors text-base font-medium py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact
                    </a>
                    <a 
                      href="/booking-request" 
                      className="block text-[#0B1D37] hover:text-[#00BAB5] transition-colors text-base font-medium py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Request a Booking
                    </a>
                    <a 
                      href="/auth/signup/landlord" 
                      className="block text-[#0B1D37] hover:text-[#00BAB5] transition-colors text-base font-medium py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      List Your Property
                    </a>
                  </nav>
                </div>

                {/* Sidebar Footer with User Menu */}
                <div className="p-6 border-t border-gray-200">
                  <div className="relative">
                    <div className="flex items-center">
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    {isDropdownOpen && (
                      <div className="absolute left-12 -top-8 w-36 shadow-lg z-50 rounded-lg bg-white border border-gray-200">
                        <div className="py-1">
                          <a 
                            href="/auth/signup/contractor" 
                            className="block px-3 py-2 text-sm text-[#00BAB5] hover:bg-gray-100 text-center"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            Client login
                          </a>
                          <a 
                            href="/auth/signup/landlord" 
                            className="block px-3 py-2 text-sm text-[#00BAB5] hover:bg-gray-100 text-center"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            Partner login
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Hero Section */}
      <section 
        className="relative h-[50vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh] flex items-center justify-center"
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
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 md:mb-6">
            The Ultimate Hub for<br />
            <span className="text-[#00BAB5]">Corporate Stays</span>
          </h1>
          <p className="text-xs sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-3 sm:mb-6 md:mb-8 text-gray-200 max-w-4xl mx-auto leading-relaxed">
            One Hub. Infinite Flexibility. Enterprise Booking. Made Simple.
          </p>
          <button 
            onClick={() => window.location.href = '/booking-request'}
            className="bg-[#00BAB5] text-white px-3 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg text-xs sm:text-base md:text-lg font-semibold hover:bg-[#00A5A0] transition-colors mt-1 sm:mt-4"
          >
            Submit a Request
          </button>
        </div>
      </section>

      {/* Proud To Support Section */}
      <section className="bg-white pt-4 sm:pt-6 md:pt-8 lg:pt-10 pb-8 sm:pb-10 md:pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-lg sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0B1D37] mb-3 sm:mb-4">
      
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
      </section>

      {/* How It Works Section */}
      <section className="bg-[#F6F6F4] pt-4 sm:pt-6 md:pt-8 lg:pt-10 pb-6 sm:pb-12 md:pb-16 lg:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-12 md:mb-16">
            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0B1D37] mb-2 sm:mb-4">How It Works</h2>
            <p className="text-xs sm:text-lg md:text-xl text-[#4B4E53] max-w-3xl mx-auto leading-relaxed">Three simple steps to streamline your corporate accommodation process</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 md:gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-lg shadow-lg p-1 sm:p-6 md:p-8 text-center">
              <div className="w-6 h-6 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-lg mx-auto mb-1 sm:mb-4 md:mb-6">01</div>
              <div className="w-8 h-8 sm:w-16 sm:h-16 mx-auto mb-1 sm:mb-4 md:mb-6 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#0B1D37]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-[8px] sm:text-lg md:text-xl lg:text-xl font-bold text-[#0B1D37] mb-1 sm:mb-3 md:mb-4" >Submit Your Request</h3>
              <p className="text-[7px] sm:text-sm md:text-base lg:text-base text-[#4B4E53] leading-tight sm:leading-relaxed" >Fill out our simple form with your accommodation requirements, dates, and preferences.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-lg shadow-lg p-1 sm:p-6 md:p-8 text-center">
              <div className="w-6 h-6 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-lg mx-auto mb-1 sm:mb-4 md:mb-6">02</div>
              <div className="w-8 h-8 sm:w-16 sm:h-16 mx-auto mb-1 sm:mb-4 md:mb-6 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#0B1D37]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-[8px] sm:text-lg md:text-xl lg:text-xl font-bold text-[#0B1D37] mb-1 sm:mb-3 md:mb-4" >We Handle the Search</h3>
              <p className="text-[7px] sm:text-sm md:text-base lg:text-base text-[#4B4E53] leading-tight sm:leading-relaxed" >Our team finds and vets suitable accommodations that meet your corporate standards and budget.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-lg shadow-lg p-2 sm:p-6 md:p-8 text-center sm:col-span-2 lg:col-span-1">
              <div className="w-6 h-6 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-lg mx-auto mb-1 sm:mb-4 md:mb-6">03</div>
              <div className="w-8 h-8 sm:w-16 sm:h-16 mx-auto mb-1 sm:mb-4 md:mb-6 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#0B1D37]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-[8px] sm:text-lg md:text-xl lg:text-xl font-bold text-[#0B1D37] mb-1 sm:mb-3 md:mb-4" >Book & Confirm</h3>
              <p className="text-[7px] sm:text-sm md:text-base lg:text-base text-[#4B4E53] leading-tight sm:leading-relaxed" >Review options, approve your selection, and we handle all booking logistics under one contract.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-8 sm:py-12 md:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header with Better Visual Hierarchy */}
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <div className="inline-flex items-center justify-center w-10 sm:w-16 h-1 bg-[#00BAB5] rounded-full mb-4"></div>
          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0B1D37] mb-3 sm:mb-4 leading-tight">
            Who We Serve
          </h2>
          </div>

          {/* Three Sections without containers */}
          <div className="grid grid-cols-3 gap-2 sm:gap-12 lg:gap-16 mb-6 sm:mb-8">
            {/* Who We Work With */}
            <div className="text-center">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-[#00BAB5] to-[#00A5A0] rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg className="w-5 h-5 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <h3 className="text-xs sm:text-lg sm:text-xl font-bold text-[#0B1D37] mb-2 sm:mb-3">
                Who We Work With
              </h3>
              <p className="text-[7px] sm:text-sm sm:text-base text-[#4B4E53] leading-tight sm:leading-relaxed">
                We support organisations across the UK that need reliable, fully serviced accommodation for their teams, contract staff, or clients — from short‑notice bookings to long‑term stays.
              </p>
            </div>

            {/* Our Core Clients */}
            <div className="text-center">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-[#00BAB5] to-[#00A5A0] rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg className="w-5 h-5 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-2 0H3m2 0h5M9 7h1m-1 4h1m2-4h1m-1 4h1m-6 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18l-1-7H4l-1 7z"/>
                </svg>
              </div>
              <h3 className="text-xs sm:text-lg sm:text-xl font-bold text-[#0B1D37] mb-2 sm:mb-4">
                Our Core Clients
              </h3>
              <div className="space-y-2 sm:space-y-4 text-center">
                <div>
                  <div className="font-semibold text-[8px] sm:text-base text-[#0B1D37] mb-0.5 sm:mb-1">Construction & Engineering Companies</div>
                  <div className="text-[7px] sm:text-sm text-[#4B4E53] leading-tight sm:leading-relaxed">Housing teams working on major construction, civil, and industrial infrastructure projects.</div>
                </div>
                <div>
                  <div className="font-semibold text-[8px] sm:text-base text-[#0B1D37] mb-0.5 sm:mb-1">Insurance & Loss Adjusters</div>
                  <div className="text-[7px] sm:text-sm text-[#4B4E53] leading-tight sm:leading-relaxed">Arranging temporary accommodation for policyholders affected by fire, flood, or property damage.</div>
                </div>
                <div>
                  <div className="font-semibold text-[8px] sm:text-base text-[#0B1D37] mb-0.5 sm:mb-1">Councils & Housing Associations</div>
                  <div className="text-[7px] sm:text-sm text-[#4B4E53] leading-tight sm:leading-relaxed">Providing compliant, short‑notice accommodation for emergency or planned placements.</div>
                </div>
              </div>
            </div>

            {/* We Also Support */}
            <div className="text-center">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-[#00BAB5] to-[#00A5A0] rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg className="w-5 h-5 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>
              <h3 className="text-xs sm:text-lg sm:text-xl font-bold text-[#0B1D37] mb-2 sm:mb-4">
                We Also Support
              </h3>
              <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-6 text-center">
                <div>
                  <div className="font-semibold text-[8px] sm:text-base text-[#0B1D37] mb-0.5 sm:mb-1">Healthcare & NHS Contracts</div>
                  <div className="text-[7px] sm:text-sm text-[#4B4E53] leading-tight sm:leading-relaxed">Staff placements, relocations, and contractor housing for hospital and healthcare projects.</div>
                </div>
                <div>
                  <div className="font-semibold text-[8px] sm:text-base text-[#0B1D37] mb-0.5 sm:mb-1">Corporate & Business Relocations</div>
                  <div className="text-[7px] sm:text-sm text-[#4B4E53] leading-tight sm:leading-relaxed">Long‑term stays for employees on assignment or relocation.</div>
                </div>
                <div>
                  <div className="font-semibold text-[8px] sm:text-base text-[#0B1D37] mb-0.5 sm:mb-1">Utilities & Energy Providers</div>
                  <div className="text-[7px] sm:text-sm text-[#4B4E53] leading-tight sm:leading-relaxed">Workforce accommodation for crews maintaining and upgrading essential infrastructure nationwide.</div>
                </div>
                <div>
                  <div className="font-semibold text-[8px] sm:text-base text-[#0B1D37] mb-0.5 sm:mb-1">Film, TV & Media Production</div>
                  <div className="text-[7px] sm:text-sm text-[#4B4E53] leading-tight sm:leading-relaxed">Extended stays for production crews working on location.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced CTA Button */}
          <div className="text-center">
            <button className="group bg-[#00BAB5] sm:bg-gradient-to-r sm:from-[#00BAB5] sm:to-[#00A5A0] text-white px-3 sm:px-8 py-2 sm:py-4 rounded-lg sm:rounded-xl text-xs sm:text-lg font-semibold hover:bg-[#00A5A0] sm:hover:from-[#00A5A0] sm:hover:to-[#00BAB5] transition-colors sm:transition-all sm:duration-300 sm:shadow-lg sm:hover:shadow-xl sm:transform sm:hover:-translate-y-1">
              CONTACT US TODAY
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Call-to-Action */}
      <section className="bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs sm:text-xl md:text-2xl text-[#4B4E53] mb-6 sm:mb-8">Ready to simplify your corporate accommodation process?</p>
          <button className="bg-[#00BAB5] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-xs sm:text-lg font-semibold hover:bg-[#00A5A0] transition-colors">
            Get Started Now
          </button>
        </div>
      </section>


      {/* Why Choose Booking Hub Section */}
      <section 
        className="relative py-12 sm:py-16 md:py-20 px-6 sm:px-6"
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
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">Why Choose Booking Hub?</h2>
            <p className="text-xs sm:text-lg md:text-xl text-white">Enterprise-grade features designed to streamline your corporate accommodation workflow</p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 md:gap-8">
            {/* Card 1: Centralized Control */}
            <div className="bg-white rounded-lg shadow-lg p-2 sm:p-6 text-center mx-1 sm:mx-0">
              <div className="w-6 h-6 sm:w-16 sm:h-16 bg-[#00BAB5] rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg className="w-4 h-4 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-[8px] sm:text-xl font-bold text-[#0B1D37] mb-1 sm:mb-3" >Centralized Control</h3>
              <p className="text-[7px] sm:text-base text-[#4B4E53] leading-tight sm:leading-relaxed" >One dashboard to manage all corporate accommodation needs across multiple locations and departments.</p>
            </div>

            {/* Card 2: Multi-Date Scheduling */}
            <div className="bg-white rounded-lg shadow-lg p-2 sm:p-6 text-center mx-1 sm:mx-0">
              <div className="w-6 h-6 sm:w-16 sm:h-16 bg-[#00BAB5] rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg className="w-4 h-4 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6zm6 4a1 1 0 100 2H6a1 1 0 100-2h6zm-6 4a1 1 0 100 2h4a1 1 0 100-2H6z" clipRule="evenodd" />
                  <path d="M12 6a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V7a1 1 0 011-1z" />
                </svg>
              </div>
              <h3 className="text-[8px] sm:text-xl font-bold text-[#0B1D37] mb-1 sm:mb-3" >Multi-Date Scheduling</h3>
              <p className="text-[7px] sm:text-base text-[#4B4E53] leading-tight sm:leading-relaxed" >Handle complex booking scenarios without repetitive data entry or coordination overhead.</p>
            </div>

            {/* Card 3: Enterprise Solution */}
            <div className="bg-white rounded-lg shadow-lg p-2 sm:p-6 text-center mx-1 sm:mx-0">
              <div className="w-6 h-6 sm:w-16 sm:h-16 bg-[#00BAB5] rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg className="w-4 h-4 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-[8px] sm:text-xl font-bold text-[#0B1D37] mb-1 sm:mb-3" >Enterprise Solution</h3>
              <p className="text-[7px] sm:text-base text-[#4B4E53] leading-tight sm:leading-relaxed" >Scalable platform designed for large organizations with diverse accommodation requirements.</p>
            </div>

            {/* Card 4: Smart Technology */}
            <div className="bg-white rounded-lg shadow-lg p-2 sm:p-6 text-center mx-1 sm:mx-0">
              <div className="w-6 h-6 sm:w-16 sm:h-16 bg-[#00BAB5] rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg className="w-4 h-4 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-[8px] sm:text-xl font-bold text-[#0B1D37] mb-1 sm:mb-3" >Smart Technology</h3>
              <p className="text-[7px] sm:text-base text-[#4B4E53] leading-tight sm:leading-relaxed" >AI-powered optimization for cost savings, availability matching, and preference learning.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Google Reviews Section */}
      <section className="bg-white py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="flex items-center">
                <span className="text-xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#0B1D37] mr-4">4.8 Stars</span>
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
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xs sm:text-base text-[#4B4E53]">Based on 31 reviews</span>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-xs sm:text-sm text-[#4B4E53]">Google Reviews</span>
              </div>
            </div>
          </div>

          {/* Reviews Carousel */}
          <div className="relative mx-8 sm:mx-0">
            {/* Left Arrow Button */}
            <button 
              onClick={() => setCurrentReviewIndex(prev => prev === 0 ? reviewsData.length - 1 : prev - 1)}
              className="absolute -left-4 sm:-left-12 md:-left-16 lg:-left-20 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-all duration-500 ease-in-out shadow-lg hover:scale-110 z-40"
            >
              <svg className="w-2 h-2 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-[#0B1D37] transition-all duration-500 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Reviews Container */}
            <div className="flex items-center gap-4 sm:gap-6 md:gap-8 overflow-hidden w-full max-w-xs sm:max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-0">
              <div 
                className="flex gap-4 sm:gap-6 md:gap-8 items-stretch transition-transform duration-700 ease-out"
                style={{ 
                  transform: `translateX(-${currentReviewIndex * (isMobile ? 192 : 320)}px)`,
                  willChange: 'transform'
                }}
              >
                {reviewsData.map((review, index) => (
                  <div key={index} className="flex-shrink-0">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 sm:p-6 w-44 sm:w-80 h-full flex flex-col">
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
                      <div className="text-[7px] sm:text-xs text-[#4B4E53] mb-1 sm:mb-3">{review.timePosted}</div>
                      
                      {/* Review Text */}
                      <p className="text-[7px] sm:text-sm text-[#0B1D37] mb-2 sm:mb-4 leading-tight sm:leading-relaxed flex-grow">{review.text}</p>
                      
                      {/* Reviewer Name */}
                      <div className="text-[7px] sm:text-sm font-bold text-[#0B1D37]">{review.reviewerName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow Button */}
            <button 
              onClick={() => setCurrentReviewIndex(prev => (prev + 1) % reviewsData.length)}
              className="absolute -right-4 sm:-right-12 md:-right-16 lg:-right-20 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-all duration-500 ease-in-out shadow-lg hover:scale-110 z-40"
            >
              <svg className="w-2 h-2 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-[#0B1D37] transition-all duration-500 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>


            {/* Explore Properties Section */}
            <section className="bg-[#F6F6F4] py-12 sm:py-16 md:py-20 px-4 sm:px-6">
              <div className="max-w-none mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0B1D37] mb-3 sm:mb-4">Explore Properties</h2>
          </div>

          {/* Property Cards */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 overflow-hidden w-full">
            {/* All property data */}
            {(() => {
              const propertyData = [
                { src: "/bedford.webp", alt: "Bedford", title: "Bedford" },
                { src: "/Birmingham.webp", alt: "Birmingham", title: "Birmingham" },
                { src: "/Bristol.webp", alt: "Bristol", title: "Bristol" },
                { src: "/Cardiff.webp", alt: "Cardiff", title: "Cardiff" },
                { src: "/Crane Cardiff.webp", alt: "Crane Cardiff", title: "Crane Cardiff" },
                { src: "/House driveway.webp", alt: "House Driveway", title: "House Driveway" },
                { src: "/Houses.webp", alt: "Houses", title: "Houses" },
                { src: "/Houses-1.webp", alt: "Houses", title: "Houses" },
                { src: "/Houses - 2.webp", alt: "Houses", title: "Houses" },
                { src: "/London.webp", alt: "London", title: "London" },
                { src: "/London Construction.webp", alt: "London Construction", title: "London Construction" },
                { src: "/Manchester.webp", alt: "Manchester", title: "Manchester" },
                { src: "/Milford heaven.webp", alt: "Milford Heaven", title: "Milford Heaven" },
                { src: "/NHS workers.webp", alt: "NHS Workers", title: "NHS Workers" },
                { src: "/Port Talbot.webp", alt: "Port Talbot", title: "Port Talbot" },
                { src: "/Port talbot-1.webp", alt: "Port Talbot", title: "Port Talbot" },
                { src: "/Rail Workers.webp", alt: "Rail Workers", title: "Rail Workers" },
                { src: "/sizewell.webp", alt: "Sizewell", title: "Sizewell" },
                { src: "/Swansea.webp", alt: "Swansea", title: "Swansea" },
                { src: "/Swansea - 1.webp", alt: "Swansea", title: "Swansea" }
              ];

              return (
                <>
                  {/* Carousel Wrapper with arrows */}
                  <div className="relative flex items-center justify-center">
                    {/* Left Arrow Button - positioned absolutely */}
                    {currentImageIndex > 0 && (
                      <button 
                        onClick={prevImage}
                        className="absolute -left-4 sm:-left-12 md:-left-16 lg:-left-20 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-all duration-500 ease-in-out shadow-lg hover:scale-110 z-40"
                      >
                        <svg className="w-2 h-2 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-[#0B1D37] transition-all duration-500 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}

                    {/* Carousel Container with sliding animation - shows 3 images */}
                    <div className="flex items-center gap-2 sm:gap-4 md:gap-6 overflow-hidden w-full max-w-xs sm:max-w-4xl lg:max-w-5xl mx-auto">
                      <div 
                        className="flex gap-2 sm:gap-4 md:gap-6 transition-transform duration-700 ease-out carousel-slide"
                        style={{ 
                          transform: `translateX(-${currentImageIndex * (isMobile ? 128 : 128)}px)`,
                          width: 'calc(6 * 120px + 5 * 8px)',
                          willChange: 'transform'
                        }}
                      >
                        {propertyData.map((property, index) => (
                          <div key={index} className="flex-shrink-0">
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden w-24 sm:w-60 md:w-80 h-32 sm:h-72 md:h-96">
                              <img 
                                src={property.src} 
                                alt={property.alt} 
                                loading="eager" className="w-full h-24 sm:h-56 md:h-80 object-cover rounded-t-lg"
                              />
                              <div className="p-1 sm:p-3 md:p-4 text-center">
                                <h3 className="text-[8px] sm:text-lg md:text-xl font-semibold text-[#0B1D37]">{property.title}</h3>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Arrow Button - positioned absolutely */}
                    {(() => {
                      // Show right arrow until all images are visible one by one
                      // Both mobile and desktop work the same way
                      const maxPosition = propertyData.length - 1;
                      return currentImageIndex < maxPosition;
                    })() && (
                      <button 
                        onClick={nextImage}
                        className="absolute -right-4 sm:-right-12 md:-right-16 lg:-right-20 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-all duration-500 ease-in-out shadow-lg hover:scale-110 z-40"
                      >
                        <svg className="w-2 h-2 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-[#0B1D37] transition-all duration-500 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </section>

            {/* Our Property Partners Section */}
            <section 
              className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6"
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
              <div className="relative z-10 max-w-sm sm:max-w-4xl mx-auto text-center px-8 sm:px-0">
                <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8">
                  Our Property Partners
                </h2>
                
                <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
                  <p className="text-[8px] sm:text-base md:text-lg text-white leading-relaxed">
                    We work with a trusted network of professional property partners across the UK to provide quality, compliant accommodation for our clients.
                  </p>
                  <p className="text-[8px] sm:text-base md:text-lg text-white leading-relaxed">
                    Our partners benefit from steady professional bookings, reliable income, and full support from our team.
                  </p>
                  <p className="text-[8px] sm:text-base md:text-lg text-white leading-relaxed">
                    If you own or manage suitable properties, we'd like to hear from you.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <button 
                    onClick={() => window.location.href = '/auth/signup/landlord'}
                    className="bg-[#00BAB5] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-xs sm:text-lg font-semibold hover:bg-[#00A5A0] transition-colors"
                  >
                    Become a Partner
                  </button>
                  <p className="text-[8px] sm:text-sm text-white">
                    Join our network of trusted accommodation providers
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-[#F6F6F4] py-12 sm:py-16 md:py-20 px-4 sm:px-6">
              <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-8 sm:mb-12 md:mb-16">
                  <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0B1D37] mb-3 sm:mb-4">FAQ</h2>
                  <p className="text-xs sm:text-lg md:text-xl text-[#4B4E53]">Frequently Asked Questions about our corporate accommodation services</p>
                </div>

                {/* FAQ Accordion - Two Column Layout */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {generateFAQData().map((faq) => (
                    <div key={faq.id} className="bg-white rounded-lg shadow-lg overflow-hidden self-start">
                      <button
                        onClick={() => handleFAQClick(faq.id)}
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-[8px] sm:text-lg font-semibold text-[#0B1D37] pr-2 sm:pr-4 flex-1">
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
                      <div className={`transition-all duration-300 ease-in-out ${openFAQs.has(faq.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                        <div className="px-4 sm:px-6 pb-3 sm:pb-4 border-t border-gray-100">
                          <p className="text-[8px] sm:text-base text-[#00BAB5] leading-relaxed pt-3 sm:pt-4">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* App Download Section */}
            <section className="bg-white py-12 sm:py-16 md:py-20 px-4 sm:px-6">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 gap-4 lg:gap-2 items-center">
                  {/* Left Content */}
                  <div className="text-left lg:pr-4">
                    <div className="mb-2">
                      <span className="text-xs sm:text-base text-[#00BAB5]">Download the</span>
                    </div>
                    <h2 className="text-xs sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0B1D37] mb-2 sm:mb-4">
                      <span className="sm:hidden">BOOKING-HUB MOBILE APP</span>
                      <span className="hidden sm:inline">Booking-hub mobile app</span>
                    </h2>
                    <p className="text-xs sm:text-xl md:text-2xl text-[#00BAB5] mb-4 sm:mb-6">
                      Be informed about special offers!
                    </p>
                    
                    {/* Download Buttons */}
                    <div className="flex flex-col gap-2 sm:gap-4 sm:flex-row justify-start">
                      {/* Google Play Button */}
                      <a 
                        href="#" 
                        className="inline-flex items-center justify-center bg-black text-white px-2 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <img src="/google-play.png" alt="Google Play" loading="eager" className="w-6 h-6 mr-2 sm:mr-3" />
                        <div className="text-left">
                          <div className="text-[8px] sm:text-xs">Get it on</div>
                          <div className="text-xs sm:text-lg font-semibold">Google Play</div>
                        </div>
                      </a>

                      {/* App Store Button */}
                      <a 
                        href="#" 
                        className="inline-flex items-center justify-center bg-black text-white px-2 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <svg className="w-6 h-6 mr-2 sm:mr-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                        <div className="text-left">
                          <div className="text-[8px] sm:text-xs">Download on the</div>
                          <div className="text-xs sm:text-lg font-semibold">App Store</div>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Right Content - Mobile Mockup Image */}
                  <div className="flex justify-start lg:pl-2">
                    <div className="relative">
                      <img 
                        src="/Mobile-Mockup.png" 
                        alt="Booking Hub Mobile App Mockup" 
                        className="w-full max-w-md h-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer Section */}
            <footer className="bg-[#0B1D37] py-6 sm:py-8 md:py-12 lg:py-16 px-4 sm:px-6">
              <div className="max-w-7xl mx-auto">
                <div className="grid gap-2 sm:gap-8 md:gap-12 mb-6 sm:mb-8" style={{gridTemplateColumns: isMobile ? '1fr 1.2fr 0.8fr' : '1fr 1fr 1fr'}}>
                  {/* Branding Section */}
                  <div className="space-y-4 sm:space-y-6">
                    {/* Logo */}
                    <div className="flex items-center">
                      <img src="/Asset 3@4x.png" alt="Booking Hub Logo" loading="eager" className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto" />
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-300 text-[7px] sm:text-sm md:text-base leading-relaxed" >
                      A trading name of Dion Wright Property Ltd.<br />
                      Registered in England & Wales No. 15312220.
                    </p>
                    
                    {/* Social Media Icons */}
                    <div className="flex space-x-3 sm:space-x-4">
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
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-white text-[10px] sm:text-lg font-semibold" >Quick Links</h3>
                    <ul className="space-y-0 sm:space-y-3">
                      <li><a href="#" className="text-gray-300 hover:text-[#00BAB5] transition-colors text-[7px] sm:text-base leading-tight sm:leading-normal" >Home</a></li>
                      <li><a href="#" className="text-gray-300 hover:text-[#00BAB5] transition-colors text-[7px] sm:text-base leading-tight sm:leading-normal" >How We Help You</a></li>
                      <li><a href="#" className="text-gray-300 hover:text-[#00BAB5] transition-colors text-[7px] sm:text-base leading-tight sm:leading-normal" >Book Accommodation</a></li>
                      <li><a href="/auth/signup/landlord" className="text-gray-300 hover:text-[#00BAB5] transition-colors text-[7px] sm:text-base leading-tight sm:leading-normal" >Become a Partner</a></li>
                      <li><a href="#" className="text-gray-300 hover:text-[#00BAB5] transition-colors text-[7px] sm:text-base leading-tight sm:leading-normal" >Contact</a></li>
                    </ul>
                  </div>

                  {/* Contact Info Section */}
                  <div className="space-y-4 sm:space-y-6 -ml-8 sm:ml-0">
                    <h3 className="text-white text-[10px] sm:text-lg font-semibold" >Contact Info</h3>
                    <div className="space-y-3 sm:space-y-4">
                      {/* Email */}
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#00BAB5] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                        </svg>
                        <div>
                          <span className="text-white text-[7px] sm:text-sm" >Email</span>
                          <div className="text-gray-300 text-[7px] sm:text-sm" >info@booking-hub.co.uk</div>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#00BAB5] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                        </svg>
                        <div>
                          <span className="text-white text-[7px] sm:text-sm" >Phone</span>
                          <div className="text-gray-300 text-[7px] sm:text-sm" >0330 043 7522</div>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#00BAB5] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                        </svg>
                        <div>
                          <span className="text-white text-[7px] sm:text-sm" >Registered office</span>
                          <div className="text-gray-300 text-[7px] sm:text-sm" >SA12 Business Centre, Seaway Parade, Baglan Energy Park, Port Talbot SA12 7BR</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section - Legal Links */}
                <div className="border-t border-gray-700 pt-4 sm:pt-6 md:pt-8">
                  <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row space-x-6 md:space-x-8">
                      <span className="text-gray-300 text-[7px] sm:text-sm leading-tight sm:leading-normal">
                        <a href="/privacy-policy" className="hover:text-[#00BAB5] transition-colors">Privacy Policy</a>
                        <span className="mx-0.5 sm:mx-2">|</span>
                        <a href="/terms-and-conditions" className="hover:text-[#00BAB5] transition-colors">Terms & Conditions</a>
                        <span className="mx-0.5 sm:mx-2">|</span>
                        <a href="#" className="hover:text-[#00BAB5] transition-colors">Cookie Notice</a>
                      </span>
                    </div>
                    <div className="text-gray-400 text-[7px] sm:text-sm text-right" >
                      © 2025 Booking Hub. All rights reserved.
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </>
      );
}