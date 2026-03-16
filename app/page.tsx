// app/page.tsx
// Redirect root / to /store — store is the main listings page
import { redirect } from 'next/navigation';
 
export default function RootPage() {
  redirect('/store');
}
 