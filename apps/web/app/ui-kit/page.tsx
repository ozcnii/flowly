import type { Metadata } from "next";
import { UIKitClient } from "./ui-kit-client";

export const metadata: Metadata = { title: "UI Kit — Flowly", description: "Интерактивный production UI-kit Flowly" };

export default function UIKitPage() { return <UIKitClient />; }
