"use client"

// This file is typically provided by shadcn/ui.
// If it's not already in your project, you can generate it with:
// npx shadcn@latest add toast
// npx shadcn@latest add toaster
// npx shadcn@latest add use-toast

// Assuming it's already there, but including for completeness if it wasn't.
// If you already have it, this block will be ignored.

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
