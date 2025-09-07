import { useState, useEffect } from 'preact/hooks';
import { KanbanBoard } from './components/KanbanBoard';
import { Header } from './components/Header';

export interface Ticket {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority?: string;
  description?: string;
  labels?: string[];
  assignee?: string;
  due?: string;
  created: string;
  updated: string;
}

export function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTicket = async (title: string) => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (!response.ok) throw new Error('Failed to create ticket');
      await fetchTickets(); // Refresh the list
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket');
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: Ticket['status']) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update ticket');
      await fetchTickets(); // Refresh the list
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Failed to update ticket');
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleAddTicket = () => {
    const title = prompt('Ticket title?');
    if (title) {
      addTicket(title);
    }
  };

  if (loading) {
    return (
      <div>
        <Header onAddTicket={handleAddTicket} />
        <div className="loading">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div>
      <Header onAddTicket={handleAddTicket} />
      <KanbanBoard 
        tickets={tickets} 
        onUpdateStatus={updateTicketStatus}
      />
    </div>
  );
}