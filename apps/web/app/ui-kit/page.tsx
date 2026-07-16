import type { Metadata } from "next";
import { UIKitClient } from "./ui-kit-client";

export const metadata: Metadata = { title: "UI Kit — Flowly", description: "Approved Flowly-specific UI composites" };

export default function UIKitPage() { return <UIKitClient />; }
