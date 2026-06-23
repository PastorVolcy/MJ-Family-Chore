"use client";
import { useState } from "react";
export function CopyText({ label, text }: { label: string; text: string }) { const [copied, setCopied] = useState(false); return <div className="rounded-xl bg-stone-50 p-3"><p className="text-xs font-bold uppercase text-stone-500">{label}</p><p className="mt-1 text-sm">{text}</p><button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="mt-2 text-sm font-bold text-hibiscus" type="button">{copied ? "Copied!" : "Copy message"}</button></div>; }
