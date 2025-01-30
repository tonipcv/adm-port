'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  title?: string
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ className, children, isOpen, onClose, title, ...props }, ref) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div
          ref={ref}
          className={cn(
            "relative bg-zinc-950 rounded-lg shadow-lg w-full max-w-lg border border-zinc-800",
            className
          )}
          {...props}
        >
          {title && (
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="text-lg font-medium text-zinc-200">{title}</h2>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-200"
              >
                ×
              </button>
            </div>
          )}
          <div className="p-4">{children}</div>
        </div>
      </div>
    )
  }
)
Modal.displayName = "Modal"

export { Modal } 