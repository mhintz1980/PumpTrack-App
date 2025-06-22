export async function schedulePump(
  pumpId: string,
  data: { start: string; end: string },
) {
  const res = await fetch(`/api/pumps/${pumpId}/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`Schedule API error: ${res.status} ${message}`);
  }

  return res.json();
}
