// Customer Types
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: string;
  value?: number;
  source?: string;
  avatar?: string;
  lastContact?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewCustomer {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: string;
  value?: number;
  source?: string;
  avatar?: string;
  lastContact?: string;
  assignedTo?: string;
}

// Deal Types
export interface Deal {
  id: number;
  title: string;
  customerId: number;
  customerName?: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  description?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewDeal {
  title: string;
  customerId: number;
  customerName?: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  description?: string;
  assignedTo?: string;
}

// Activity Types
export interface Activity {
  id: number;
  type: string;
  title: string;
  description?: string;
  customerId?: number;
  customerName?: string;
  dealId?: number;
  dealTitle?: string;
  dueDate?: string;
  completedAt?: string;
  status: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewActivity {
  type: string;
  title: string;
  description?: string;
  customerId?: number;
  customerName?: string;
  dealId?: number;
  dealTitle?: string;
  dueDate?: string;
  completedAt?: string;
  status: string;
  assignedTo?: string;
}

// Note Types
export interface Note {
  id: number;
  content: string;
  customerId?: number;
  dealId?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewNote {
  content: string;
  customerId?: number;
  dealId?: number;
  createdBy?: string;
}

// Team Member Types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  dealsCount: number;
  revenue: number;
  target: number;
  performance: number;
}

// Pipeline Stage Types
export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  deals: Deal[];
  totalValue: number;
}

// Chart Data Types
export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

// Metric Card Types
export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  period?: string;
  icon?: React.ReactNode;
  className?: string;
}

// Table Column Types
export interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

// Filter Types
export type CustomerStatus = 'prospect' | 'active' | 'inactive';
export type DealStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task' | 'deal-won' | 'deal-created';
export type ActivityStatus = 'pending' | 'completed' | 'cancelled';
export type CustomerSource = 'website' | 'referral' | 'cold-call' | 'email' | 'social-media';

// Calendar Event Types
export type EventCategory = 'meeting' | 'holiday' | 'conference' | 'birthday';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  category: EventCategory;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

