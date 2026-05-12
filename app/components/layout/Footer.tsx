'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="footer-root">
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
                className="h-7 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Kenya's premier hospitality marketplace connecting vendors and customers.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Facebook,  href: '#' },
                { Icon: Twitter,   href: '#' },
                { Icon: Instagram, href: '#' },
                { Icon: Linkedin,  href: '#' },
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href} className="footer-social-btn">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Home',            href: '/'      },
                { label: 'Browse Listings', href: '/store' },
                { label: 'About Us',        href: '/about' },
                { label: 'How It Works',    href: '#'      },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="footer-link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h3 className="footer-heading">For Vendors</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Become a Vendor', href: '/auth/register' },
                { label: 'Pricing',         href: '#'              },
                { label: 'Resources',       href: '#'              },
                { label: 'Support',         href: '#'              },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="footer-link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="footer-heading">Contact</h3>
            <div className="space-y-3">
              {[
                { Icon: Phone,  text: '+254 (0) 700 000 000'   },
                { Icon: Mail,   text: 'support@linkmart.co.ke' },
                { Icon: MapPin, text: 'Nairobi, Kenya'         },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <Icon size={16} style={{ color: 'var(--color-star)', flexShrink: 0, marginTop: 2 }} />
                  <p className="footer-link" style={{ cursor: 'default' }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <hr className="footer-divider" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="footer-legal">
            &copy; {new Date().getFullYear()} LinkMart. All rights reserved.
          </p>
          <div className="flex gap-6">
            {[
              { label: 'Privacy Policy',   href: '#' },
              { label: 'Terms of Service', href: '#' },
              { label: 'Cookie Policy',    href: '#' },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="footer-legal footer-link"
                style={{ fontSize: '12px' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}