# Draggable and Resizable Panels Implementation Guide

## Overview
This document describes the implementation of draggable and resizable panels in the WebRTC Data Center Monitor application, along with the standardized typography system.

## Features Implemented

### 1. Draggable Panels
Both the **Dashboard Control** and **Live Metrics** panels can now be dragged anywhere on the screen.

#### How to Drag:
- **Click and hold** on the drag handle (⋮⋮ icon) at the top of any panel
- **Move your mouse** to reposition the panel
- **Release** to place the panel in the new location
- Panels are **constrained to viewport** - they won't move off-screen

#### Visual Indicators:
- Drag handle shows `⋮⋮` icon in lime green
- Cursor changes to "move" when hovering over drag handle
- Background darkens slightly when actively dragging
- Panel z-index increases to 1001 during drag (appears on top)

### 2. Resizable Panels
Panels can be resized from any edge or corner using resize handles.

#### How to Resize:
- **Hover near edges** - 8px invisible zones on all sides
- **Hover near corners** - 12px zones for diagonal resizing
- **Click and drag** to resize the panel
- Cursor changes based on resize direction:
  - North/South edges: ↕ (ns-resize)
  - East/West edges: ↔ (ew-resize)
  - Corners: ↗↙ or ↖↘ (diagonal resize)

#### Size Constraints:

**Dashboard Control Panel:**
- Minimum: 250px width × 400px height
- Maximum: 500px width × 900px height
- Initial: 280px width × 600px height
- Position: Right side (20px from edge)

**Live Metrics Panel:**
- Minimum: 200px width × 400px height
- Maximum: 400px width × 900px height
- Initial: 240px width × 600px height
- Position: Left side (20px from edge)

#### Visual Feedback:
- Resize handles become visible on hover (subtle green highlight)
- Smooth transitions during resize
- Content reflows automatically
- Scrollbars appear when content exceeds panel size

### 3. Standardized Typography System

#### CSS Variables Defined:
```css
/* Font Sizes */
--font-size-xs: 11px;      /* Metric labels, small text */
--font-size-sm: 12px;      /* Value displays, secondary text */
--font-size-base: 14px;    /* Input labels, tab buttons, body text */
--font-size-md: 16px;      /* Section titles, headings */
--font-size-lg: 18px;      /* Large headings */
--font-size-xl: 24px;      /* Page titles */

/* Component Heights */
--button-height-sm: 28px;   /* Small buttons */
--button-height-base: 32px; /* Standard buttons, tabs, inputs */
--button-height-lg: 36px;   /* Large action buttons */
--input-height: 32px;       /* All input fields */

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-base: 12px;
--spacing-md: 16px;
--spacing-lg: 20px;
--spacing-xl: 24px;
```

#### Typography Application:

**Buttons:**
- All standard buttons: 32px height (var(--button-height-base))
- Consistent padding: 0 12px (0 var(--spacing-base))
- Font size: 14px (var(--font-size-base))
- Font weight: 500 (medium)

**Tab Buttons:**
- Height: 32px (standardized)
- Font size: 14px (increased from 13px)
- Padding: 0 12px
- Active tab: Bold (600), blue background, shadow

**Section Titles:**
- Font size: 16px (var(--font-size-md))
- Font weight: 600 (semibold)
- Margin bottom: 8px (var(--spacing-sm))
- Color: Lime green accent

**Input Labels:**
- Font size: 14px (var(--font-size-base))
- Color: White (primary text)

**Metric Cards:**
- Label: 11px (var(--font-size-xs))
- Value: 14px (var(--font-size-base))
- Bold weight: 700

**Spacing:**
- Between elements: 8px (var(--spacing-sm))
- Section padding: 12px (var(--spacing-base))
- Card margins: 12px (var(--spacing-base))

## Component Structure

### DraggableResizable Component
Located in: `/src/components/DraggableResizable.js`

#### Props:
```javascript
{
  initialX: number,        // Starting X position (default: 20)
  initialY: number,        // Starting Y position (default: 20)
  initialWidth: number,    // Starting width (default: 280)
  initialHeight: number,   // Starting height (default: 600)
  minWidth: number,        // Minimum width (default: 200)
  minHeight: number,       // Minimum height (default: 300)
  maxWidth: number,        // Maximum width (default: 600)
  maxHeight: number,       // Maximum height (default: 900)
  title: string,           // Panel title shown in drag handle
  onPositionChange: func,  // Optional callback for position updates
  children: node           // Panel content
}
```

#### State Management:
- `position`: Current {x, y} coordinates
- `size`: Current {width, height} dimensions
- `isDragging`: Boolean flag for drag state
- `isResizing`: Boolean flag for resize state
- `resizeDirection`: String indicating resize direction (n, s, e, w, ne, nw, se, sw)
- `dragStart`: Starting mouse position for calculations

