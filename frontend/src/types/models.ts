export interface User {
  id: number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string | null;
  profile_picture?: string | null;
}

export interface Meter {
  id: number;
  name?: string;
  nickname?: string;
  meter_number?: string;
  active?: boolean;
  address?: string;
  current_balance?: number | string;
  last_top_up?: string;
  status?: string;
}

export interface Transaction {
  id: number;
  token?: string;
  amount?: number | string;
  kwh?: number | string;
  date?: string; // ISO string
  created_at?: string;
  meter?: string | { id?: number; name?: string; nickname?: string; meter_number?: string };
  units?: number | string;
  payment_method?: string;
  status?: string;
  transaction_id?: string;
  description?: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ManualRecharge {
  id: number;
  token_code?: string;
  masked_token?: string;
  meter?: Meter | { id?: number; nickname?: string; name?: string; meter_number?: string } | null;
  user?: number | null;
  units?: number | string | null;
  status?: 'pending' | 'success' | 'failed' | 'rejected';
  message?: string;
  created_at?: string;
  applied_at?: string | null;
}
