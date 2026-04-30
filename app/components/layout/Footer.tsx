'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{ backgroundColor: '#2D3B45' }} className="text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block no-underline">
              <Image
                src="/images/logo.png"
                alt="LinkMart"
                width={120}
                height={28}
                className="h-7 w-auto brightness-0 invert" // invert makes dark logo visible on dark bg
              />
            </Link>
            <p className="text-sm text-gray-400">
              Kenya's premier hospitality marketplace connecting vendors and customers.
            </p>
            <div className="flex space-x-4">
              {[
                { Icon: Facebook,  href: '#' },
                { Icon: Twitter,   href: '#' },
                { Icon: Instagram, href: '#' },
                { Icon: Linkedin,  href: '#' },
              ].map(({ Icon, href }) => (
                <a key={href} href={href}
                  className="text-gray-400 hover:text-[#F5C842] transition-colors">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Home',            href: '/'        },
                { label: 'Browse Listings', href: '/store'   },
                { label: 'About Us',        href: '/about'   },
                { label: 'How It Works',    href: '#'        },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href}
                    className="text-sm text-gray-400 hover:text-[#F5C842] transition-colors no-underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">
              For Vendors
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Become a Vendor', href: '/auth/register' },
                { label: 'Pricing',         href: '#'              },
                { label: 'Resources',       href: '#'              },
                { label: 'Support',         href: '#'              },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href}
                    className="text-sm text-gray-400 hover:text-[#F5C842] transition-colors no-underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <div className="space-y-3">
              {[
                { Icon: Phone,  text: '+254 (0) 700 000 000' },
                { Icon: Mail,   text: 'support@linkmart.co.ke' },
                { Icon: MapPin, text: 'Nairobi, Kenya' },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <Icon size={16} className="text-[#F5C842] shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} LinkMart. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs">
            {[
              { label: 'Privacy Policy',  href: '#' },
              { label: 'Terms of Service', href: '#' },
              { label: 'Cookie Policy',   href: '#' },
            ].map(({ label, href }) => (
              <Link key={label} href={href}
                className="text-gray-500 hover:text-[#F5C842] transition-colors no-underline">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}