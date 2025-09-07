async function fetchJSON(url, options) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function loadTickets() {
  const tickets = await fetchJSON('/api/tickets');
  const statuses = ['todo', 'in-progress', 'done'];
  for (const s of statuses) {
    const container = document.getElementById(s);
    container.innerHTML = '';
    tickets
      .filter((t) => t.status === s)
      .forEach((t) => {
        const card = document.createElement('div');
        card.className = 'card';
        const h3 = document.createElement('h3');
        h3.textContent = t.title;
        const p = document.createElement('p');
        p.textContent = `#${t.id} ${t.priority ? ` • ${t.priority}` : ''}`;
        card.appendChild(h3);
        card.appendChild(p);
        container.appendChild(card);
      });
  }
}

async function addTicket() {
  const title = prompt('Ticket title?');
  if (!title) return;
  await fetchJSON('/api/tickets', { method: 'POST', body: JSON.stringify({ title }) });
  await loadTickets();
}

document.getElementById('addBtn').addEventListener('click', addTicket);
loadTickets().catch(console.error);
