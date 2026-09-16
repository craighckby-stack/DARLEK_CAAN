export const RAG_RETRIEVAL_ENABLED =
  (typeof process === "undefined" || process.env?.NEXT_PUBLIC_RAG_RETRIEVAL_ENABLED !== "false") &&
  !(typeof import.meta !== "undefined" && import.meta.env?.VITE_RAG_RETRIEVAL_ENABLED === "false");

export const AUTONOMOUS_HOTSWAP_ENABLED =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_AUTONOMOUS_HOTSWAP_ENABLED === "true") ||
  (typeof process !== "undefined" && process.env?.AUTONOMOUS_HOTSWAP_ENABLED === "true");
