import { useState } from 'react';

const defaultDraft = {
  title: '',
  category: 'Hardware',
  priority: 'MEDIUM',
  description: '',
};

export default function TicketForm({ onSubmit, onCancel }) {
  const [draft, setDraft] = useState(defaultDraft);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.description.trim()) return;
    onSubmit?.({
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
    });
    setDraft(defaultDraft);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border-2 border-ink bg-paper p-4 shadow-brutal md:p-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70">
          New ticket
        </p>
        <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-ink">
          Create report
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/70">
            Title
          </span>
          <input
            name="title"
            value={draft.title}
            onChange={handleChange}
            type="text"
            placeholder="Masukkan judul masalah"
            className="w-full border-2 border-ink bg-paper px-3 py-3 font-sans text-sm text-ink outline-none placeholder:text-ink/40"
          />
        </label>

        <label className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/70">
            Category
          </span>
          <select
            name="category"
            value={draft.category}
            onChange={handleChange}
            className="w-full border-2 border-ink bg-paper px-3 py-3 font-sans text-sm text-ink outline-none"
          >
            <option>Hardware</option>
            <option>Software</option>
            <option>Network</option>
            <option>Other</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/70">
            Priority
          </span>
          <select
            name="priority"
            value={draft.priority}
            onChange={handleChange}
            className="w-full border-2 border-ink bg-paper px-3 py-3 font-sans text-sm text-ink outline-none"
          >
            <option>LOW</option>
            <option>MEDIUM</option>
            <option>HIGH</option>
          </select>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/70">
            Description
          </span>
          <textarea
            name="description"
            value={draft.description}
            onChange={handleChange}
            rows={6}
            placeholder="Jelaskan masalah yang sedang Anda alami..."
            className="w-full resize-none border-2 border-ink bg-paper px-3 py-3 font-sans text-sm text-ink outline-none placeholder:text-ink/40"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          className="cursor-pointer border-2 border-ink bg-go px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-paper shadow-brutal-sm transition-all duration-150 hover:-translate-y-1 hover:shadow-lg active:translate-y-0"
        >
          Submit ticket
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer border-2 border-ink bg-paper px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink transition-all duration-150 hover:-translate-y-1 hover:shadow-md active:translate-y-0"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
