'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4  gap-8 mb-8">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="text-2xl font-bold text-white">Inova</div>
            <p className="text-sm text-gray-400">
              Kenya's premier hospitality marketplace connecting vendors and customers.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-400 transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-primary-400 transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-primary-400 transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-primary-400 transition">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-primary-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/listings" className="hover:text-primary-400 transition">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-400 transition">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">For Vendors</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/auth/register-vendor" className="hover:text-primary-400 transition">
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-400 transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-400 transition">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-400 transition">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Phone size={18} className="text-primary-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm">+254 (0) 700 000 000</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail size={18} className="text-primary-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm">support@inova.co.ke</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-primary-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm">Nairobi, Kenya</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="text-sm text-gray-400">
            &copy; 2024 Inova. All rights reserved.
          </div>
          <div className="flex space-x-6 md:justify-end text-sm">
            <Link href="#" className="hover:text-primary-400 transition">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-primary-400 transition">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-primary-400 transition">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}