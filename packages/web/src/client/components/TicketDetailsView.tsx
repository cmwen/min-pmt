import type { Ticket } from '../App';

interface TicketDetailsViewProps {
  ticket: Ticket;
  formatDate: (dateString: string) => string;
}

export function TicketDetailsView({ ticket, formatDate }: TicketDetailsViewProps) {
  return (
    <div className='ticket-details'>
      <div className='field'>
        <h3>{ticket.title}</h3>
        <span className={`status-badge status-${ticket.status}`}>{ticket.status}</span>
      </div>

      {ticket.description && (
        <div className='field'>
          <h3>Description</h3>
          <div className='description-content'>
            {ticket.description.split('\n').map((line, index) => (
              <p key={`line-${index}-${line.slice(0, 10)}`}>{line}</p>
            ))}
          </div>
        </div>
      )}

      <div className='field-row'>
        {ticket.assignee && (
          <div className='field'>
            <h4>Assignee</h4>
            <p>{ticket.assignee}</p>
          </div>
        )}

        {ticket.priority && (
          <div className='field'>
            <h4>Priority</h4>
            <span className={`priority-badge priority-${ticket.priority}`}>{ticket.priority}</span>
          </div>
        )}
      </div>

      <div className='field-row'>
        {ticket.due && (
          <div className='field'>
            <h4>Due Date</h4>
            <p>{formatDate(ticket.due)}</p>
          </div>
        )}

        {ticket.labels && ticket.labels.length > 0 && (
          <div className='field'>
            <h4>Labels</h4>
            <div className='labels'>
              {ticket.labels.map((label) => (
                <span key={label} className='label-tag'>
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className='field timestamps'>
        <h4>Timestamps</h4>
        <div className='timestamp-row'>
          <span>Created: {formatDate(ticket.created)}</span>
          <span>Updated: {formatDate(ticket.updated)}</span>
        </div>
      </div>
    </div>
  );
}
