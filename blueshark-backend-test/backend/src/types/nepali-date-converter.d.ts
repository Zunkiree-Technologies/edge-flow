// Type declaration for nepali-date-converter
declare module 'nepali-date-converter' {
  class NepaliDate {
    constructor(date?: Date | string | number, month?: number, day?: number);

    // Get methods
    getYear(): number;
    getMonth(): number;  // 0-indexed (0-11)
    getDate(): number;
    getDay(): number;

    // Set methods
    setYear(year: number): NepaliDate;
    setMonth(month: number): NepaliDate;
    setDate(date: number): NepaliDate;

    // Conversion methods
    toJsDate(): Date;
    toString(): string;
    format(formatStr?: string): string;

    // Static methods
    static now(): NepaliDate;
    static fromAD(date: Date): NepaliDate;
  }

  export default NepaliDate;
}
