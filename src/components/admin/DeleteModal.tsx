"use client";

import { useState, useTransition } from "react";

interface DeleteModalProps {
  id: string;
  title: string;
  action: (formData: FormData) => Promise<void>;
  nameField?: string;
  buttonClassName?: string;
  buttonText?: string;
  titleText?: string;
  descriptionText?: React.ReactNode;
}

export function DeleteModal({
  id,
  title,
  action,
  nameField = "id",
  buttonClassName = "text-sm text-red-600 hover:underline",
  buttonText = "Remove",
  titleText = "Confirm removal",
  descriptionText,
}: DeleteModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={buttonClassName}
      >
        {buttonText}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md rounded-2xl bg-white border border-line/60 p-6 shadow-card animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-ink">{titleText}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-ink-faint hover:text-ink transition-colors p-1 rounded-lg"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-ink-soft mb-6">
              {descriptionText ?? (
                <>
                  Are you sure you want to remove <span className="font-medium text-ink">&ldquo;{title}&rdquo;</span>? This action cannot be undone.
                </>
              )}
            </p>

            <form
              action={async (formData) => {
                startTransition(async () => {
                  await action(formData);
                  setIsOpen(false);
                });
              }}
              className="flex items-center justify-end gap-3"
            >
              <input type="hidden" name={nameField} value={id} />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="btn-ghost text-sm px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="btn-danger text-sm px-4 py-2"
              >
                {isPending ? "Removing..." : buttonText}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
