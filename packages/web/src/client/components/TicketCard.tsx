import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import type { Ticket } from '../App';

interface TicketCardProps {
  ticket: Ticket;
  onUpdateStatus: (ticketId: string, newStatus: Ticket['status']) => void;
}

export function TicketCard({ ticket, onUpdateStatus }: TicketCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(ticket.title);
  const [editDescription, setEditDescription] = useState(ticket.description || '');

  const handleClick = () => {
    if (isEditing) return; // Don't cycle status when editing
    
    const statuses: Ticket['status'][] = ['todo', 'in-progress', 'done'];
    const currentIndex = statuses.indexOf(ticket.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex];

    if (confirm(`Move "${ticket.title}" to ${newStatus}?`)) {
      onUpdateStatus(ticket.id, newStatus);
    }
  };

  const handleKeyDown = (e: JSX.TargetedKeyboardEvent<HTMLDivElement>) => {
    if (isEditing) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    } else if (e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      setIsEditing(true);
    }
  };

  const handleDoubleClick = (e: JSX.TargetedMouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // For now, we'll just update locally since the API doesn't support PATCH for title/description
      // In a real implementation, you'd want to add an API endpoint for this
      console.log('Would update ticket:', { id: ticket.id, title: editTitle, description: editDescription });
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
      <div className={`card card-editing ${priorityClass}`}>
        <div className="card-edit-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle((e.target as HTMLInputElement).value)}
            onKeyDown={handleEditKeyDown}
            className="card-edit-title"
            placeholder="Ticket title..."
            autoFocus
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription((e.target as HTMLTextAreaElement).value)}
            onKeyDown={handleEditKeyDown}
            className="card-edit-description"
            placeholder="Description (optional)..."
            rows={3}
          />
          <div className="card-edit-actions">
            <button onClick={handleSave} className="btn-save">
              Save (⌘+Enter)
            </button>
            <button onClick={handleCancel} className="btn-cancel">
              Cancel (Esc)
            </button>
          </div>
        </div>
        <p>
          #{formatId(ticket.id)}
        </p>
      </div>
    );
  }

  return (
    <button
      type='button'
      className={`card ${priorityClass}`}
      draggable
      onDragStart={onDragStart as unknown as any}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDblClick={handleDoubleClick as unknown as any}
      title="Click to move status, double-click to edit, or press 'e' to edit"
      role="listitem"
      aria-label={`Ticket: ${ticket.title}. Priority: ${ticket.priority || 'none'}. Status: ${ticket.status}. Press Enter to move to next status, E to edit.`}
    >
      <div className='card-header'>
        <h3>{ticket.title}</h3>
        {ticket.priority && <span className={`badge ${priorityClass}`}>{ticket.priority}</span>}
      </div>
      <p>
        #{formatId(ticket.id)}
      </p>
      {ticket.description && (
        <p className='desc'>
          {ticket.description}
        </p>
      )}
      <div className="card-hint">
        Double-click to edit
      </div>
    </button>
  );
}
