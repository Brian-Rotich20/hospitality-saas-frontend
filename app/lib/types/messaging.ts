// Messaging contract (backend/src/modules/messaging). A conversation exists once a vendor
// accepts a booking; there are no websockets, so clients poll.

import type { BookingStatus } from './booking';

/** GET /conversations row. */
export interface ConversationSummary {
  id: string;
  bookingId: string;
  lastMessageAt: string | null;
  createdAt: string;
  bookingStatus: BookingStatus;
  listingTitle: string;
  listingId: string;
  businessName: string;
}

/** GET /conversations/by-booking/:bookingId. */
export interface ConversationRef {
  id: string;
  bookingId: string;
  customerId: string;
  vendorId: string;
  lastMessageAt: string | null;
  createdAt: string;
  writable: boolean;
}

export interface Message {
  id: string;
  mine: boolean;
  senderRole: 'customer' | 'vendor';
  /** null when a moderator has hidden the message. */
  body: string | null;
  hidden: boolean;
  createdAt: string;
}

/** GET /conversations/:id/messages. */
export interface MessagePage {
  conversationId: string;
  writable: boolean;
  messages: Message[];
}

/** GET /admin/messages/reports row. */
export interface MessageReport {
  report: { id: string; messageId: string; reporterId: string; reason: string; createdAt: string };
  message: { id: string; body: string; conversationId: string; hiddenAt: string | null; senderUserId: string };
}

export const MESSAGE_MAX = 2000;
export const REPORT_MIN = 5;
export const REPORT_MAX = 500;
