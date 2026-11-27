# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: vendors.** Kenyan hospitality businesses (venues, caterers, event services) who run their LinkMart presence mostly from a phone, between jobs: publishing listings, answering booking requests before a 24-hour deadline, blocking dates, messaging customers whose bookings they accepted, and keeping their subscription paid. (Confirmed by the owner, 2026-11-27.)
- Customers: people planning events and stays who browse listings, send booking requests, follow their status and message vendors once accepted.
- Administrators: LinkMart staff who moderate vendors and messages, set the subscription price and investigate subscription payments.

## Product Purpose

A marketplace that connects customers with hospitality vendors through request-to-book. Customers send a request for dates; the vendor accepts or declines within 24 hours; once accepted, the two exchange contact details and messages and arrange payment directly. Success: vendors answer requests quickly and keep calendars accurate, customers get clear answers.

## Positioning

LinkMart never touches booking money: no checkout, fees, commissions or payment states on bookings. Its only revenue is a flat vendor subscription (one-month free trial on joining), paid by card (Paystack) or M-Pesa STK Push.

## Operating Context

- Calendar dates are Africa/Nairobi; money is KES.
- Vendor deadline: 24 hours to respond, then the request expires automatically. Pending requests do not hold dates; accepting declines overlapping requests.
- Messaging opens only after acceptance, polling-based, read-only after cancellation and 30 days after completion.
- Notifications are email only; there are no in-app notifications.
- Subscription states: trialing, active, past_due, suspended, cancelled, expired (plus legacy_unenrolled). Unentitled vendors' listings are hidden and they cannot publish or accept.

## Capabilities and Constraints

- Frontend: Next.js 15 / React 18 / Tailwind v4 in `frontend/`, same-origin `/api` proxy to the Fastify backend. Backend contract: `backend/docs/api/API-REFERENCE.md`.
- Open business decisions (do not invent policy): subscription price (admin-set plan; none may exist, then nothing is payable), transition of pre-subscription vendors (D3), saved-card auto-renewal (off, D4), refunds (none, D7), payout details (kept but unused, D9).

## Brand Commitments

- Name: LinkMart. Logo: `public/images/logo.png` (orange cart mark with wordmark) is a fixed asset and stays. Everything else in the visual identity may be replaced. (Confirmed by the owner, 2026-11-27.)
- Visual direction (pinned by the owner, 2026-11-27, replacing the earlier "familiar and premium" choice): palette green `#00831E` (header, primary actions), orange `#E08D35` (main call to action), page `#EBF2F7`; font Poppins; a green marketplace-style header with search and round icon shortcuts; sign-in and sign-up as a split screen on `#030207` with green-yellow accents; vendor onboarding as numbered steps.

## Evidence on Hand

- No testimonials, customer counts, ratings statistics or prices exist. Never fabricate them; the subscription price only ever comes from the API.

## Product Principles

1. The vendor's phone is the primary workspace: every vendor task completes comfortably one-handed on a small screen.
2. Time matters: deadlines, dates and states are always explicit; nothing important hides behind a hover.
3. Money honesty: show only amounts the backend returns; bookings never look like payments.
4. Say what happens next: every state names the next action, and errors name the recovery.
