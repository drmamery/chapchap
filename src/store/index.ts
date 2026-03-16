import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Cart, CartItem, Notification } from '@/types';

// ============================================================
// Auth Store
// ============================================================

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'chapchap-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

// ============================================================
// Cart Store (persisté localement)
// ============================================================

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'user_id' | 'added_at'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  syncWithServer: (serverItems: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        const existing = state.items.find(i => 
          i.product_id === item.product_id && 
          JSON.stringify(i.attributes) === JSON.stringify(item.attributes)
        );
        
        if (existing) {
          return {
            items: state.items.map(i =>
              i.product_id === item.product_id
                ? { ...i, quantity: Math.min(i.quantity + (item.quantity || 1), 99) }
                : i
            ),
          };
        }
        
        return {
          items: [...state.items, {
            ...item,
            id: `local-${Date.now()}`,
            user_id: 'local',
            added_at: new Date().toISOString(),
          }],
        };
      }),
      
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(i => i.product_id !== productId),
      })),
      
      updateQuantity: (productId, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter(i => i.product_id !== productId) };
        }
        return {
          items: state.items.map(i =>
            i.product_id === productId ? { ...i, quantity: Math.min(quantity, 99) } : i
          ),
        };
      }),
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        return get().items.reduce((total, item) => {
          const price = (item.product as any)?.discounted_price || item.product?.price || 0;
          return total + price * item.quantity;
        }, 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      
      syncWithServer: (serverItems) => set({ items: serverItems }),
    }),
    {
      name: 'chapchap-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================
// Notifications Store
// ============================================================

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  
  setNotifications: (notifications) => set({
    notifications,
    unreadCount: notifications.filter(n => !n.is_read).length,
  }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications].slice(0, 50),
    unreadCount: state.unreadCount + (notification.is_read ? 0 : 1),
  })),
  
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n =>
      n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({
      ...n, is_read: true, read_at: new Date().toISOString()
    })),
    unreadCount: 0,
  })),
  
  removeNotification: (id) => set((state) => {
    const notif = state.notifications.find(n => n.id === id);
    return {
      notifications: state.notifications.filter(n => n.id !== id),
      unreadCount: notif && !notif.is_read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
    };
  }),
  
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
}));

// ============================================================
// UI Store (modal, drawer, etc.)
// ============================================================

interface UIState {
  cartOpen: boolean;
  searchOpen: boolean;
  mobileNavOpen: boolean;
  quickViewProduct: string | null;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setQuickViewProduct: (id: string | null) => void;
  toggleCart: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  searchOpen: false,
  mobileNavOpen: false,
  quickViewProduct: null,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setQuickViewProduct: (quickViewProduct) => set({ quickViewProduct }),
  toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen })),
}));
