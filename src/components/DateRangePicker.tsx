'use client';

import { useState, useEffect, useRef } from 'react';

interface DateRangePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (startDate: string, endDate: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
  bookingId?: string;
}

export default function DateRangePicker({
  isOpen,
  onClose,
  onSelect,
  initialStartDate = '',
  initialEndDate = '',
  bookingId
}: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(
    initialStartDate ? new Date(initialStartDate) : null
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(
    initialEndDate ? new Date(initialEndDate) : null
  );
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [isSelectingStart, setIsSelectingStart] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  // Helper function to parse date string (YYYY-MM-DD) to local Date
  const parseDateString = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (initialStartDate) {
        setSelectedStartDate(parseDateString(initialStartDate));
        setIsSelectingStart(false);
      } else {
        setSelectedStartDate(null);
        setIsSelectingStart(true);
      }
      if (initialEndDate) {
        setSelectedEndDate(parseDateString(initialEndDate));
      } else {
        setSelectedEndDate(null);
      }
      if (initialStartDate) {
        setCurrentMonth(parseDateString(initialStartDate));
      }
    }
  }, [isOpen, initialStartDate, initialEndDate]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        // On mobile, backdrop handles closing
        // On desktop, close when clicking anywhere outside
        if (!target.classList.contains('bg-black/50')) {
          onClose();
        }
      }
    };

    if (isOpen) {
      // Only prevent body scroll on mobile
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
      // Small delay to prevent immediate closing when opening
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date >= selectedStartDate && date <= selectedEndDate;
  };

  const isDateInHoverRange = (date: Date) => {
    if (!selectedStartDate || selectedEndDate || !hoverDate) return false;
    if (isSelectingStart) return false;
    
    const start = selectedStartDate < hoverDate ? selectedStartDate : hoverDate;
    const end = selectedStartDate < hoverDate ? hoverDate : selectedStartDate;
    return date >= start && date <= end;
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (isSelectingStart || !selectedStartDate) {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      setIsSelectingStart(false);
    } else {
      if (date < selectedStartDate) {
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
      } else {
        setSelectedEndDate(date);
      }
      setIsSelectingStart(true);
    }
  };

  const handleConfirm = () => {
    if (selectedStartDate && selectedEndDate) {
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      onSelect(formatDate(selectedStartDate), formatDate(selectedEndDate));
      onClose();
    }
  };

  const handleClear = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setIsSelectingStart(true);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sm:hidden" onClick={onClose} />
      
      {/* Calendar Popover */}
      <div
        ref={modalRef}
        className="absolute z-50 top-full left-0 mt-2 sm:mt-2 bg-[#F6F6F4] rounded-xl shadow-2xl w-[calc(100vw-2rem)] sm:w-[380px] md:w-[400px] animate-card-entrance-1 overflow-hidden border border-[#008080]/20"
        style={{ fontFamily: 'var(--font-avenir-regular)' }}
      >
        {/* Header */}
        <div className="bg-[#0B1D37] text-[#F6F6F4] px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <h2 className="text-sm sm:text-base md:text-lg font-bold" style={{ fontFamily: 'var(--font-avenir-bold)' }}>
            Select Dates
          </h2>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 hover:bg-[#008080]/20 rounded-lg transition-colors duration-200"
            aria-label="Close"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Calendar Container */}
        <div className="p-3 sm:p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 sm:p-2 hover:bg-[#008080]/10 rounded-lg transition-colors duration-200 text-[#0B1D37]"
              aria-label="Previous month"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-1.5 sm:gap-3">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#0B1D37]" style={{ fontFamily: 'var(--font-avenir-bold)' }}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={goToToday}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-[#008080] text-white rounded-lg hover:bg-[#006666] transition-colors duration-200 font-medium"
              >
                Today
              </button>
            </div>
            <button
              onClick={goToNextMonth}
              className="p-1.5 sm:p-2 hover:bg-[#008080]/10 rounded-lg transition-colors duration-200 text-[#0B1D37]"
              aria-label="Next month"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1.5 sm:mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] sm:text-xs font-semibold text-[#4B4E53] py-1 sm:py-1.5"
                style={{ fontFamily: 'var(--font-avenir)' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dateStr = date.toDateString();
              const isToday = dateStr === today.toDateString();
              const isDisabled = isDateDisabled(date);
              const isStart = selectedStartDate && dateStr === selectedStartDate.toDateString();
              const isEnd = selectedEndDate && dateStr === selectedEndDate.toDateString();
              const isInRange = isDateInRange(date);
              const isInHoverRange = isDateInHoverRange(date);
              const isSelected = isStart || isEnd;

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => {
                    if (!isSelectingStart && selectedStartDate) {
                      setHoverDate(date);
                    }
                  }}
                  onMouseLeave={() => setHoverDate(null)}
                  disabled={isDisabled}
                  className={`
                    aspect-square text-[11px] sm:text-xs md:text-sm font-medium rounded-md transition-all duration-200
                    ${isDisabled 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : isSelected
                        ? 'bg-[#008080] text-white shadow-md scale-105 z-10'
                        : isInRange || isInHoverRange
                          ? 'bg-[#008080]/20 text-[#0B1D37]'
                          : isToday
                            ? 'bg-[#008080]/10 text-[#008080] font-bold border border-[#008080]'
                            : 'text-[#4B4E53] hover:bg-[#008080]/10 hover:text-[#0B1D37]'
                    }
                  `}
                  style={{ fontFamily: 'var(--font-avenir-regular)' }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Selected Dates Display */}
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-white rounded-lg border border-[#008080]/20">
            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 text-xs sm:text-sm">
              <div className="flex-1">
                <span className="text-[#4B4E53] font-medium">Start Date: </span>
                <span className="text-[#0B1D37] font-semibold">
                  {selectedStartDate
                    ? selectedStartDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Not selected'}
                </span>
              </div>
              <div className="flex-1">
                <span className="text-[#4B4E53] font-medium">End Date: </span>
                <span className="text-[#0B1D37] font-semibold">
                  {selectedEndDate
                    ? selectedEndDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Not selected'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 mt-3 sm:mt-4">
            <button
              onClick={handleClear}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-[#4B4E53] bg-white border-2 border-[#4B4E53] rounded-lg hover:bg-[#4B4E53] hover:text-white transition-all duration-200"
              style={{ fontFamily: 'var(--font-avenir-regular)' }}
            >
              Clear
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedStartDate || !selectedEndDate}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-[#008080] rounded-lg hover:bg-[#006666] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#008080] shadow-md"
              style={{ fontFamily: 'var(--font-avenir-regular)' }}
            >
              Confirm Dates
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
