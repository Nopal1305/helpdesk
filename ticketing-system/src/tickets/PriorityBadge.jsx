import { PRIORITY } from '../lib/constants.js';

export default function PriorityBadge({ priority }) {
  const safePriority = String(priority ?? 'MEDIUM').toUpperCase();
  const label = PRIORITY[safePriority]?.label ?? PRIORITY.MEDIUM.label;
  
  const styles = {
    LOW: 'bg-slate-100 text-slate-700 border-slate-200',
    MEDIUM: 'bg-purple-50 text-purple-700 border-purple-200',
    HIGH: 'bg-red-50 text-red-700 border-red-200',
  };
  
  const currentStyle = styles[safePriority] || styles.MEDIUM;

  return (
    <span className={`inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${currentStyle}`}>
      {label}
    </span>
  );
}