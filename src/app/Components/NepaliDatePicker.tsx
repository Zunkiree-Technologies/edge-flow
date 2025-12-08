"use client";
import React from "react";
import { NepaliDatePicker as Calendar } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";
import { Calendar as CalendarIcon } from "lucide-react";

interface NepaliDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
}

export default function NepaliDatePicker({
  value,
  onChange,
  className = "",
  placeholder = "Select date",
  disabled,
}: NepaliDatePickerProps) {
  // Handle date change from Nepali calendar
  const handleDateChange = (nepaliDate: string) => {
    onChange(nepaliDate);
  };

  return (
    <div className={`nepali-datepicker-compact relative ${className}`}>
      <style jsx global>{`
        /* HubSpot-style compact date picker */
        .nepali-datepicker-compact .nepali-date-picker {
          width: 100%;
        }
        .nepali-datepicker-compact .nepali-date-picker input {
          width: 100% !important;
          padding: 6px 10px 6px 32px !important;
          font-size: 13px !important;
          border: 1px solid #d1d5db !important;
          border-radius: 6px !important;
          background: white !important;
          color: #374151 !important;
          height: 34px !important;
          box-sizing: border-box !important;
          transition: all 0.15s ease !important;
        }
        .nepali-datepicker-compact .nepali-date-picker input:hover {
          border-color: #9ca3af !important;
        }
        .nepali-datepicker-compact .nepali-date-picker input:focus {
          outline: none !important;
          border-color: #2272B4 !important;
          box-shadow: 0 0 0 2px rgba(34, 114, 180, 0.15) !important;
        }
        .nepali-datepicker-compact .nepali-date-picker input::placeholder {
          color: #9ca3af !important;
          font-size: 13px !important;
        }
        /* Calendar dropdown styling */
        .nepali-datepicker-compact .calender {
          border-radius: 8px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
          border: 1px solid #e5e7eb !important;
          margin-top: 4px !important;
        }
        .nepali-datepicker-compact .calender .header {
          background: #f9fafb !important;
          border-bottom: 1px solid #e5e7eb !important;
        }
        .nepali-datepicker-compact .calender .header button {
          color: #374151 !important;
        }
        .nepali-datepicker-compact .calender .header button:hover {
          background: #e5e7eb !important;
        }
        .nepali-datepicker-compact .calender .body .week .day:hover {
          background: #dbeafe !important;
        }
        .nepali-datepicker-compact .calender .body .week .day.active {
          background: #2272B4 !important;
          color: white !important;
        }
        /* Remove outer wrapper borders */
        .nepali-datepicker-compact > div {
          border: none !important;
          padding: 0 !important;
        }
      `}</style>
      <CalendarIcon
        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10"
      />
      <Calendar
        onChange={handleDateChange}
        value={value}
        options={{ calenderLocale: "en", valueLocale: "en" }}
        inputClassName="nepali-input"
      />
    </div>
  );
}
