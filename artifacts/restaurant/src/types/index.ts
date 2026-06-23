export type UserRole = "admin" | "manager" | "kitchen" | "delivery" | "customer";

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "cancelled";

export type OrderType = "dine_in" | "delivery";

export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  loyaltyStamps: number;
  rewardAvailable: boolean;
  totalOrders: number;
  totalSpent: number;
  savedAddresses?: Record<string, SavedAddress>;
  createdAt: string;
}

export interface SavedAddress {
  id: string;
  label: string; // e.g. "Home", "Office"
  name: string;
  phone: string;
  address: string;
  landmark: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: MenuCategory;
  available: boolean;
  featured: boolean;
  createdAt: string;
}

export type MenuCategory =
  | "Starters"
  | "Rolls"
  | "Chinese"
  | "Biryani"
  | "Main Course"
  | "Beverages"
  | "Desserts";

export const MENU_CATEGORIES: MenuCategory[] = [
  "Starters",
  "Rolls",
  "Chinese",
  "Biryani",
  "Main Course",
  "Beverages",
  "Desserts",
];

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface DeliveryAddress {
  name: string;
  phone: string;
  address: string;
  landmark: string;
  pincode: string;
  lat?: number;
  lng?: number;
  distanceKm?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryCharge: number;
  total: number;
  customerId: string;
  customerName: string;
  customerPhone: string;
  tableNumber?: string;
  deliveryAddress?: DeliveryAddress;
  deliveryBoyId?: string;
  paymentId?: string;
  transactionId?: string;
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod?: string;
  rewardApplied: boolean;
  notes?: string;
  reviewRating?: number;
  reviewComment?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantSettings {
  name: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
  tagline: string;
  setupComplete: boolean;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  smsgwUsername?: string;
  smsgwPassword?: string;
  smsgwApiKey?: string;
  smsgwDeviceId?: string;
  smsgwSenderId?: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPassword?: string;
}

export interface DeliveryZone {
  id: string;
  minKm: number;
  maxKm: number;
  charge: number;
  deliverable: boolean;
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  qrCode?: string;
}

export interface Reward {
  id: string;
  customerId: string;
  voucherName: string;
  used: boolean;
  createdAt: string;
  usedAt?: string;
}
