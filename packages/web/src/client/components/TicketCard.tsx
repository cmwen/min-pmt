import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import type { Ticket } from '../App';

interface TicketCardProps {
  ticket: Ticket;
  onUpdateStatus: (ticketId: string, newStatus: Ticket['status']) => void;
  onViewTicket: (ticket: Ticket) => void;
}

export function TicketCard({ ticket, onUpdateStatus, onViewTicket }: TicketCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(ticket.title);
  const [editDescription, setEditDescription] = useState(ticket.description || '');

  const handleClick = () => {
    if (isEditing) return; // Don't show modal when editing
    onViewTicket(ticket);
  };

  const handleKeyDown = (e: JSX.TargetedKeyboardEvent<HTMLButtonElement>) => {
    if (isEditing) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    } else if (e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      setIsEditing(true);
    } else if (e.key === 's' || e.key === 'S') {
      // Quick status change with 's' key
      e.preventDefault();
      const statuses: Ticket['status'][] = ['todo', 'in-progress', 'done'];
      const currentIndex = statuses.indexOf(ticket.status);
      const nextIndex = (currentIndex + 1) % statuses.length;
      const newStatus = statuses[nextIndex];
      if (confirm(`Move "${ticket.title}" to ${newStatus}?`)) {
        onUpdateStatus(ticket.id, newStatus);
      }
    }
  };

  const handleDoubleClick = (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // For now, we'll just update locally since the API doesn't support PATCH for title/description
      // In a real implementation, you'd want to add an API endpoint for this
      console.log('Would update ticket:', {
        id: ticket.id,
        title: editTitle,
        description: editDescription,
      });
      setIsEditing(false);
      // TODO: Actually save to backend when API is expanded
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleCancel = () => {
    setEditTitle(ticket.title);
    setEditDescription(ticket.description || '');
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const formatId = (id: string) => {
    // Shorten the ID for display
    return id.length > 20 ? `${id.substring(0, 20)}...` : id;
  };

  const onDragStart = (e: DragEvent) => {
    if (isEditing) {
      e.preventDefault();
      return;
    }
    e.dataTransfer?.setData('text/plain', ticket.id);
    e.dataTransfer?.setDragImage(new Image(), 0, 0);
  };

  const priorityClass = ticket.priority ? `priority-${ticket.priority}` : '';

  if (isEditing) {
    return (
      <li>
        <div className={`card card-editing ${priorityClass}`}>
          <div className='card-edit-form'>
            <input
              type='text'
              value={editTitle}
              onChange={(e) => setEditTitle((e.target as HTMLInputElement).value)}
              onKeyDown={handleEditKeyDown}
              className='card-edit-title'
              placeholder='Ticket title...'
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription((e.target as HTMLTextAreaElement).value)}
              onKeyDown={handleEditKeyDown}
              className='card-edit-description'
              placeholder='Description (optional)...'
              rows={3}
            />
            <div className='card-edit-actions'>
              <button type='button' onClick={handleSave} className='btn-save'>
                Save (⌘+Enter)
              </button>
              <button type='button' onClick={handleCancel} className='btn-cancel'>
                Cancel (Esc)
              </button>
            </div>
          </div>
          <p>#{formatId(ticket.id)}</p>
        </div>
      </li>
    );
  }

  return (
    <li>
      <button
        type='button'
        className={`card ${priorityClass}`}
        draggable
        onDragStart={onDragStart as (e: DragEvent) => void}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDblClick={handleDoubleClick as (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => void}
        title="Click to view details, double-click to edit, or press 'e' to edit, 's' to change status"
        aria-label={`Ticket: ${ticket.title}. Priority: ${ticket.priority || 'none'}. Status: ${ticket.status}. Press Enter to view details, E to edit, S to change status.`}
      >
        <div className='card-header'>
          <h3>{ticket.title}</h3>
          {ticket.priority && <span className={`badge ${priorityClass}`}>{ticket.priority}</span>}
        </div>
        <p>#{formatId(ticket.id)}</p>
        {ticket.description && <p className='desc'>{ticket.description}</p>}
        <div className='card-hint'>Click to view • Double-click to edit</div>
      </button>
    </li>
  );
}
