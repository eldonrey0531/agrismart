import { Notification, NotificationType, NotificationPriority, INotification } from "../models/Notification";
import { User } from "../models";
import { WebSocketServer, WebSocket } from "ws";
import { EventEmitter } from "events";

interface WebSocketClient extends WebSocket {
  userId?: string;
  isAlive: boolean;
}

type NotificationCreate = Omit<INotification, "isRead" | "isArchived" | "createdAt" | "readAt">;

interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  data?: Record<string, any>;
}

class NotificationService {
  private static instance: NotificationService;
  private eventEmitter: EventEmitter;
  private wss: WebSocketServer | null;
  private clientConnections: Map<string, WebSocketClient[]>;
  private pingInterval: NodeJS.Timeout | null;
  private readonly SYSTEM_SENDER = 'system';

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.wss = null;
    this.clientConnections = new Map();
    this.pingInterval = null;

    // Listen for notification events
    this.eventEmitter.on('notification', this.handleNotification.bind(this));
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Public method for broadcasting system events
  public async broadcastEvent(event: {
    type: NotificationType;
    payload: any;
    userId?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const notificationData: NotificationData = {
      userId: event.userId || 'all',
      type: event.type,
      title: this.getNotificationTitle(event.type),
      message: this.getNotificationMessage(event.type, event.payload),
      priority: this.getNotificationPriority(event.type),
      data: {
        ...event.payload,
        ...event.metadata,
      },
    };

    await this.handleNotification(notificationData);
  }

  private getNotificationTitle(type: NotificationType): string {
    const titles: Record<NotificationType, string> = {
      seller_verification: "Seller Verification Update",
      order_status: "Order Status Update",
      chat_message: "New Message",
      product_interest: "Product Interest",
      system_alert: "System Alert",
      user_role_update: "Role Update",
      user_status_update: "Account Status Update",
      admin_action: "Admin Action",
      account_alert: "Account Alert",
      price_drop: "Price Drop Alert",
      back_in_stock: "Back in Stock",
      order_placed: "Order Placed",
      order_shipped: "Order Shipped",
      order_delivered: "Order Delivered",
      new_order: "New Order",
      order_cancelled: "Order Cancelled",
      product_review: "Product Review",
      stock_low: "Low Stock Alert",
      seller_verification_approved: "Seller Verification Approved",
      seller_verification_rejected: "Seller Verification Rejected",
    };
    return titles[type] || "Notification";
  }

  private getNotificationMessage(type: NotificationType, payload: any): string {
    switch (type) {
      case "user_role_update":
        return `Your account role has been updated to ${payload.newRole}`;
      case "user_status_update":
        return `Your account status has been changed to ${payload.status}${
          payload.reason ? `: ${payload.reason}` : ""
        }`;
      case "admin_action":
        return payload.message || "An admin action has been performed";
      case "account_alert":
        return payload.message || "Important account update";
      default:
        return payload.message || "You have a new notification";
    }
  }

  private getNotificationPriority(type: NotificationType): NotificationPriority {
    const priorities: Record<NotificationType, NotificationPriority> = {
      seller_verification: "high",
      order_status: "medium",
      chat_message: "medium",
      product_interest: "low",
      system_alert: "high",
      user_role_update: "high",
      user_status_update: "high",
      admin_action: "medium",
      account_alert: "high",
      price_drop: "medium",
      back_in_stock: "medium",
      order_placed: "high",
      order_shipped: "high",
      order_delivered: "high",
      new_order: "high",
      order_cancelled: "high",
      product_review: "medium",
      stock_low: "medium",
      seller_verification_approved: "high",
      seller_verification_rejected: "high",
    };
    return priorities[type] || "low";
  }

  public initializeWebSocket(wss: WebSocketServer): void {
    this.wss = wss;
    this.setupWebSocketHandlers();
    this.startHeartbeat();
  }

  private startHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      if (!this.wss) return;

      this.wss.clients.forEach((client) => {
        const ws = client as WebSocketClient;
        if (ws.isAlive === false) {
          if (ws.userId) {
            this.removeConnection(ws.userId, ws);
          }
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  private setupWebSocketHandlers(): void {
    if (!this.wss) return;

    this.wss.on('connection', (socket: WebSocket) => {
      const ws = socket as WebSocketClient;
      ws.isAlive = true;

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);
          if (data.type === 'auth' && data.userId) {
            ws.userId = data.userId;
            this.registerConnection(data.userId, ws);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        if (ws.userId) {
          this.removeConnection(ws.userId, ws);
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        if (ws.userId) {
          this.removeConnection(ws.userId, ws);
        }
      });
    });
  }

  private registerConnection(userId: string, ws: WebSocketClient): void {
    const connections = this.clientConnections.get(userId) || [];
    connections.push(ws);
    this.clientConnections.set(userId, connections);
  }

  private removeConnection(userId: string, ws: WebSocketClient): void {
    const connections = this.clientConnections.get(userId) || [];
    const index = connections.indexOf(ws);
    if (index > -1) {
      connections.splice(index, 1);
      if (connections.length === 0) {
        this.clientConnections.delete(userId);
      } else {
        this.clientConnections.set(userId, connections);
      }
    }
  }

  private async handleNotification(data: NotificationData): Promise<void> {
    try {
      const newNotification = await Notification.createNotification(data);

      this.sendToUser(data.userId, {
        type: 'notification',
        payload: newNotification,
      });

      const user = await User.findById(data.userId);
      if (user?.notificationPreferences?.email) {
        // Email notifications will be implemented later
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  }

  private sendToUser(userId: string, data: any): void {
    const connections = this.clientConnections.get(userId);
    if (connections) {
      const message = JSON.stringify(data);
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  }

  // Buyer Notifications
  public async notifyBuyerOrderStatus(
    buyerId: string,
    orderId: string,
    status: string,
    details?: Record<string, any>
  ): Promise<void> {
    this.eventEmitter.emit('notification', {
      userId: buyerId,
      type: status === "delivered" ? "order_delivered" :
            status === "shipped" ? "order_shipped" : "order_status",
      title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your order #${orderId} has been ${status}`,
      priority: "high",
      data: { orderId, status, ...details },
    } as NotificationData);
  }

  public async notifyPriceAlert(
    buyerId: string,
    productId: string,
    oldPrice: number,
    newPrice: number
  ): Promise<void> {
    this.eventEmitter.emit('notification', {
      userId: buyerId,
      type: "price_drop",
      title: "Price Drop Alert",
      message: `A product you're watching is now ${(oldPrice - newPrice).toFixed(2)} cheaper`,
      priority: "medium",
      data: { productId, oldPrice, newPrice },
    } as NotificationData);
  }

  // Seller Notifications
  public async notifySellerVerificationUpdate(
    sellerId: string,
    approved: boolean,
    reason?: string
  ): Promise<void> {
    this.eventEmitter.emit('notification', {
      userId: sellerId,
      type: approved ? "seller_verification_approved" : "seller_verification_rejected",
      title: approved ? "Seller Verification Approved" : "Seller Verification Rejected",
      message: approved ?
        "Your seller account has been approved! You can now list products." :
        `Your seller verification was rejected. ${reason ? `Reason: ${reason}` : ''}`,
      priority: "high",
      data: { approved, reason },
    } as NotificationData);
  }

  public async notifySellerStockAlert(
    sellerId: string,
    productId: string,
    currentStock: number,
    threshold: number
  ): Promise<void> {
    this.eventEmitter.emit('notification', {
      userId: sellerId,
      type: "stock_low",
      title: "Low Stock Alert",
      message: `Product stock is below ${threshold} units (Current: ${currentStock})`,
      priority: "medium",
      data: { productId, currentStock, threshold },
    } as NotificationData);
  }
}

export const notificationService = NotificationService.getInstance();
export default notificationService;