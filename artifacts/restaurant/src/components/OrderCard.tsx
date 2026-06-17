import { formatCurrency, formatDate, statusColor, statusLabel } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

interface OrderCardProps {
  order: Order;
  actions?: { label: string; status: OrderStatus; variant?: "primary" | "success" | "danger" }[];
  onAction?: (orderId: string, status: OrderStatus) => void;
  showTimer?: boolean;
}

export default function OrderCard({ order, actions, onAction }: OrderCardProps) {
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
          <span className="text-xs text-muted-foreground capitalize">{order.type.replace("_", " ")}</span>
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
          <p>{order.deliveryAddress.pincode} · {order.customerPhone}</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>

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
