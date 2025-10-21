"use client";

import { useEffect, useState } from "react";

interface DataItem {
  id: string;
  type: string;
  value: number;
  timestamp: string;
  status: "success" | "warning" | "error";
}

export function DataStream() {
  const [items, setItems] = useState<DataItem[]>([]);

  useEffect(() => {
    const generateItem = (): DataItem => {
      const types = ["TRADE", "ORDER", "UPDATE", "CANCEL", "FILL"];
      const statuses: Array<"success" | "warning" | "error"> = ["success", "warning", "error"];

      return {
        id: Math.random().toString(36).substr(2, 9),
        type: types[Math.floor(Math.random() * types.length)],
        value: Math.random() * 1000,
        timestamp: new Date().toLocaleTimeString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
      };
    };

    // Add initial items
    const initialItems = Array.from({ length: 5 }, generateItem);
    setItems(initialItems);

    // Add new items periodically
    const interval = setInterval(() => {
      setItems((prev) => {
        const newItem = generateItem();
        return [newItem, ...prev.slice(0, 19)]; // Keep last 20 items
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-500 border-green-500/30";
      case "warning":
        return "text-yellow-500 border-yellow-500/30";
      case "error":
        return "text-red-500 border-red-500/30";
      default:
        return "text-muted-foreground border-border";
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      <div>
        <p className="text-sm font-mono font-bold text-neutral">
          LIVE DATA STREAM
        </p>
        <p className="text-xs font-mono text-muted-foreground">
          Simulated real-time event feed
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-[300px] max-h-[400px]">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`border p-3 transition-all duration-300 ${getStatusColor(item.status)}`}
            style={{
              animation: `slideIn 0.3s ease-out`,
              opacity: 1 - index * 0.05,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold">
                  {item.type}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {item.timestamp}
                </span>
              </div>
              <div className="text-sm font-mono font-bold">
                ${item.value.toFixed(2)}
              </div>
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
              ID: {item.id}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
        <span>Total Events: {items.length}</span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          LIVE
        </span>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
