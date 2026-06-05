import { EventEmitter } from "node:events";
import type { Order } from "../lib/types.js";

class OrderEventBus extends EventEmitter {
  emitUpdate(order: Order): void {
    this.emit("order:updated", order);
  }

  onUpdate(listener: (order: Order) => void): () => void {
    this.on("order:updated", listener);
    return () => this.off("order:updated", listener);
  }
}

export const orderEventBus = new OrderEventBus();
orderEventBus.setMaxListeners(0);
