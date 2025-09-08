import { useState } from 'preact/hooks';

type Priority = 'low' | 'medium' | 'high' | 'critical';

interface HeaderProps {
  onCreateTicket: (title: string, priority?: Priority) => void;
  priorityFilter?: Priority;
  onSetPriorityFilter: (p?: Priority) => void;
  searchQuery: string;
  onSetSearchQuery: (query: string) => void;
}

export function Header({ 
  onCreateTicket, 
  priorityFilter, 
  onSetPriorityFilter, 
  searchQuery, 
  onSetSearchQuery 
}: HeaderProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onCreateTicket(trimmed, priority);
    setTitle('');
    setPriority('medium');
  };

  return (
    <header role="banner">
      <h1>📋 min-pmt</h1>
      <div className='header-actions'>
        <form 
          className='add-form' 
          onSubmit={handleSubmit}
          role="form"
          aria-label="Create new ticket"
        >
          <input
            type='text'
            className='title-input'
            placeholder='Add a ticket...'
            value={title}
            onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
            aria-label="Ticket title"
            aria-required="true"
          />
          <select
            className='priority-select'
            value={priority}
            onChange={(e) => setPriority((e.target as HTMLSelectElement).value as Priority)}
            aria-label="Ticket priority"
          >
            <option value='low'>Low Priority</option>
            <option value='medium'>Medium Priority</option>
            <option value='high'>High Priority</option>
            <option value='critical'>Critical Priority</option>
          </select>
          <button 
            type='submit' 
            className='add-btn'
            aria-label="Create ticket"
            disabled={!title.trim()}
          >
            + Add
          </button>
        </form>
        
        <div className='search-form' role="search" aria-label="Search tickets">
          <input
            type='search'
            className='search-input'
            placeholder='Search tickets...'
            value={searchQuery}
            onInput={(e) => onSetSearchQuery((e.target as HTMLInputElement).value)}
            aria-label="Search tickets by title or description"
          />
          {searchQuery && (
            <button
              type='button'
              className='search-clear'
              onClick={() => onSetSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className='filters' role="group" aria-label="Filter options">
          <label className='filter-label' id="priority-filter-label">Priority</label>
          <select
            className='priority-filter'
            value={priorityFilter || ''}
            onChange={(e) =>
              onSetPriorityFilter(((e.target as HTMLSelectElement).value || undefined) as Priority | undefined)}
            aria-labelledby="priority-filter-label"
            aria-describedby="priority-filter-desc"
          >
            <option value=''>All priorities</option>
            <option value='low'>Low priority only</option>
            <option value='medium'>Medium priority only</option>
            <option value='high'>High priority only</option>
            <option value='critical'>Critical priority only</option>
          </select>
          <span id="priority-filter-desc" className="sr-only">
            Filter tickets by priority level
          </span>
        </div>
      </div>
    </header>
  );
}
