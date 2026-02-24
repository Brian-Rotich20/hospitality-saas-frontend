'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
// import { formatDate } from '@/lib/utils';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  minDate?: Date;
  disabled?: boolean;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate = new Date(),
  disabled = false,
}: DateRangePickerProps) {
  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const newDate = new Date(e.target.value);
      onStartDateChange(newDate);
      
      // Auto-set end date if not set
      if (!endDate) {
        const endDateAuto = new Date(newDate);
        endDateAuto.setDate(endDateAuto.getDate() + 1);
        onEndDateChange(endDateAuto);
      }
    } else {
      onStartDateChange(null);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const newDate = new Date(e.target.value);
      onEndDateChange(newDate);
    } else {
      onEndDateChange(null);
    }
  };

  const minDateString = formatDateForInput(minDate);
  const startDateString = formatDateForInput(startDate);
  const endDateString = formatDateForInput(endDate);

  // End date must be after start date
  const minEndDate = startDate ? new Date(startDate) : minDate;
  if (minEndDate === startDate) {
    minEndDate.setDate(minEndDate.getDate() + 1);
  }
  const minEndDateString = formatDateForInput(minEndDate);

  const nights = startDate && endDate 
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-In Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="date"
              value={startDateString}
              onChange={handleStartDateChange}
              min={minDateString}
              disabled={disabled}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-Out Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="date"
              value={endDateString}
              onChange={handleEndDateChange}
              min={minEndDateString}
              disabled={disabled || !startDate}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Night Count */}
      {nights > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">{nights}</span> night{nights !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}