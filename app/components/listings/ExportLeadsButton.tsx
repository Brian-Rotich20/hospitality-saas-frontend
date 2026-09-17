// components/listings/ExportLeadsButton.tsx
// ✅ Server Component — a plain <a download>, not a client button.
// The browser requests /api/vendor/leads/export directly and saves the response;
// no fetch/blob/useState needed on the client for something this simple.

import { Download } from 'lucide-react';

export function ExportLeadsButton() {
  return (
    <a
      href="/api/vendor/leads/export"
      download
      className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 border border-gray-200
        text-xs font-bold rounded-xl hover:border-brand hover:text-brand transition no-underline"
    >
      <Download size={14} /> Export Leads
    </a>
  );
}