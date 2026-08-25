export const PRIORITY = {
  LOW:    { label: 'Low',    color: 'go' },
  MEDIUM: { label: 'Medium', color: 'caution' },
  HIGH:   { label: 'High',   color: 'alert' },
};

export const STATUS = {
  OPEN:        { label: 'Open',        color: 'alert' },
  IN_PROGRESS: { label: 'In Progress', color: 'caution' },
  RESOLVED:    { label: 'Resolved',    color: 'go' },
  CLOSED:      { label: 'Closed',      color: 'ink' },
};

export const CATEGORY = {
  HARDWARE: { label: 'Hardware' },
  SOFTWARE: { label: 'Software' },
  NETWORK:  { label: 'Network' },
  OTHER:    { label: 'Other' },
};

export const TICKET_FILTERS = ['Open', 'In Progress', 'Resolved'];

export const getUserName = (user) => 
  user?.fullname ?? user?.full_name ?? user?.fullName ?? user?.name ?? user?.email ?? 'User';