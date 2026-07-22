"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Winkel() {
  const router = useRouter();
  useEffect(() => { router.replace("/leerling/portal"); }, [router]);
  return null;
}
