import React, { useState, useRef, useEffect } from 'react';
import './DraggableResizable.css';

const DraggableResizable = ({ 
  children, 
  initialX = 20, 
  initialY = 20, 
  initialWidth = 280, 
  initialHeight = 600,
  minWidth = 200,
  minHeight = 300,
  maxWidth = 600,
  maxHeight = 900,
  title = "Panel",
  onPositionChange
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef(null);

  // Handle dragging
  const handleMouseDown = (e) => {
    if (e.target.classList.contains('drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Keep panel within viewport
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
      
      if (onPositionChange) {
        onPositionChange({ x: newX, y: newY });
      }
    }

    if (isResizing) {
      handleResize(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection('');
  };

  // Handle resizing
  const handleResizeMouseDown = (e, direction) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleResize = (e) => {
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    let newWidth = size.width;
    let newHeight = size.height;
    let newX = position.x;
    let newY = position.y;

    if (resizeDirection.includes('e')) {
      newWidth = Math.max(minWidth, Math.min(maxWidth, size.width + deltaX));
    }
    if (resizeDirection.includes('s')) {
      newHeight = Math.max(minHeight, Math.min(maxHeight, size.height + deltaY));
    }
    if (resizeDirection.includes('w')) {
      const widthDelta = Math.max(minWidth, Math.min(maxWidth, size.width - deltaX)) - size.width;
      newWidth = size.width - widthDelta;
      newX = position.x - widthDelta;
    }
    if (resizeDirection.includes('n')) {
      const heightDelta = Math.max(minHeight, Math.min(maxHeight, size.height - deltaY)) - size.height;
      newHeight = size.height - heightDelta;
      newY = position.y - heightDelta;
    }

    setSize({ width: newWidth, height: newHeight });
    setPosition({ x: newX, y: newY });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, isResizing, dragStart, position, size]);

  return (
    <div
      ref={panelRef}
      className="draggable-resizable"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: isDragging || isResizing ? 1001 : 1000,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="drag-handle" title="Drag to move">
        <span className="drag-icon">⋮⋮</span>
        <span className="panel-title">{title}</span>
      </div>
      
      <div className="panel-content" style={{ height: `calc(100% - 30px)`, overflow: 'auto' }}>
        {children}
      </div>

      {/* Resize handles */}
      <div className="resize-handle resize-n" onMouseDown={(e) => handleResizeMouseDown(e, 'n')} />
      <div className="resize-handle resize-s" onMouseDown={(e) => handleResizeMouseDown(e, 's')} />
      <div className="resize-handle resize-e" onMouseDown={(e) => handleResizeMouseDown(e, 'e')} />
      <div className="resize-handle resize-w" onMouseDown={(e) => handleResizeMouseDown(e, 'w')} />
      <div className="resize-handle resize-ne" onMouseDown={(e) => handleResizeMouseDown(e, 'ne')} />
      <div className="resize-handle resize-nw" onMouseDown={(e) => handleResizeMouseDown(e, 'nw')} />
      <div className="resize-handle resize-se" onMouseDown={(e) => handleResizeMouseDown(e, 'se')} />
      <div className="resize-handle resize-sw" onMouseDown={(e) => handleResizeMouseDown(e, 'sw')} />
    </div>
  );
};

export default DraggableResizable;
