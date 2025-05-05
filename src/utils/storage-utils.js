const STORAGE_KEY = 'polygon-manager-data';

export function savePolygonsToStorage(bufferZone, workZoneContent) {
    const savedData = {
        bufferPolygons: [],
        workPolygons: []
    };
    bufferZone.querySelectorAll('polygon-item').forEach(item => {
        savedData.bufferPolygons.push({ points: item.points });
    });
    workZoneContent.querySelectorAll('polygon-item').forEach(item => {
        savedData.workPolygons.push({
            points: item.points,
            left: item.style.left,
            top: item.style.top
        });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
}

export function loadPolygonsFromStorage() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return null;
    return JSON.parse(savedData);
}

export function clearPolygonsStorage() {
    localStorage.removeItem(STORAGE_KEY);
}
