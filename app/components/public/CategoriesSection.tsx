'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Users, Hotel, Utensils } from 'lucide-react';

const categories = [
  {
    id: 'venue',
    name: 'Event Venues',
    description: 'Beautiful spaces for your special events',
    icon: Building2,
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'accommodation',
    name: 'Accommodation',
    description: 'Comfortable stays for your guests',
    icon: Hotel,
    color: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'catering',
    name: 'Catering',
    description: 'Delicious food and beverage services',
    icon: Utensils,
    color: 'from-orange-500 to-orange-600',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'other',
    name: 'Other Services',
    description: 'Decorations, music, photography & more',
    icon: Users,
    color: 'from-green-500 to-green-600',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50',
  },
];

export function CategoriesSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Are You Looking For?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Browse by category to find the perfect service for your event
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                href={`/listings?category=${category.id}`}
              >
                <div className={`${category.bgColor} rounded-lg p-8 hover:shadow-lg transition duration-300 cursor-pointer h-full`}>
                  {/* Icon Circle */}
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br ${category.color} mb-4`}
                  >
                    <Icon size={32} className="text-white" />
                  </div>

                  {/* Content */}
                  <h3 className={`text-xl font-semibold ${category.textColor} mb-2`}>
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {category.description}
                  </p>

                  {/* Arrow */}
                  <div className="mt-4 flex items-center space-x-2">
                    <span className={`text-sm font-medium ${category.textColor}`}>
                      Browse
                    </span>
                    <svg
                      className={`w-4 h-4 ${category.textColor}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}