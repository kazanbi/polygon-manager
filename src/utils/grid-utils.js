export function renderXRuler(xRuler, workZoneTranslateX, workZoneScale, pxPerUnit, stepSize, workZoneWidth) {
    xRuler.innerHTML = '';
    const startX = Math.floor(-workZoneTranslateX / (workZoneScale * pxPerUnit) / stepSize) * stepSize;
    const endX = Math.ceil((workZoneWidth - workZoneTranslateX) / (workZoneScale * pxPerUnit) / stepSize) * stepSize;
    for (let x = startX; x <= endX; x += stepSize) {
        const posX = x * workZoneScale * pxPerUnit + workZoneTranslateX;
        if (posX >= 0 && posX <= workZoneWidth) {
            const tick = document.createElement('div');
            tick.className = 'ruler-tick';
            tick.style.left = `${posX}px`;
            tick.style.top = '2px';
            tick.innerHTML = `<span>${x}</span>`;
            xRuler.appendChild(tick);
        }
    }
}

export function renderYRuler(yRuler, workZoneTranslateY, workZoneScale, pxPerUnit, stepSize, workZoneHeight) {
    yRuler.innerHTML = '';
    const startY = Math.floor(-workZoneTranslateY / (workZoneScale * pxPerUnit) / stepSize) * stepSize;
    const endY = Math.ceil((workZoneHeight - workZoneTranslateY) / (workZoneScale * pxPerUnit) / stepSize) * stepSize;
    for (let y = startY; y <= endY; y += stepSize) {
        const posY = y * workZoneScale * pxPerUnit + workZoneTranslateY;
        if (posY >= 0 && posY <= workZoneHeight) {
            const tick = document.createElement('div');
            tick.className = 'ruler-tick';
            tick.style.top = `${posY}px`;
            tick.innerHTML = `<span>${y * -1}</span>`;
            yRuler.appendChild(tick);
        }
    }
}
