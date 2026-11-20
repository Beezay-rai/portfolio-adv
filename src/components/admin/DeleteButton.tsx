"use client";

import { deleteResource } from "@/actions/resource";
import { DeleteModal } from "./DeleteModal";

export function DeleteButton({ resource, id, label }: { resource: string; id: string; label: string }) {
  return (
    <DeleteModal
      id={id}
      title={label}
      action={async (formData) => {
        // Since deleteResource expects __resource and __id, we pass them
        formData.set("__resource", resource);
        formData.set("__id", id);
        await deleteResource(formData);
      }}
      nameField="__id"
      buttonClassName="btn-danger text-sm px-3 py-1.5 inline-flex items-center"
      buttonText="Delete"
      titleText="Delete record"
      descriptionText={
        <>
          Are you sure you want to delete <span className="font-medium text-ink">&ldquo;{label}&rdquo;</span>? This action cannot be undone.
        </>
      }
    />
  );
}
