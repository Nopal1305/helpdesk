export const PRIORITY = {
  LOW:    { label: 'Low',    color: 'go' },
  MEDIUM: { label: 'Medium', color: 'caution' },
  HIGH:   { label: 'High',   color: 'alert' },
};

export const STATUS = {
  OPEN:        { label: 'Open',        color: 'alert' },
  IN_PROGRESS: { label: 'In Progress', color: 'caution' },
  PENDING:     { label: 'Pending',     color: 'caution' },
  'RE-OPENED': { label: 'Re-Opened',   color: 'alert' },
  RESOLVED:    { label: 'Resolved',    color: 'go' },
  CLOSED:      { label: 'Closed',      color: 'ink' },
  REJECTED:    { label: 'Rejected',    color: 'alert' },
  CANCELLED:   { label: 'Cancelled',   color: 'muted' },
};

// Status yang masih dapat dibatalkan oleh Pelapor (sesuai flowchart)
export const CANCELLABLE_STATUSES = ['OPEN', 'IN_PROGRESS'];

export const CATEGORY = {
  HARDWARE: { label: 'Hardware' },
  SOFTWARE: { label: 'Software' },
  NETWORK:  { label: 'Network' },
  OTHER:    { label: 'Other' },
};

export const DEPARTMENTS = [
  "COMDEV",
  "IT & COMMUNICATION",
  "HSE",
  "PRODUCTION",
  "MAINTENANCE",
  "SCM",
  "HR & ADMIN",
  "CLINIC",
  "SECURITY"
];

export const TICKET_FILTERS = ['Open', 'In Progress', 'Resolved'];

export const getUserName = (user) => 
  user?.fullname ?? user?.full_name ?? user?.fullName ?? user?.name ?? user?.email ?? 'User';