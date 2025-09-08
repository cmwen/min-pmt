import { useEffect, useRef, useState } from 'preact/hooks';
import type { Ticket } from '../App';

interface TicketModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (ticketId: string, fields: Partial<Ticket>) => Promise<void>;
  onDelete?: (ticketId: string) => Promise<void>;
}

export function TicketModal({ ticket, isOpen, onClose, onUpdate, onDelete }: TicketModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Ticket>>({});
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset editing state when modal opens/closes
  useEffect(() => {
    if (isOpen && ticket) {
      setEditData({
        title: ticket.title,
        description: ticket.description || '',
        priority: ticket.priority,
        assignee: ticket.assignee || '',
        due: ticket.due || '',
        labels: ticket.labels || [],
      });
      setIsEditing(false);
    }
  }, [isOpen, ticket]);

  // Handle escape key and outside clicks
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleSave = async () => {
    if (!ticket || !onUpdate) return;

    setLoading(true);
    try {
      await onUpdate(ticket.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!ticket || !onDelete) return;

    if (
      !confirm(`Are you sure you want to delete "${ticket.title}"? This action cannot be undone.`)
    ) {
      return;
    }

    setLoading(true);
    try {
      await onDelete(ticket.id);
      onClose();
    } catch (error) {
      console.error('Error deleting ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const parseLabels = (labelStr: string): string[] => {
    return labelStr
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  };

  if (!isOpen || !ticket) return null;

  return (
    <div className='modal-overlay'>
      <div className='modal-content' ref={modalRef}>
        <div className='modal-header'>
          <h2>{isEditing ? 'Edit Ticket' : 'Ticket Details'}</h2>
          <button type='button' className='modal-close' onClick={onClose} aria-label='Close modal'>
            ×
          </button>
        </div>

        <div className='modal-body'>
          {isEditing ? (
            <div className='edit-form'>
              <div className='field'>
                <label htmlFor='edit-title'>Title *</label>
                <input
                  id='edit-title'
                  type='text'
                  value={editData.title || ''}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      title: (e.target as HTMLInputElement).value,
                    }))
                  }
                  disabled={loading}
                />
              </div>

              <div className='field'>
                <label htmlFor='edit-description'>Description</label>
                <textarea
                  id='edit-description'
                  value={editData.description || ''}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      description: (e.target as HTMLTextAreaElement).value,
                    }))
                  }
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className='field-row'>
                <div className='field'>
                  <label htmlFor='edit-priority'>Priority</label>
                  <select
                    id='edit-priority'
                    value={editData.priority || ''}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        priority: (e.target as HTMLSelectElement).value as Ticket['priority'],
                      }))
                    }
                    disabled={loading}
                  >
                    <option value=''>None</option>
                    <option value='low'>Low</option>
                    <option value='medium'>Medium</option>
                    <option value='high'>High</option>
                    <option value='critical'>Critical</option>
                  </select>
                </div>

                <div className='field'>
                  <label htmlFor='edit-assignee'>Assignee</label>
                  <input
                    id='edit-assignee'
                    type='text'
                    value={editData.assignee || ''}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        assignee: (e.target as HTMLInputElement).value,
                      }))
                    }
                    disabled={loading}
                    placeholder='username or email'
                  />
                </div>
              </div>

              <div className='field-row'>
                <div className='field'>
                  <label htmlFor='edit-due'>Due Date</label>
                  <input
                    id='edit-due'
                    type='datetime-local'
                    value={editData.due ? new Date(editData.due).toISOString().slice(0, 16) : ''}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        due: (e.target as HTMLInputElement).value
                          ? new Date((e.target as HTMLInputElement).value).toISOString()
                          : '',
                      }))
                    }
                    disabled={loading}
                  />
                </div>

                <div className='field'>
                  <label htmlFor='edit-labels'>Labels</label>
                  <input
                    id='edit-labels'
                    type='text'
                    value={(editData.labels || []).join(', ')}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        labels: parseLabels((e.target as HTMLInputElement).value),
                      }))
                    }
                    disabled={loading}
                    placeholder='tag1, tag2, tag3'
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className='view-content'>
              <div className='ticket-meta'>
                <div className='meta-item'>
                  <strong>ID:</strong> {ticket.id}
                </div>
                <div className='meta-item'>
                  <strong>Status:</strong>
                  <span className={`status-badge status-${ticket.status}`}>
                    {ticket.status.replace('-', ' ')}
                  </span>
                </div>
                {ticket.priority && (
                  <div className='meta-item'>
                    <strong>Priority:</strong>
                    <span className={`priority-badge priority-${ticket.priority}`}>
                      {ticket.priority}
                    </span>
                  </div>
                )}
              </div>

              <div className='field'>
                <h3>Title</h3>
                <p>{ticket.title}</p>
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
                {ticket.due && (
                  <div className='field'>
                    <h4>Due Date</h4>
                    <p>{formatDate(ticket.due)}</p>
                  </div>
                )}
              </div>

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

              <div className='field timestamps'>
                <div className='timestamp'>
                  <strong>Created:</strong> {formatDate(ticket.created)}
                </div>
                <div className='timestamp'>
                  <strong>Updated:</strong> {formatDate(ticket.updated)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='modal-footer'>
          {isEditing ? (
            <>
              <button type='button' onClick={() => setIsEditing(false)} disabled={loading}>
                Cancel
              </button>
              <button type='button' onClick={handleSave} disabled={loading} className='btn-primary'>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button
                type='button'
                onClick={handleDelete}
                className='btn-danger'
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
              <button type='button' onClick={() => setIsEditing(true)} className='btn-secondary'>
                Edit
              </button>
              <button type='button' onClick={onClose} className='btn-primary'>
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
