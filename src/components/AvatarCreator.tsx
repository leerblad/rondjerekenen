"use client";

import { useEffect, useRef } from "react";

const RPM_URL = "https://demo.readyplayer.me/avatar?frameApi&clearCache";

export default function AvatarCreator({ onCreated }: { onCreated: (avatarUrl: string) => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // RPM sends JSON string
      let data;
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (data?.source !== "readyplayerme") return;
      if (data?.eventName === "v1.avatar.exported") {
        const url: string = data?.data?.url;
        if (url) onCreated(url);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onCreated]);

  return (
    <iframe
      ref={iframeRef}
      src={RPM_URL}
      className="h-full w-full rounded-2xl border-0"
      allow="camera *; microphone *; clipboard-write"
      title="Maak je avatar"
    />
  );
}
