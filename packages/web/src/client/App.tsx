import type { ProjectConfig } from '@cmwen/min-pmt-core';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { TicketModal } from './components/TicketModal';
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
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [config, setConfig] = useState<ProjectConfig | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastMessage['type'] = 'info', duration?: number) => {
      const id = Date.now().toString();
      const toast: ToastMessage = { id, message, type, duration };
      setToasts((prev) => [...prev, toast]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Filter tickets based on search query and priority filter
  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(query) ||
          ticket.description?.toLowerCase().includes(query) ||
          ticket.id.toLowerCase().includes(query)
      );
    }

    // Apply priority filter
    if (priorityFilter) {
      filtered = filtered.filter((ticket) => ticket.priority === priorityFilter);
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

  const fetchConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/config');
      if (!response.ok) throw new Error('Failed to fetch config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching config:', error);
      // Config failure is not critical, use defaults
    }
  }, []);

  const addTicket = async (title: string, priority?: 'low' | 'medium' | 'high' | 'critical') => {
    try {
      // Include default description from template if available
      const description = config?.template?.content || '';

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          priority,
          description: description || undefined, // Only include if not empty
        }),
      });
      if (!response.ok) throw new Error('Failed to create ticket');

      const newTicket = await response.json();

      // Optimistically update the tickets list
      setTickets((prevTickets) => [...prevTickets, newTicket]);

      showToast(`Ticket "${title}" created successfully!`, 'success');
    } catch (error) {
      console.error('Error creating ticket:', error);
      showToast('Failed to create ticket. Please try again.', 'error');
      // On error, refresh to ensure consistency
      await fetchTickets();
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: Ticket['status']) => {
    try {
      // Optimistically update the ticket status
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, status: newStatus, updated: new Date().toISOString() }
            : ticket
        )
      );

      const response = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update ticket');

      showToast(`Ticket moved to ${newStatus.replace('-', ' ')}!`, 'success');
    } catch (error) {
      console.error('Error updating ticket:', error);
      showToast('Failed to update ticket. Please try again.', 'error');
      // On error, refresh to ensure consistency
      await fetchTickets();
    }
  };

  const viewTicket = useCallback((ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  }, []);

  const updateTicket = async (ticketId: string, fields: Partial<Ticket>) => {
    try {
      // Optimistically update the ticket
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, ...fields, updated: new Date().toISOString() }
            : ticket
        )
      );

      // Update the selected ticket for the modal
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket((prev) =>
          prev ? { ...prev, ...fields, updated: new Date().toISOString() } : null
        );
      }

      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!response.ok) throw new Error('Failed to update ticket');

      showToast('Ticket updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating ticket:', error);
      showToast('Failed to update ticket. Please try again.', 'error');
      // On error, refresh to ensure consistency
      await fetchTickets();
    }
  };

  const deleteTicket = async (ticketId: string) => {
    try {
      // Optimistically remove the ticket
      setTickets((prevTickets) => prevTickets.filter((ticket) => ticket.id !== ticketId));

      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete ticket');

      showToast('Ticket deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting ticket:', error);
      showToast('Failed to delete ticket. Please try again.', 'error');
      // On error, refresh to ensure consistency
      await fetchTickets();
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchTickets();
  }, [fetchConfig, fetchTickets]);

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
      <a href='#main-content' className='skip-link'>
        Skip to main content
      </a>
      <Header
        onCreateTicket={addTicket}
        priorityFilter={priorityFilter}
        onSetPriorityFilter={setPriorityFilter}
        searchQuery={searchQuery}
        onSetSearchQuery={setSearchQuery}
      />
      <div id='main-content'>
        <KanbanBoard
          tickets={filteredTickets}
          onUpdateStatus={updateTicketStatus}
          onViewTicket={viewTicket}
        />
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <TicketModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={closeModal}
        onUpdate={updateTicket}
        onDelete={deleteTicket}
      />
    </div>
  );
}
