interface HeaderProps {
  onAddTicket: () => void;
}

export function Header({ onAddTicket }: HeaderProps) {
  return (
    <header>
      <h1>📋 min-pmt</h1>
      <button type='button' className='add-btn' onClick={onAddTicket}>
        + Add Ticket
      </button>
    </header>
  );
}
