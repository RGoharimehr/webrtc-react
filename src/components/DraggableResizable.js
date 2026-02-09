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
  onPositionChange,
  hideDefaultHeader = false,
  showResizeHandles = true,
  className = "",
  style = {}
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef(null);

  const handleMouseDown = (e) => {
    // Drag starts when clicking anything that has class 'drag-handle'
    // (this allows YOU to decide what becomes the draggable header)
    const dragHandle = e.target.closest('.drag-handle');
    if (dragHandle) {
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

      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });

      if (onPositionChange) onPositionChange({ x: newX, y: newY });
    }

    if (isResizing) handleResize(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection('');
  };

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
      const maxAllowedWidth = window.innerWidth - position.x;
      newWidth = Math.max(minWidth, Math.min(maxWidth, Math.min(size.width + deltaX, maxAllowedWidth)));
    }

    if (resizeDirection.includes('s')) {
      const maxAllowedHeight = window.innerHeight - position.y;
      newHeight = Math.max(minHeight, Math.min(maxHeight, Math.min(size.height + deltaY, maxAllowedHeight)));
    }

    if (resizeDirection.includes('w')) {
      const potentialWidth = size.width - deltaX;
      const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, potentialWidth));
      const widthChange = size.width - constrainedWidth;

      const potentialX = position.x - widthChange;
      if (potentialX >= 0) {
        newWidth = constrainedWidth;
        newX = potentialX;
      }
    }

    if (resizeDirection.includes('n')) {
      const potentialHeight = size.height - deltaY;
      const constrainedHeight = Math.max(minHeight, Math.min(maxHeight, potentialHeight));
      const heightChange = size.height - constrainedHeight;

      const potentialY = position.y - heightChange;
      if (potentialY >= 0) {
        newHeight = constrainedHeight;
        newY = potentialY;
      }
    }

    const maxX = Math.max(0, window.innerWidth - newWidth);
    const maxY = Math.max(0, window.innerHeight - newHeight);

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

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

  const headerHeight = hideDefaultHeader ? 0 : 34;

  return (
    <div
      ref={panelRef}
      className={`draggable-resizable ${className}`}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: isDragging || isResizing ? 1001 : 1000,
        ...style
      }}
      onMouseDown={handleMouseDown}
    >
      {!hideDefaultHeader && (
        <div className="drag-handle" title="Drag to move">
          <span className="drag-icon">⋮⋮</span>
          <span className="panel-title">{title}</span>
        </div>
      )}

      <div
        className="panel-content"
        style={{
          height: hideDefaultHeader ? '100%' : `calc(100% - ${headerHeight}px)`,
          overflow: 'auto'
        }}
      >
        {children}
      </div>

      {showResizeHandles && (
        <>
          <div className="resize-handle resize-n" onMouseDown={(e) => handleResizeMouseDown(e, 'n')} />
          <div className="resize-handle resize-s" onMouseDown={(e) => handleResizeMouseDown(e, 's')} />
          <div className="resize-handle resize-e" onMouseDown={(e) => handleResizeMouseDown(e, 'e')} />
          <div className="resize-handle resize-w" onMouseDown={(e) => handleResizeMouseDown(e, 'w')} />
          <div className="resize-handle resize-ne" onMouseDown={(e) => handleResizeMouseDown(e, 'ne')} />
          <div className="resize-handle resize-nw" onMouseDown={(e) => handleResizeMouseDown(e, 'nw')} />
          <div className="resize-handle resize-se" onMouseDown={(e) => handleResizeMouseDown(e, 'se')} />
          <div className="resize-handle resize-sw" onMouseDown={(e) => handleResizeMouseDown(e, 'sw')} />
        </>
      )}
    </div>
  );
};

export default DraggableResizable;
