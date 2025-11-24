export enum TableStatus {
  FREE = 'FREE',
  OCCUPIED = 'OCCUPIED',
  ORDERED = 'ORDERED', // Waiting for food
  PAYMENT = 'PAYMENT'
}

export type Category = string;

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: Category;
  description?: string;
  isOutOfStock?: boolean;
  searchTerms?: string[]; // Hidden keywords for search
}

export interface Menu {
  id: string;
  name: string;
  isActive: boolean;
  items: MenuItem[];
  categories: Category[];
}

export interface OrderItem extends MenuItem {
  uniqueId: string; // For identifying specific instance in cart
  notes?: string; // Optional field for special requests or remarks
  isUrgent?: boolean;
}

export interface PastOrder {
  id: string;
  items: OrderItem[];
  total: number;
  date: Date;
}

export interface Table {
  id: number;
  name: string;
  status: TableStatus;
  guests: number;
  currentOrder: OrderItem[];
  startTime?: Date;
  orderHistory: PastOrder[];
}

export interface AIRecommendation {
  itemIds: string[];
  reason: string;
}