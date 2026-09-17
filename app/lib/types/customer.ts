export interface Customer {
    id: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  createdAt: string; 
  avatarUrl: string | null
}

export interface CustomerFilters {
    page?: number;
    limit?: number;
}