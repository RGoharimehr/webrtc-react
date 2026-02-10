import React, { useEffect, useRef, useState } from "react";
import "./DraggableResizable.css";

export default function DraggableResizable({
  title = "Panel",
  children,
  initialX = 40,
  initialY = 40,
  initialWidth = 320,
  initialHeight = 520,
  minWidth = 220,
  minHeight = 200,
  maxWidth = 900,
  maxHeight = 900,
  hideDefaultHeader = false,
  className = "",
  style = {},
}) {
  const panelRef = useRef(null);

  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });

  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
  });

  const resizeState = useRef({
    isResizing: false,
    dir: "",
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0,
    startLeft: 0,
    startTop: 0,
  });

  // keep in bounds (viewport)
  const clampToViewport = (x, y, w, h) => {
    const maxX = Math.max(0, window.innerWidth - w);
    const maxY = Math.max(0, window.innerHeight - h);
    return {
      x: Math.min(Math.max(0, x), maxX),
      y: Math.min(Math.max(0, y), maxY),
    };
  };

  // Drag start (only when clicking an element with class drag-handle)
  const onMouseDown = (e) => {
    const target = e.target;
    if (!target.closest(".drag-handle")) return;

    dragState.current.isDragging = true;
    dragState.current.startX = e.clientX;
    dragState.current.startY = e.clientY;
    dragState.current.startLeft = pos.x;
    dragState.current.startTop = pos.y;

    document.body.style.userSelect = "none";
  };

  // Resize start
  const onResizeDown = (dir) => (e) => {
    e.stopPropagation();
    resizeState.current.isResizing = true;
    resizeState.current.dir = dir;
    resizeState.current.startX = e.clientX;
    resizeState.current.startY = e.clientY;
    resizeState.current.startW = size.width;
    resizeState.current.startH = size.height;
    resizeState.current.startLeft = pos.x;
    resizeState.current.startTop = pos.y;

    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const onMove = (e) => {
      // Dragging
      if (dragState.current.isDragging) {
        const dx = e.clientX - dragState.current.startX;
        const dy = e.clientY - dragState.current.startY;

        const nextX = dragState.current.startLeft + dx;
        const nextY = dragState.current.startTop + dy;

        const clamped = clampToViewport(nextX, nextY, size.width, size.height);
        setPos(clamped);
      }

      // Resizing
      if (resizeState.current.isResizing) {
        const dx = e.clientX - resizeState.current.startX;
        const dy = e.clientY - resizeState.current.startY;

        let newW = resizeState.current.startW;
        let newH = resizeState.current.startH;
        let newX = resizeState.current.startLeft;
        let newY = resizeState.current.startTop;

        const dir = resizeState.current.dir;

        if (dir.includes("e")) newW = resizeState.current.startW + dx;
        if (dir.includes("s")) newH = resizeState.current.startH + dy;

        if (dir.includes("w")) {
          newW = resizeState.current.startW - dx;
          newX = resizeState.current.startLeft + dx;
        }

        if (dir.includes("n")) {
          newH = resizeState.current.startH - dy;
          newY = resizeState.current.startTop + dy;
        }

        newW = Math.min(Math.max(minWidth, newW), maxWidth);
        newH = Math.min(Math.max(minHeight, newH), maxHeight);

        const clamped = clampToViewport(newX, newY, newW, newH);
        setPos(clamped);
        setSize({ width: newW, height: newH });
      }
    };

    const onUp = () => {
      dragState.current.isDragging = false;
      resizeState.current.isResizing = false;
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [pos.x, pos.y, size.width, size.height, minWidth, minHeight, maxWidth, maxHeight]);

  return (
    <div
      ref={panelRef}
      className={`draggable-resizable ${className}`}
      style={{
        left: pos.x,
        top: pos.y,
        width: size.width,
        height: size.height,
        ...style, // ✅ FIXED (was ".style," in your file)
      }}
      onMouseDown={onMouseDown}
    >
      {!hideDefaultHeader && (
        <div className="drag-handle" title="Drag to move">
          <span className="drag-icon">⠿</span>
          <span className="panel-title">{title}</span>
        </div>
      )}

      <div className="panel-content">{children}</div>

      {/* resize handles */}
      <div className="resize-handle resize-n" onMouseDown={onResizeDown("n")} />
      <div className="resize-handle resize-s" onMouseDown={onResizeDown("s")} />
      <div className="resize-handle resize-e" onMouseDown={onResizeDown("e")} />
      <div className="resize-handle resize-w" onMouseDown={onResizeDown("w")} />
      <div className="resize-handle resize-ne" onMouseDown={onResizeDown("ne")} />
      <div className="resize-handle resize-nw" onMouseDown={onResizeDown("nw")} />
      <div className="resize-handle resize-se" onMouseDown={onResizeDown("se")} />
      <div className="resize-handle resize-sw" onMouseDown={onResizeDown("sw")} />
    </div>
  );
}
