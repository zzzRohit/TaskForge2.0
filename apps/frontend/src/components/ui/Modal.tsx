import { useEffect, type ReactNode } from "react";
import { Button } from "./Button";

type ModalProps = {
  children: ReactNode;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

export function Modal({
  children,
  description,
  isOpen,
  onClose,
  title,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/20 px-4 py-6 sm:items-center"
      role="dialog"
    >
      <div className="w-full max-w-[440px] rounded-[var(--r-dialog)] border border-line bg-surface shadow-[0_18px_55px_rgba(19,18,17,0.13)]">
        <div className="border-b border-line px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-ink">{title}</h2>
              {description ? (
                <p className="mt-1 text-sm text-ink-2">{description}</p>
              ) : null}
            </div>
            <Button
              aria-label="Close dialog"
              className="h-8 px-2"
              onClick={onClose}
              variant="ghost"
            >
              X
            </Button>
          </div>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
