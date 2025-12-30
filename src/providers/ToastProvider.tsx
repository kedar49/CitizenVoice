import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster 
      position="top-right"
      expand={false}
      richColors
      closeButton
      theme="system"
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--foreground))',
        },
        className: 'font-sans',
      }}
    />
  );
}
