const tabs = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'health', icon: '📅💉', label: 'Diario' },
  { id: 'add', icon: '+', label: '', isAction: true },
  { id: 'cibi', icon: '🍝', label: 'Cibi' },
  { id: 'settings', icon: '⚙️', label: 'Impost.' },
];

export default function BottomNav({ activePage, setActivePage, onAdd }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-2xl items-end">
        {tabs.map((tab) => {
          if (tab.isAction) {
            return (
              <div key="add" className="flex flex-1 justify-center pb-1">
                <button
                  onClick={onAdd}
                  className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-3xl font-bold text-white shadow-lg active:scale-95 transition-transform"
                  aria-label="Aggiungi pasto"
                >
                  +
                </button>
              </div>
            );
          }
          const active = activePage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActivePage(tab.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 pb-3 pt-2 text-[11px] font-semibold transition-colors ${
                active ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
              {active && <span className="h-0.5 w-5 rounded-full bg-slate-900" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
