'use client';

import { ToastProvider } from '@/components/ui/Toast';
import { IdleTimeoutProvider } from '@/components/providers/IdleTimeoutProvider';

export default function Providers({ children }) {
  return (
    <ToastProvider>
      <IdleTimeoutProvider>
        {children}
      </IdleTimeoutProvider>
    </ToastProvider>
  );
}
