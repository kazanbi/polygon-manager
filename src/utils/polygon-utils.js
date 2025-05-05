export function createRandomPolygonPoints() {
    const vertexCount = Math.floor(Math.random() * 8) + 3;
    const points = [];
    const centerX = 50;
    const centerY = 50;
    const radius = 40;
    for (let i = 0; i < vertexCount; i++) {
        const angle = (i / vertexCount) * 2 * Math.PI;
        const vertexRadius = radius * (0.6 + Math.random() * 0.4);
        const x = centerX + vertexRadius * Math.cos(angle);
        const y = centerY + vertexRadius * Math.sin(angle);
        points.push(`${x},${y}`);
    }
    return points.join(' ');
}

export function createPolygonFromData(points) {
    const item = document.createElement('polygon-item');
    item.points = points;
    return item;
}
