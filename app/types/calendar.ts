export interface CalendarDay {
  date: string;
  available: boolean;
  priceOverride?: number;
}

export interface CalendarMonth {
  month: number;
  year: number;
  days: CalendarDay[];
}