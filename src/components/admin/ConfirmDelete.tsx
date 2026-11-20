"use client";

import { deleteAnime } from "@/actions/anime";
import { DeleteModal } from "./DeleteModal";

export function ConfirmDelete({ id, title }: { id: string; title: string }) {
  return (
    <DeleteModal
      id={id}
      title={title}
      action={deleteAnime}
      nameField="id"
      buttonClassName="text-sm text-red-600 hover:underline font-medium"
      buttonText="Remove"
      titleText="Remove anime"
      descriptionText={
        <>
          Are you sure you want to remove <span className="font-medium text-ink">&ldquo;{title}&rdquo;</span>? This action cannot be undone.
        </>
      }
      
    />
  );
}
