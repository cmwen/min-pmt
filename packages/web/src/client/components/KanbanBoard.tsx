import type { Ticket } from '../App';
import { TicketCard } from './TicketCard';
import { useState } from 'preact/hooks';

interface KanbanBoardProps {
  tickets: Ticket[];
  onUpdateStatus: (ticketId: string, newStatus: Ticket['status']) => void;
}

export function KanbanBoard({ tickets, onUpdateStatus }: KanbanBoardProps) {
  const columns: { status: Ticket['status']; title: string; description: string }[] = [
    { status: 'todo', title: 'Todo', description: 'Tasks that need to be started' },
    { status: 'in-progress', title: 'In Progress', description: 'Tasks currently being worked on' },
    { status: 'done', title: 'Done', description: 'Completed tasks' },
  ];

  const getTicketsForStatus = (status: Ticket['status']) => {
    return tickets.filter((ticket) => ticket.status === status);
  };

  return (
    <main role="main" aria-label="Kanban board">
      <div className='kanban' role="group" aria-label="Project columns">
        {columns.map((column) => {
          const items = getTicketsForStatus(column.status);
          return (
            <Column
              key={column.status}
              title={column.title}
              description={column.description}
              status={column.status}
              count={items.length}
              onDropTicket={(id) => onUpdateStatus(id, column.status)}
            >
              {items.length === 0 ? (
                <div className='empty-col' role="status" aria-label={`No tickets in ${column.title}`}>
                  No items
                </div>
              ) : (
                items.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} onUpdateStatus={onUpdateStatus} />
                ))
              )}
            </Column>
          );
        })}
      </div>
    </main>
  );
}

interface ColumnProps {
  title: string;
  description: string;
  status: Ticket['status'];
  count: number;
  onDropTicket: (id: string) => void;
  children: preact.ComponentChildren;
}

function Column({ title, description, status, count, onDropTicket, children }: ColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };
  const onDragLeave = () => setIsOver(false);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const id = e.dataTransfer?.getData('text/plain');
    if (id) onDropTicket(id);
  };

  return (
    <section
      className={`col${isOver ? ' drag-over' : ''}`}
      data-status={status}
      onDragOver={onDragOver as unknown as any}
      onDragLeave={onDragLeave as unknown as any}
      onDrop={onDrop as unknown as any}
      role="region"
      aria-labelledby={`column-${status}-title`}
      aria-describedby={`column-${status}-desc`}
    >
      <h2 id={`column-${status}-title`}>
        {title}
        <span className='count-badge' aria-label={`${count} tickets`}>{count}</span>
      </h2>
      <p id={`column-${status}-desc`} className="sr-only">{description}</p>
      <div 
        className='list' 
        role="list" 
        aria-label={`${title} tickets`}
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {children}
      </div>
    </section>
  );
}
