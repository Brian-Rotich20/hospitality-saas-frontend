// app/auth/layout.tsx  — add Toaster once here, all auth pages get it
import { Toaster } from 'react-hot-toast';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1A2820',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: 'DM Sans, system-ui, sans-serif',
          },
          success: {
            iconTheme: { primary: '#D4ED47', secondary: '#0F1A14' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
          },
        }}
      />
    </>
  );
}