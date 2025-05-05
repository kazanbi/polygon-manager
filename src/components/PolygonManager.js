import './PolygonItem.js';
import { createRandomPolygonPoints, createPolygonFromData } from '../utils/polygon-utils.js';
import { savePolygonsToStorage, loadPolygonsFromStorage, clearPolygonsStorage } from '../utils/storage-utils.js';
import { renderXRuler, renderYRuler } from '../utils/grid-utils.js';
import { setupDragAndDrop } from '../utils/drag-drop.js';

class PolygonManager extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.workZoneScale = 1;
        this.workZoneTranslateX = 0;
        this.workZoneTranslateY = 0;
        this.isDragging = false;
        this.isPanning = false;
        this.isMovingInWorkzone = false;
        this.activeDragElement = null;
        this.initialYPositioning = undefined;
        this.maxPolygons = 12;
        this.dragStartMouseX = 0;
        this.dragStartMouseY = 0;
        this.isDraggingGlobal = false;
        setupDragAndDrop(this);
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.loadPolygons();
        setTimeout(() => {
            this.updateRulers();
        }, 50);
    }

    disconnectedCallback() {
        this.removeEventListeners();
    }

    setupEventListeners() {
        const createBtn = this.shadow.getElementById('create-button');
        createBtn.addEventListener('click', () => this.createPolygons());
        const saveBtn = this.shadow.getElementById('save-button');
        saveBtn.addEventListener('click', () => this.handleSave());
        const resetBtn = this.shadow.getElementById('reset-button');
        resetBtn.addEventListener('click', () => this.handleReset());
        const workZone = this.shadow.getElementById('work-zone');
        workZone.addEventListener('wheel', this.handleZoom.bind(this));
        workZone.addEventListener('mousedown', this.handlePanStart.bind(this));
        workZone.addEventListener('mousemove', this.handlePanMove.bind(this));
        workZone.addEventListener('mouseup', this.handlePanEnd.bind(this));
        workZone.addEventListener('mouseleave', this.handlePanEnd.bind(this));
        window.addEventListener('mouseup', this.handlePanEnd.bind(this));
        window.addEventListener('mousemove', this.handleDragMove.bind(this));
        window.addEventListener('mouseup', this.handleDragEnd.bind(this));
    }

    removeEventListeners() {
        const workZone = this.shadow.getElementById('work-zone');
        if (workZone) {
            workZone.removeEventListener('wheel', this.handleZoom.bind(this));
            workZone.removeEventListener('mousedown', this.handlePanStart.bind(this));
            workZone.removeEventListener('mousemove', this.handlePanMove.bind(this));
            workZone.removeEventListener('mouseup', this.handlePanEnd.bind(this));
            workZone.removeEventListener('mouseleave', this.handlePanEnd.bind(this));
        }
        window.removeEventListener('mouseup', this.handlePanEnd.bind(this));
        window.removeEventListener('mousemove', this.handleDragMove.bind(this));
        window.removeEventListener('mouseup', this.handleDragEnd.bind(this));
    }

    handleSave() {
        const bufferZone = this.shadow.getElementById('buffer-zone');
        const workZoneContent = this.shadow.getElementById('work-zone-content');
        savePolygonsToStorage(bufferZone, workZoneContent);
        alert('Полигоны сохранены');
    }

    handleReset() {
        clearPolygonsStorage();
        const bufferZone = this.shadow.getElementById('buffer-zone');
        const workZoneContent = this.shadow.getElementById('work-zone-content');
        bufferZone.innerHTML = '';
        workZoneContent.innerHTML = '';
        alert('Полигоны удалены');
    }

    loadPolygons() {
        const savedData = loadPolygonsFromStorage();
        if (!savedData) return;
        const bufferZone = this.shadow.getElementById('buffer-zone');
        const workZoneContent = this.shadow.getElementById('work-zone-content');
        savedData.bufferPolygons.forEach(polygonData => {
            const item = createPolygonFromData(polygonData.points);
            bufferZone.appendChild(item);
            this.setupDragAndDrop(item);
        });
        savedData.workPolygons.forEach(polygonData => {
            const item = createPolygonFromData(polygonData.points);
            item.style.position = 'absolute';
            item.style.left = polygonData.left;
            item.style.top = polygonData.top;
            workZoneContent.appendChild(item);
            this.setupDragAndDrop(item);
        });
    }

    handleZoom(event) {
        event.preventDefault();
        const delta = event.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.max(0.1, Math.min(5, this.workZoneScale + delta));
        const rect = this.shadow.getElementById('work-zone').getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        if (newScale !== this.workZoneScale) {
            const scaleRatio = newScale / this.workZoneScale;
            this.workZoneTranslateX = mouseX - (mouseX - this.workZoneTranslateX) * scaleRatio;
            this.workZoneTranslateY = mouseY - (mouseY - this.workZoneTranslateY) * scaleRatio;
            this.workZoneScale = newScale;
            this.updateWorkZoneTransform();
            this.updateRulers();
        }
    }

    handlePanStart(event) {
        if (event.button === 0 && !this.activeDragElement) {
            const target = event.target;
            if (target.closest('polygon-item') && target.closest('#work-zone-content')) {
                this.isMovingInWorkzone = true;
                this.activeDragElement = target.closest('polygon-item');
                const elementRect = this.activeDragElement.getBoundingClientRect();
                this.dragOffsetX = event.clientX - elementRect.left;
                this.dragOffsetY = event.clientY - elementRect.top;
                this.dragStartMouseX = event.clientX;
                this.dragStartMouseY = event.clientY;
                this.activeDragElement.classList.add('dragging');
                return;
            }
            this.isPanning = true;
            this.dragStartX = event.clientX;
            this.dragStartY = event.clientY;
            this.panStartTranslateX = this.workZoneTranslateX;
            this.panStartTranslateY = this.workZoneTranslateY;
            const workZone = this.shadow.getElementById('work-zone');
            workZone.style.cursor = 'grabbing';
        }
    }

    handlePanMove(event) {
        if (this.isPanning) {
            const dx = event.clientX - this.dragStartX;
            const dy = event.clientY - this.dragStartY;
            this.workZoneTranslateX = this.panStartTranslateX + dx;
            this.workZoneTranslateY = this.panStartTranslateY + dy;
            this.updateWorkZoneTransform();
            this.updateRulers();
        }
    }

    handlePanEnd() {
        if (this.isPanning) {
            this.isPanning = false;
            const workZone = this.shadow.getElementById('work-zone');
            workZone.style.cursor = 'grab';
        }
    }

    updateWorkZoneTransform() {
        const workContent = this.shadow.getElementById('work-zone-content');
        workContent.style.transform = `translate(${this.workZoneTranslateX}px, ${this.workZoneTranslateY}px) scale(${this.workZoneScale})`;
        this.updateGridSize();
    }

    updateGridSize() {
        const workZone = this.shadow.getElementById('work-zone');
        const cellSize = 50 * this.workZoneScale;
        workZone.style.backgroundSize = `${cellSize}px ${cellSize}px`;
        workZone.style.backgroundPosition = `${this.workZoneTranslateX}px ${this.workZoneTranslateY}px`;
    }

    updateRulers() {
        const workZone = this.shadow.getElementById('work-zone');
        const workZoneWidth = workZone.clientWidth;
        const workZoneHeight = workZone.clientHeight;
        const stepSize = 10;
        const pxPerUnit = 5;
        const xRuler = this.shadow.getElementById('x-ruler');
        renderXRuler(xRuler, this.workZoneTranslateX, this.workZoneScale, pxPerUnit, stepSize, workZoneWidth);
        const yRuler = this.shadow.getElementById('y-ruler');
        if (this.initialYPositioning === undefined) {
            this.initialYPositioning = true;
            this.workZoneTranslateY = 320;
            this.updateWorkZoneTransform();
        }
        renderYRuler(yRuler, this.workZoneTranslateY, this.workZoneScale, pxPerUnit, stepSize, workZoneHeight);
    }

    createPolygons() {
        const bufferZone = this.shadow.getElementById('buffer-zone');
        const currentPolygons = bufferZone.querySelectorAll('polygon-item').length;
        if (currentPolygons >= this.maxPolygons) {
            return;
        }
        const remainingSlots = this.maxPolygons - currentPolygons;
        const count = Math.min(remainingSlots, Math.floor(Math.random() * 8) + 5);
        for (let i = 0; i < count; i++) {
            const points = createRandomPolygonPoints();
            const item = createPolygonFromData(points);
            bufferZone.appendChild(item);
            this.setupDragAndDrop(item);
        }
    }

    render() {
        const styleLink = document.createElement('link');
        styleLink.setAttribute('rel', 'stylesheet');
        styleLink.setAttribute('href', new URL('../styles/polygon-manager.css', import.meta.url).href);
        this.shadow.innerHTML = '';
        this.shadow.appendChild(styleLink);
        const container = document.createElement('div');
        container.className = 'container';
        container.innerHTML = `
            <div class="controls">
                <div class="left-buttons">
                    <button id="create-button">Создать</button>
                </div>
                <div class="right-buttons">
                    <button id="save-button">Сохранить</button>
                    <button id="reset-button">Сбросить</button>
                </div>
            </div>
            <div class="spacer"></div>
            <div id="buffer-zone" class="buffer-zone"></div>
            <div class="spacer"></div>
            <div class="work-zone-container">
                <div id="y-ruler" class="y-ruler"></div>
                <div id="work-zone" class="work-zone">
                    <div id="work-zone-content" class="work-zone-content"></div>
                </div>
                <div id="x-ruler" class="x-ruler"></div>
            </div>
        `;
        this.shadow.appendChild(container);
        this.updateRulers();
        this.updateGridSize();
    }
}

customElements.define('polygon-manager', PolygonManager);
export default PolygonManager;
