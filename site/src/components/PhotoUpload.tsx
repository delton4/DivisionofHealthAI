"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useAdmin } from "./AdminProvider";
import { uploadResearcherPhoto } from "@/lib/actions";

interface PhotoUploadProps {
  researcherId: string;
  researcherSlug: string;
  researcherName: string;
  photoUrl?: string;
}

export function PhotoUpload({
  researcherId,
  researcherSlug,
  researcherName,
  photoUrl,
}: PhotoUploadProps) {
  const isAdmin = useAdmin();
  const [currentUrl, setCurrentUrl] = useState(photoUrl);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("researcherId", researcherId);
    formData.append("researcherSlug", researcherSlug);

    startTransition(async () => {
      const result = await uploadResearcherPhoto(formData);
      if (result?.url) {
        setCurrentUrl(result.url);
      }
    });
  };

  // Non-admin: show photo if exists, nothing if not
  if (!isAdmin) {
    if (!currentUrl) return null;
    return (
      <Image
        src={currentUrl}
        alt={researcherName}
        width={200}
        height={200}
        className="rounded-md object-cover w-36 h-36 md:w-48 md:h-48 mt-8"
      />
    );
  }

  // Admin: clickable photo or placeholder
  return (
    <div className="mt-8">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif"
        onChange={handleFileChange}
        className="hidden"
      />
      {currentUrl ? (
        <div
          className="relative cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image
            src={currentUrl}
            alt={researcherName}
            width={200}
            height={200}
            className="rounded-md object-cover w-36 h-36 md:w-48 md:h-48"
          />
          <div className="absolute inset-0 w-36 h-36 md:w-48 md:h-48 rounded-md bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-xs text-white">
              {isPending ? "Uploading..." : "Change photo"}
            </span>
          </div>
        </div>
      ) : (
        <div
          className="w-36 h-36 md:w-48 md:h-48 rounded-md border border-dashed border-border bg-surface/50 flex items-center justify-center cursor-pointer hover:border-text-muted transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="text-xs text-text-muted text-center px-4">
            {isPending ? "Uploading..." : "Click to upload photo"}
          </span>
        </div>
      )}
    </div>
  );
}