#### Event Handlers:
- `handleMouseDown`: Initiates drag on drag handle click
- `handleMouseMove`: Updates position/size during drag/resize
- `handleMouseUp`: Finalizes drag/resize operation
- `handleResizeMouseDown`: Initiates resize from handle
- `handleResize`: Calculates new dimensions during resize

### CSS Structure
Located in: `/src/components/DraggableResizable.css`

#### Key Classes:
- `.draggable-resizable`: Main panel container
- `.drag-handle`: Draggable header bar
- `.panel-content`: Scrollable content area
- `.resize-handle`: Base class for all resize handles
- `.resize-n/s/e/w`: Edge resize handles
- `.resize-ne/nw/se/sw`: Corner resize handles

## Usage Examples

### Basic Usage:
```jsx
<DraggableResizable
  initialX={20}
  initialY={20}
  initialWidth={280}
  initialHeight={600}
  title="My Panel"
>
  <YourContentHere />
</DraggableResizable>
```

### With Custom Constraints:
```jsx
<DraggableResizable
  initialX={window.innerWidth - 320}
  initialY={20}
  initialWidth={300}
  initialHeight={500}
  minWidth={250}
  minHeight={400}
  maxWidth={500}
  maxHeight={800}
  title="Dashboard"
  onPositionChange={(pos) => console.log('New position:', pos)}
>
  <DashboardContent />
</DraggableResizable>
```

## Browser Compatibility
- ✅ Chrome/Edge (Chromium): Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support (requires -webkit- prefixes for backdrop-filter)
- ⚠️ IE11: Not supported (uses modern CSS features)

## Performance Considerations

### Optimizations Implemented:
1. **Event Listeners**: Added/removed dynamically only during drag/resize
2. **Transform vs Position**: Using `position: fixed` with `left/top` for compatibility
3. **Throttling**: Mouse move events processed on every frame (RAF could be added)
4. **Z-Index**: Temporarily elevated during interaction
5. **Backdrop Filter**: GPU-accelerated for smooth glassmorphism

### Future Improvements:
- [ ] Add requestAnimationFrame throttling for smoother large movements
- [ ] Implement snap-to-grid functionality
- [ ] Add panel docking zones
- [ ] Save panel positions to localStorage
- [ ] Add keyboard shortcuts for panel movement
- [ ] Implement multi-panel selection
- [ ] Add touch device support

## Styling Customization

### Changing Colors:
Edit variables in `/src/App.css`:
```css
:root {
  --accent-green: #86ef47;  /* Drag handle color */
  --bg-panel: #2d2d2d;      /* Panel background */
}
```

### Adjusting Glassmorphism:
In `.draggable-resizable` class:
```css
backdrop-filter: blur(40px) saturate(180%);  /* Adjust blur and saturation */
background: rgba(29, 29, 29, 0.85);          /* Adjust opacity */
```

### Modifying Resize Handle Size:
In `DraggableResizable.css`:
```css
.resize-n, .resize-s {
  height: 8px;  /* Change edge handle thickness */
}

.resize-ne, .resize-nw, .resize-se, .resize-sw {
  width: 12px;  /* Change corner handle size */
  height: 12px;
}
```

## Troubleshooting

### Panel Won't Drag:
- Ensure you're clicking on the drag handle (⋮⋮), not the content area
- Check browser console for JavaScript errors
- Verify mouse events aren't being blocked by other elements

### Resize Handles Not Working:
- Hover closer to the edge (8px zone)
- Check if panel is at min/max size constraints
- Ensure no CSS is overriding cursor styles

### Panel Appears Behind Content:
- Increase z-index in `.draggable-resizable` class
- Check for conflicting z-index values in other components

### Performance Issues:
- Reduce backdrop-filter blur amount
- Disable shadows during drag/resize
- Simplify panel content

## Testing

### Manual Test Checklist:
- [x] Drag Dashboard panel around screen
- [x] Drag Live Metrics panel around screen
- [x] Resize from all 8 handles
- [x] Verify min/max constraints
- [x] Check viewport boundary constraints
- [x] Test with minimized panels
- [x] Verify scrolling works in resized panels
- [x] Check typography consistency across all tabs
- [x] Test button sizes and spacing
- [x] Verify glassmorphism effects

## Keyboard Shortcuts (Future)
Currently none implemented. Planned shortcuts:
- `Ctrl+Arrow`: Move panel by 10px
- `Shift+Arrow`: Move panel by 1px
- `Alt+Arrow`: Resize panel
- `Esc`: Reset panel positions

## Accessibility Notes
- Drag handle has `title` attribute for tooltip
- Panels maintain semantic structure
- Color contrast meets WCAG AA standards
- Keyboard navigation to be added in future update

## Version History
- **v1.0.0** (Current): Initial implementation with drag, resize, and standardized typography
- Future versions will add localStorage persistence and keyboard controls
