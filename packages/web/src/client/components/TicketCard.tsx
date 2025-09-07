import type { Ticket } from '../App';

interface TicketCardProps {
  ticket: Ticket;
  onUpdateStatus: (ticketId: string, newStatus: Ticket['status']) => void;
}

export function TicketCard({ ticket, onUpdateStatus }: TicketCardProps) {
  const handleClick = () => {
    const statuses: Ticket['status'][] = ['todo', 'in-progress', 'done'];
    const currentIndex = statuses.indexOf(ticket.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex];

    if (confirm(`Move "${ticket.title}" to ${newStatus}?`)) {
      onUpdateStatus(ticket.id, newStatus);
    }
  };

  const formatId = (id: string) => {
    // Shorten the ID for display
    return id.length > 20 ? `${id.substring(0, 20)}...` : id;
  };

  return (
    <div className='card' onClick={handleClick}>
      <h3>{ticket.title}</h3>
      <p>
        #{formatId(ticket.id)}
        {ticket.priority ? ` • ${ticket.priority}` : ''}
      </p>
      {ticket.description && (
        <p style={{ fontSize: '11px', marginTop: '4px', fontStyle: 'italic' }}>
          {ticket.description}
        </p>
      )}
    </div>
  );
}
