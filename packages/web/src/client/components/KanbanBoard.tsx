import { useState } from 'preact/hooks';
import type { Ticket } from '../App';
import { TicketCard } from './TicketCard';

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
    <main aria-label='Kanban board'>
      <fieldset className='kanban' aria-label='Project columns'>
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
                <output className='empty-col' aria-label={`No tickets in ${column.title}`}>
                  No items
                </output>
              ) : (
                items.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} onUpdateStatus={onUpdateStatus} />
                ))
              )}
            </Column>
          );
        })}
      </fieldset>
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
      onDragOver={onDragOver as (e: DragEvent) => void}
      onDragLeave={onDragLeave as () => void}
      onDrop={onDrop as (e: DragEvent) => void}
      aria-labelledby={`column-${status}-title`}
      aria-describedby={`column-${status}-desc`}
    >
      <h2 id={`column-${status}-title`}>
        {title}
        <span className='count-badge' title={`${count} tickets`}>
          {count}
        </span>
      </h2>
      <p id={`column-${status}-desc`} className='sr-only'>
        {description}
      </p>
      <ul
        className='list'
        aria-label={`${title} tickets`}
        aria-live='polite'
        aria-relevant='additions removals'
      >
        {children}
      </ul>
    </section>
  );
}
