/**
 * Frontend Date Utility for BlueShark
 *
 * Handles conversion between:
 * - Gregorian/ISO dates (for storage)
 * - Nepali dates (for display) in format: 2082-09-07
 */

import NepaliDate from "nepali-date-converter";

/**
 * Check if a date string is a Nepali date (year > 2050)
 */
export const isNepaliDateString = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const parts = dateStr.split("-");
  if (parts.length < 1) return false;
  const year = parseInt(parts[0]);
  return year > 2050;
};

/**
 * Convert Gregorian/ISO date to Nepali date string for DISPLAY
 * @param date - ISO date string, Date object, or null/undefined
 * @returns Nepali date string "2082-09-07" or "-" if invalid
 */
export const formatNepaliDate = (date: string | Date | null | undefined): string => {
  if (!date) return "-";

  try {
    // If it's a string, check if it might already be a Nepali date (year > 2050)
    if (typeof date === "string") {
      const yearMatch = date.match(/^(\d{4})/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        // If year is in Nepali range (2050-2100), assume it's already Nepali
        if (year > 2050 && year < 2150) {
          // Already a Nepali date - format it properly
          const parts = date.split(/[-T]/);
          if (parts.length >= 3) {
            const y = parts[0];
            const m = parts[1].padStart(2, "0");
            const d = parts[2].substring(0, 2).padStart(2, "0");
            return `${y}-${m}-${d}`;
          }
        }
      }
    }

    const jsDate = typeof date === "string" ? new Date(date) : date;

    // Validate the date
    if (isNaN(jsDate.getTime())) return "-";

    // Check for 1970 epoch bug (invalid dates default to Jan 1, 1970)
    if (jsDate.getFullYear() === 1970 && jsDate.getMonth() === 0) return "-";

    // Convert to Nepali
    const nepaliDate = new NepaliDate(jsDate);
    const year = nepaliDate.getYear();
    const month = String(nepaliDate.getMonth() + 1).padStart(2, "0");
    const day = String(nepaliDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch {
    return "-";
  }
};

/**
 * Convert Nepali date string to ISO/Gregorian for API storage
 * @param nepaliDateStr - Nepali date string "2082-09-07" or Gregorian "2024-12-22"
 * @returns ISO date string or null
 */
export const nepaliToGregorian = (nepaliDateStr: string | null | undefined): string | null => {
  if (!nepaliDateStr) return null;

  try {
    if (isNepaliDateString(nepaliDateStr)) {
      // Nepali date - convert to Gregorian
      const [year, month, day] = nepaliDateStr.split("-").map(Number);
      const nepaliDate = new NepaliDate(year, month - 1, day);
      return nepaliDate.toJsDate().toISOString();
    }
    // Already Gregorian - just convert to ISO
    return new Date(nepaliDateStr).toISOString();
  } catch {
    return null;
  }
};

/**
 * Convert ISO/Gregorian date to Nepali date string (for input fields)
 * @param isoDate - ISO date string or Date object
 * @returns Nepali date string "2082-09-07" or empty string
 */
export const gregorianToNepaliString = (isoDate: string | Date | null | undefined): string => {
  if (!isoDate) return "";

  try {
    const jsDate = typeof isoDate === "string" ? new Date(isoDate) : isoDate;

    if (isNaN(jsDate.getTime())) return "";
    if (jsDate.getFullYear() === 1970 && jsDate.getMonth() === 0) return "";

    const nepaliDate = new NepaliDate(jsDate);
    const year = nepaliDate.getYear();
    const month = String(nepaliDate.getMonth() + 1).padStart(2, "0");
    const day = String(nepaliDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
};

/**
 * Check if a date is valid (not 1970 epoch, not Invalid Date)
 */
export const isValidDate = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return false;
  if (d.getFullYear() === 1970 && d.getMonth() === 0 && d.getDate() === 1) {
    return false;
  }
  return true;
};

/**
 * Get today's date in Nepali format
 * @returns Nepali date string "2082-09-07"
 */
export const getTodayNepali = (): string => {
  const today = new Date();
  const nepaliDate = new NepaliDate(today);
  const year = nepaliDate.getYear();
  const month = String(nepaliDate.getMonth() + 1).padStart(2, "0");
  const day = String(nepaliDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Compare two dates and return the difference in days
 * @param date1 - First date (Nepali string, ISO string, or Date)
 * @param date2 - Second date (Nepali string, ISO string, or Date)
 * @returns Number of days difference (positive if date1 > date2)
 */
export const getDateDifferenceInDays = (
  date1: string | Date | null | undefined,
  date2: string | Date | null | undefined
): number | null => {
  if (!date1 || !date2) return null;

  try {
    // Convert to JS Date objects
    const getJsDate = (date: string | Date): Date => {
      if (date instanceof Date) return date;

      // Check if Nepali date
      if (isNepaliDateString(date)) {
        const [year, month, day] = date.split("-").map(Number);
        const nepaliDate = new NepaliDate(year, month - 1, day);
        return nepaliDate.toJsDate();
      }

      return new Date(date);
    };

    const jsDate1 = getJsDate(date1);
    const jsDate2 = getJsDate(date2);

    if (isNaN(jsDate1.getTime()) || isNaN(jsDate2.getTime())) {
      return null;
    }

    const diffTime = jsDate1.getTime() - jsDate2.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch {
    return null;
  }
};

/**
 * Check if a date is overdue (past today's date)
 * @param dueDate - Due date to check
 * @returns true if overdue, false otherwise
 */
export const isOverdue = (dueDate: string | Date | null | undefined): boolean => {
  if (!dueDate) return false;

  const diff = getDateDifferenceInDays(new Date(), dueDate);
  return diff !== null && diff > 0;
};

/**
 * Get a human-readable relative date string
 * @param date - Date to format
 * @returns String like "Today", "Yesterday", "3 days ago", "In 2 days"
 */
export const getRelativeDateString = (date: string | Date | null | undefined): string => {
  if (!date) return "-";

  const diff = getDateDifferenceInDays(new Date(), date);
  if (diff === null) return "-";

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff === -1) return "Tomorrow";
  if (diff > 1) return `${diff} days ago`;
  if (diff < -1) return `In ${Math.abs(diff)} days`;

  return "-";
};
