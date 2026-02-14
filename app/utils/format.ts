// Frmat utilities for dates, times, prices, and phone numbers
import { format, formatDistance, parseISO } from 'date-fns';

export const formatDate = (date: string | Date, pattern = 'MMM dd, yyyy') => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
};

export const formatDateRange = (
  startDate: string | Date,
  endDate: string | Date
) => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
};

export const formatTime = (date: string | Date, pattern = 'HH:mm') => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
};

export const formatRelativeTime = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(d, new Date(), { addSuffix: true });
};

export const formatPrice = (
  price: number,
  currency = 'KES',
  locale = 'en-US'
) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(price);
};

export const formatNumber = (num: number, locale = 'en-US') => {
  return new Intl.NumberFormat(locale).format(num);
};

export const formatPhoneNumber = (phone: string) => {
  // Remove non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle Kenyan format
  if (cleaned.length === 10 && cleaned.startsWith('7')) {
    return `+254${cleaned.substring(1)}`;
  }
  
  return phone;
};