/**
 * Generates smooth Bezier SVG paths for elevation profiles.
 * 
 * @param {Array} waypoints List of waypoints with distanceKm and elevationM
 * @param {number} width SVG coordinate width
 * @param {number} height SVG coordinate height
 * @param {number} padding Canvas padding to prevent lines touching container bounds
 * @returns {Object} { linePath: string, fillPath: string, points: Array }
 */
export function generateElevationPath(waypoints = [], width = 1000, height = 260, padding = 20) {
  if (!waypoints || waypoints.length === 0) {
    return { linePath: "", fillPath: "", points: [] };
  }

  // Sort waypoints by distance just in case they are out of order
  const sortedWaypoints = [...waypoints].sort((a, b) => a.distanceKm - b.distanceKm);

  const minDistance = sortedWaypoints[0].distanceKm;
  const maxDistance = sortedWaypoints[sortedWaypoints.length - 1].distanceKm;

  const elevations = sortedWaypoints.map((wp) => wp.elevationM);
  const minElevation = Math.min(...elevations);
  const maxElevation = Math.max(...elevations);

  // Helper to map distance to X pixel coordinate
  const getX = (dist) => {
    if (maxDistance === minDistance) {
      return width / 2; // Flat or single-point fallback
    }
    return padding + ((dist - minDistance) / (maxDistance - minDistance)) * (width - 2 * padding);
  };

  // Helper to map elevation to Y pixel coordinate (inverted for SVG coordinates)
  const getY = (elev) => {
    if (maxElevation === minElevation) {
      return height / 2; // Flat profile fallback
    }
    // High elevation = low Y coordinate (top of SVG), Low elevation = high Y (bottom of SVG)
    return height - padding - ((elev - minElevation) / (maxElevation - minElevation)) * (height - 2 * padding);
  };

  // Resolve pixel points
  const points = sortedWaypoints.map((wp) => ({
    x: getX(wp.distanceKm),
    y: getY(wp.elevationM),
    waypoint: wp,
  }));

  // Handle single waypoint edge case
  if (points.length === 1) {
    const p = points[0];
    return {
      linePath: `M ${p.x} ${p.y}`,
      fillPath: `M ${p.x} ${p.y} L ${p.x} ${height} Z`,
      points,
    };
  }

  // Generate smooth cubic bezier line path
  let linePath = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];

    // Compute cubic control points
    const cp1x = curr.x + (next.x - curr.x) / 3;
    const cp1y = curr.y;
    const cp2x = next.x - (next.x - curr.x) / 3;
    const cp2y = next.y;

    linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }

  // Formulate the filled shape path closed along the bottom edge of the canvas
  const startX = points[0].x;
  const endX = points[points.length - 1].x;
  const fillPath = `${linePath} L ${endX} ${height} L ${startX} ${height} Z`;

  return {
    linePath,
    fillPath,
    points,
  };
}
