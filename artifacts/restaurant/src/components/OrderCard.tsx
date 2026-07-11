import { formatCurrency, formatDate, statusColor, statusLabel } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import type { Order, OrderStatus } from "@/types";

interface OrderCardProps {
  order: Order;
  actions?: { label: string; status: OrderStatus; variant?: "primary" | "success" | "danger" }[];
  onAction?: (orderId: string, status: OrderStatus) => void;
  showTimer?: boolean;
}

export default function OrderCard({ order, actions, onAction }: OrderCardProps) {
  const { isAdmin } = useAuth();

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-base text-foreground">{order.orderNumber}</p>
          <p className="text-sm text-muted-foreground">{order.customerName}</p>
          {order.tableNumber && <p className="text-xs text-muted-foreground">Table {order.tableNumber}</p>}
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor(order.status)}`}>
            {statusLabel(order.status)}
          </span>
          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
            order.type === 'delivery' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          } capitalize`}>
            {order.type.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-foreground">{item.menuItem.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
            <span className="text-foreground">{formatCurrency(item.menuItem.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-2 flex justify-between">
        <span className="text-sm font-semibold text-foreground">Total</span>
        <span className="font-bold text-primary">{formatCurrency(order.total)}</span>
      </div>

      {order.deliveryAddress && (
        <div className="bg-muted rounded-lg p-2 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{order.deliveryAddress.address}</p>
          {order.deliveryAddress.landmark && <p>{order.deliveryAddress.landmark}</p>}
          <p>
            {order.deliveryAddress.pincode}
            {isAdmin && <span className="ml-1 font-semibold text-primary">· Ph: {order.customerPhone}</span>}
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>

      {order.status === "preparing" && (
        <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl p-3 mt-2 border border-orange-200 dark:border-orange-900/30">
          <img 
            src="https://cdn.dribbble.com/userupload/22718398/file/original-39ca1912fbd9b91163d9b68cb0adca68.gif" 
            alt="Preparing..." 
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div>
            <p className="font-bold text-orange-700 dark:text-orange-400 text-sm">Chef is preparing your food!</p>
            <p className="text-xs text-orange-600/80 dark:text-orange-400/80 mt-0.5">Please wait while we cook it fresh.</p>
          </div>
        </div>
      )}

      {actions && actions.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {actions.map((a) => (
            <button
              key={a.status}
              onClick={() => onAction?.(order.id, a.status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                a.variant === "danger"
                  ? "bg-destructive text-destructive-foreground hover:opacity-90"
                  : a.variant === "success"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
