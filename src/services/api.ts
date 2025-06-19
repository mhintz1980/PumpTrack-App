export async function schedulePump(id: string, data: { start: string; end: string }) {
  return fetch('/api/schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  }).then(res => res.json()).catch(() => null);
}
