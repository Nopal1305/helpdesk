import Badge from '../ui/Badge';
import { PRIORITY } from '../lib/constants.js';

export default function PriorityBadge({ priority }) {
  const safePriority = String(priority ?? 'MEDIUM').toUpperCase();
  const { label, color } = PRIORITY[safePriority] ?? PRIORITY.MEDIUM;
  return <Badge color={color}>{label}</Badge>;
}