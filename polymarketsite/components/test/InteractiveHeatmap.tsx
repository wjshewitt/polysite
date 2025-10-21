"use client";

import { useEffect, useState } from "react";

interface Cell {
  x: number;
  y: number;
  value: number;
}

export function InteractiveHeatmap() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [hoveredCell, setHoveredCell] = useState<Cell | null>(null);
  const gridSize = 10;
  const cellSize = 40;

  useEffect(() => {
    // Initialize grid
    const initialCells: Cell[] = [];
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        initialCells.push({
          x,
          y,
          value: Math.random(),
        });
      }
    }
    setCells(initialCells);

    // Update values periodically
    const interval = setInterval(() => {
      setCells((prev) =>
        prev.map((cell) => ({
          ...cell,
          value: Math.max(0, Math.min(1, cell.value + (Math.random() - 0.5) * 0.2)),
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getColor = (value: number) => {
    // Create a gradient from dark to bright green
    const intensity = Math.floor(value * 255);
    return `rgb(${intensity * 0.3}, ${intensity}, ${intensity * 0.4})`;
  };

  const handleCellClick = (cell: Cell) => {
    setCells((prev) =>
      prev.map((c) =>
        c.x === cell.x && c.y === cell.y
          ? { ...c, value: Math.random() }
          : c
      )
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
      <div className="text-center">
        <p className="text-sm font-mono font-bold text-neutral">
          INTERACTIVE HEATMAP
        </p>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          Click cells to randomize • Auto-updating every 2s
        </p>
      </div>

      <div
        className="relative border border-border"
        style={{
          width: gridSize * cellSize,
          height: gridSize * cellSize,
        }}
      >
        <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
          {cells.map((cell, index) => (
            <div
              key={index}
              className="relative transition-all duration-300 cursor-pointer hover:opacity-80"
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: getColor(cell.value),
                border: "1px solid rgba(39, 39, 42, 0.5)",
              }}
              onClick={() => handleCellClick(cell)}
              onMouseEnter={() => setHoveredCell(cell)}
              onMouseLeave={() => setHoveredCell(null)}
            >
              {hoveredCell?.x === cell.x && hoveredCell?.y === cell.y && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-[10px] font-mono">
                  {(cell.value * 100).toFixed(0)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {hoveredCell && (
        <div className="text-xs font-mono text-muted-foreground">
          Position: ({hoveredCell.x}, {hoveredCell.y}) | Value:{" "}
          {(hoveredCell.value * 100).toFixed(1)}%
        </div>
      )}

      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-muted-foreground">Legend:</span>
        <div className="flex items-center gap-1">
          {[0, 0.25, 0.5, 0.75, 1].map((value) => (
            <div
              key={value}
              className="w-8 h-4 border border-border"
              style={{ backgroundColor: getColor(value) }}
            />
          ))}
        </div>
        <span className="text-muted-foreground">0% → 100%</span>
      </div>
    </div>
  );
}
