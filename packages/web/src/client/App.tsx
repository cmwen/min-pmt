import { useCallback, useEffect, useState, useMemo } from 'preact/hooks';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { ToastContainer, type ToastMessage } from './components/Toast';

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
  const [priorityFilter, setPriorityFilter] = useState<
    'low' | 'medium' | 'high' | 'critical' | undefined
  >(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info', duration?: number) => {
    const id = Date.now().toString();
    const toast: ToastMessage = { id, message, type, duration };
    setToasts(prev => [...prev, toast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Filter tickets based on search query and priority filter
  const filteredTickets = useMemo(() => {
    let filtered = tickets;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(ticket => 
        ticket.title.toLowerCase().includes(query) ||
        (ticket.description && ticket.description.toLowerCase().includes(query)) ||
        ticket.id.toLowerCase().includes(query)
      );
    }
    
    // Apply priority filter
    if (priorityFilter) {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }
    
    return filtered;
  }, [tickets, searchQuery, priorityFilter]);

  const fetchTickets = useCallback(async () => {
    try {
      // Fetch all tickets, we'll do filtering client-side now
      const response = await fetch('/api/tickets');
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      showToast('Failed to load tickets. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const addTicket = async (title: string, priority?: 'low' | 'medium' | 'high' | 'critical') => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, priority }),
      });
      if (!response.ok) throw new Error('Failed to create ticket');
      await fetchTickets(); // Refresh the list
      showToast(`Ticket "${title}" created successfully!`, 'success');
    } catch (error) {
      console.error('Error creating ticket:', error);
      showToast('Failed to create ticket. Please try again.', 'error');
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: Ticket['status']) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update ticket');
      await fetchTickets(); // Refresh the list
      showToast(`Ticket moved to ${newStatus.replace('-', ' ')}!`, 'success');
    } catch (error) {
      console.error('Error updating ticket:', error);
      showToast('Failed to update ticket. Please try again.', 'error');
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  if (loading) {
    return (
      <div>
        <Header
          onCreateTicket={addTicket}
          priorityFilter={priorityFilter}
          onSetPriorityFilter={setPriorityFilter}
          searchQuery={searchQuery}
          onSetSearchQuery={setSearchQuery}
        />
        <div className='loading'>Loading tickets...</div>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return (
    <div>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header
        onCreateTicket={addTicket}
        priorityFilter={priorityFilter}
        onSetPriorityFilter={setPriorityFilter}
        searchQuery={searchQuery}
        onSetSearchQuery={setSearchQuery}
      />
      <div id="main-content">
        <KanbanBoard tickets={filteredTickets} onUpdateStatus={updateTicketStatus} />
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
