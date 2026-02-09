import React, { useState } from 'react';

const GeometricalDesign = () => {
  const [geometry, setGeometry] = useState({
    serverHeight: 2.0,
    serverWidth: 0.6,
    serverDepth: 1.0,
    aisleWidth: 1.5,
    ceilingHeight: 3.0,
    rackCount: 20
  });

  const handleGeometryChange = (param, value) => {
    setGeometry(prev => ({ ...prev, [param]: parseFloat(value) }));
  };

  return (
    <div>
      <div className="section">
        <h2 className="section-title">Geometric Parameters</h2>
        
        <div className="input-row">
          <label className="input-label">Server Height [m]:</label>
          <div className="input-control">
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={geometry.serverHeight}
              onChange={(e) => handleGeometryChange('serverHeight', e.target.value)}
            />
            <span className="value-display">{geometry.serverHeight} m</span>
          </div>
        </div>

        <div className="input-row">
          <label className="input-label">Server Width [m]:</label>
          <div className="input-control">
            <input
              type="range"
              min="0.3"
              max="1.0"
              step="0.05"
              value={geometry.serverWidth}
              onChange={(e) => handleGeometryChange('serverWidth', e.target.value)}
            />
            <span className="value-display">{geometry.serverWidth} m</span>
          </div>
        </div>

        <div className="input-row">
          <label className="input-label">Server Depth [m]:</label>
          <div className="input-control">
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={geometry.serverDepth}
              onChange={(e) => handleGeometryChange('serverDepth', e.target.value)}
            />
            <span className="value-display">{geometry.serverDepth} m</span>
          </div>
        </div>

        <div className="input-row">
          <label className="input-label">Aisle Width [m]:</label>
          <div className="input-control">
            <input
              type="range"
              min="0.8"
              max="3.0"
              step="0.1"
              value={geometry.aisleWidth}
              onChange={(e) => handleGeometryChange('aisleWidth', e.target.value)}
            />
            <span className="value-display">{geometry.aisleWidth} m</span>
          </div>
        </div>

        <div className="input-row">
          <label className="input-label">Ceiling Height [m]:</label>
          <div className="input-control">
            <input
              type="range"
              min="2.5"
              max="5.0"
              step="0.1"
              value={geometry.ceilingHeight}
              onChange={(e) => handleGeometryChange('ceilingHeight', e.target.value)}
            />
            <span className="value-display">{geometry.ceilingHeight} m</span>
          </div>
        </div>

        <div className="input-row">
          <label className="input-label">Number of Racks:</label>
          <div className="input-control">
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={geometry.rackCount}
              onChange={(e) => handleGeometryChange('rackCount', e.target.value)}
            />
            <span className="value-display">{geometry.rackCount}</span>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Layout Configuration</h2>
        <div className="input-row">
          <label className="input-label">Rack Arrangement:</label>
          <select style={{ width: '300px' }}>
            <option>Hot Aisle / Cold Aisle</option>
            <option>Perimeter Cooling</option>
            <option>In-Row Cooling</option>
            <option>Overhead Cooling</option>
          </select>
        </div>
        
        <div className="input-row">
          <label className="input-label">Floor Type:</label>
          <select style={{ width: '300px' }}>
            <option>Raised Floor</option>
            <option>Slab Floor</option>
            <option>Hybrid</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default GeometricalDesign;
