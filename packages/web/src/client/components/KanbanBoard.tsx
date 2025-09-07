import type { Ticket } from '../App';
import { TicketCard } from './TicketCard';

interface KanbanBoardProps {
  tickets: Ticket[];
  onUpdateStatus: (ticketId: string, newStatus: Ticket['status']) => void;
}

export function KanbanBoard({ tickets, onUpdateStatus }: KanbanBoardProps) {
  const columns: { status: Ticket['status']; title: string }[] = [
    { status: 'todo', title: 'Todo' },
    { status: 'in-progress', title: 'In Progress' },
    { status: 'done', title: 'Done' },
  ];

  const getTicketsForStatus = (status: Ticket['status']) => {
    return tickets.filter((ticket) => ticket.status === status);
  };

  return (
    <main>
      <div className='kanban'>
        {columns.map((column) => (
          <div key={column.status} className='col' data-status={column.status}>
            <h2>{column.title}</h2>
            <div className='list'>
              {getTicketsForStatus(column.status).map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} onUpdateStatus={onUpdateStatus} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
