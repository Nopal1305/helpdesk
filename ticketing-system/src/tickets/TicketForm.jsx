import { useState } from 'react';

const defaultDraft = {
  title: '',
  category: 'Hardware',
  priority: 'MEDIUM',
  description: '',
};

export default function TicketForm({ onSubmit, onCancel }) {
  const [draft, setDraft] = useState(defaultDraft);

  const [imageBase64, setImageBase64] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageBase64('');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.description.trim()) return;
    onSubmit?.({
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      issue_image: imageBase64 || null
    });
    setDraft(defaultDraft);
    setImageBase64('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Field Judul */}
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">
            Issue Title
          </label>
          <input
            id="title"
            name="title"
            value={draft.title}
            onChange={handleChange}
            type="text"
            placeholder="e.g.: PC monitor is blank or SAP internet access is down"
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Field Kategori */}
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={draft.category}
            onChange={handleChange}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="Hardware">Hardware</option>
            <option value="Software">Software / Apps</option>
            <option value="Network">Network</option>
            <option value="Other">Other</option>
          </select>
          <div className="min-h-[2.5rem]">
            {draft.category === 'Hardware' && <p className="text-[11px] text-slate-500 leading-relaxed">Select this for physical equipment issues (e.g., broken monitors, printers, keyboards, or laptops).</p>}
            {draft.category === 'Software' && <p className="text-[11px] text-slate-500 leading-relaxed">Select this for application errors, software installation requests, or issues with SAP, emails, etc.</p>}
            {draft.category === 'Network' && <p className="text-[11px] text-slate-500 leading-relaxed">Select this if you are experiencing internet connectivity issues, Wi-Fi drops, LAN, or VPN problems.</p>}
            {draft.category === 'Other' && <p className="text-[11px] text-orange-700 font-medium leading-relaxed bg-orange-50 p-2 rounded-md border border-orange-200 mt-1">Since your issue falls outside standard categories, please provide as much detail as possible in the description below so our technicians can prepare the right tools.</p>}
          </div>
        </div>

        {/* Field Prioritas */}
        <div className="space-y-2">
          <label htmlFor="priority" className="block text-sm font-medium text-slate-700">
            Priority Level
          </label>
          <select
            id="priority"
            name="priority"
            value={draft.priority}
            onChange={handleChange}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="LOW">Low (Can wait)</option>
            <option value="MEDIUM">Medium (Interrupts work)</option>
            <option value="HIGH">High (System down / Critical)</option>
          </select>
        </div>

        {/* Field Deskripsi */}
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            Detailed Description
          </label>
          <textarea
            id="description"
            name="description"
            value={draft.description}
            onChange={handleChange}
            rows={6}
            placeholder="Explain the issue in detail, specific location, and error message (if any)..."
            className="block w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Field Foto (Opsional) */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            Issue Attachment (Optional)
          </label>
          <div className="flex flex-wrap items-start gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 border border-transparent transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              Choose from Gallery
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            <label className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 border border-transparent transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
              Open Camera
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {imageBase64 && (
              <button
                type="button"
                onClick={() => {
                  setImageBase64('');
                }}
                className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          {imageBase64 && (
            <div className="mt-3">
              <p className="mb-2 text-xs font-semibold text-slate-500">Preview:</p>
              <img src={imageBase64} alt="Attachment Preview" className="h-40 w-auto rounded-md border border-slate-200 object-cover" />
            </div>
          )}
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!draft.title.trim() || !draft.description.trim()}
          className="rounded-md bg-orange-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit Ticket
        </button>
      </div>
    </form>
  );
}