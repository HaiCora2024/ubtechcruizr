import { supabase } from "@/integrations/supabase/client";

type InvokeResult<T> = { data: T | null; error: Error | null };

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function invokeFunction<T = any>(fn: string, body?: unknown): Promise<InvokeResult<T>> {
  const backendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim();

  // If configured, call our own backend (Amvera) instead of Supabase Edge Functions.
  if (backendUrl) {
    const base = backendUrl.replace(/\/+$/, "");

    try {
      const res = await fetch(`${base}/functions/v1/${fn}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });

      const text = await res.text();
      const parsed = text ? safeJsonParse(text) : null;

      if (!res.ok) {
        const message =
          typeof parsed === "object" && parsed && "error" in (parsed as any)
            ? String((parsed as any).error)
            : `Request failed: ${res.status}`;
        return { data: null, error: new Error(message) };
      }

      return { data: (parsed as T) ?? null, error: null };
    } catch (e) {
      return { data: null, error: e as Error };
    }
  }

  const { data, error } = await supabase.functions.invoke(fn, { body });
  return { data: (data as T) ?? null, error: (error as any) ?? null };
}

