'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  name?: string;
  id?: string;
}

export default function CustomSelect({
  options,
  value = '',
  onChange,
  placeholder = 'Select an option',
  className = '',
  error = false,
  name,
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const styleId = 'custom-select-scrollbar-hide';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .custom-select-dropdown::-webkit-scrollbar {
          display: none;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    onChange?.(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === selectedValue);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <input
        type="hidden"
        name={name}
        id={id}
        value={selectedValue}
      />
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-sm sm:text-base text-left flex items-center justify-between h-[38px] sm:h-auto font-avenir tracking-wide ${
          error ? 'border-red-500' : 'border-booking-teal'
        }`}
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <span className={`text-sm sm:text-base font-avenir tracking-wide ${selectedValue ? 'text-gray-900' : 'text-gray-500'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="custom-select-dropdown absolute z-50 w-full mt-1 border border-booking-teal rounded shadow-lg max-h-60 overflow-auto"
          style={{ 
            backgroundColor: '#FFFFFF',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-sm sm:text-base transition-colors font-avenir tracking-wide ${
                selectedValue === option.value ? 'font-semibold' : ''
              }`}
              style={{
                backgroundColor: selectedValue === option.value ? '#008080' : 'transparent',
                color: selectedValue === option.value ? '#FFFFFF' : '#000000',
              }}
              onMouseEnter={(e) => {
                if (selectedValue !== option.value) {
                  e.currentTarget.style.backgroundColor = '#008080';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedValue !== option.value) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#000000';
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
