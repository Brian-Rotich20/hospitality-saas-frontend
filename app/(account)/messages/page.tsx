'use client';

import Link from 'next/link';
import { useAuth } from '../../lib/auth/auth.context';
import { useConversations } from '../../lib/messaging/unread';
import { ConversationList, useBookingIndex } from '../../components/messaging/ConversationList';

export default function MessagesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { items, error, refresh } = useConversations(!isAdmin, 20_000);
  const index = useBookingIndex(!isAdmin);

  return (
    <div className="max-w-[720px] mx-auto">
      <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight mb-1">Messages</h1>
      <p className="text-[13px] text-gray-500 mb-5">
        Talk to the {user?.role === 'vendor' ? 'customers whose bookings you accepted' : 'vendors who accepted your bookings'}.
        LinkMart does not handle payment; agree on it directly.
      </p>

      {isAdmin ? (
        <p className="text-sm text-gray-600 bg-white border border-gray-200 rounded-2xl p-5">
          Administrators don&apos;t have an inbox. Open a conversation from{' '}
          <Link href="/admin/messages" className="font-bold underline">Message reports</Link>.
        </p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <ConversationList items={items} error={error} onRetry={() => void refresh()} index={index} />
        </div>
      )}
    </div>
  );
}
