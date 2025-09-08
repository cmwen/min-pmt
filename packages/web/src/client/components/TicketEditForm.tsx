import type { Ticket } from '../App';

interface TicketEditFormProps {
  editData: Partial<Ticket>;
  setEditData: (data: Partial<Ticket> | ((prev: Partial<Ticket>) => Partial<Ticket>)) => void;
  loading: boolean;
  parseLabels: (labelStr: string) => string[];
}

export function TicketEditForm({
  editData,
  setEditData,
  loading,
  parseLabels,
}: TicketEditFormProps) {
  return (
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
                priority: (e.target as HTMLSelectElement).value,
              }))
            }
            disabled={loading}
          >
            <option value=''>No Priority</option>
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
          <label htmlFor='edit-labels'>Labels (comma-separated)</label>
          <input
            id='edit-labels'
            type='text'
            value={editData.labels?.join(', ') || ''}
            onChange={(e) =>
              setEditData((prev) => ({
                ...prev,
                labels: parseLabels((e.target as HTMLInputElement).value),
              }))
            }
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}
