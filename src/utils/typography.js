export function noOrphan(text) {
  if (!text || typeof text !== "string") return text;
  const lastSpace = text.lastIndexOf(" ");
  if (lastSpace === -1) return text;
  return text.slice(0, lastSpace) + " " + text.slice(lastSpace + 1);
}
