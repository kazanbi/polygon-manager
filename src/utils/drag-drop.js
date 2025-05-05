// drag-drop.js: универсальный модуль для drag&drop логики PolygonManager
export function setupDragAndDrop(manager) {
    manager.setupDragAndDrop = function(element) {
        element.addEventListener('mousedown', (event) => {
            if (this.activeDragElement) return;
            this.activeDragElement = element;
            this.dragOrigin = element.closest('#work-zone-content') ? 'workzone' : 'buffer';
            const elementRect = element.getBoundingClientRect();
            this.dragOffsetX = event.clientX - elementRect.left;
            this.dragOffsetY = event.clientY - elementRect.top;
            this.dragStartMouseX = event.clientX;
            this.dragStartMouseY = event.clientY;
            this.isDraggingGlobal = false;

            if (this.dragOrigin === 'workzone') {
                const left = parseFloat(element.style.left || 0);
                const top = parseFloat(element.style.top || 0);
                this.dragStartLeft = left;
                this.dragStartTop = top;
                element.style.position = 'absolute';
                element.style.zIndex = '1000';
            } else {
                element.style.position = 'fixed';
                element.style.left = `${event.clientX - this.dragOffsetX}px`;
                element.style.top = `${event.clientY - this.dragOffsetY}px`;
                element.style.zIndex = '1000';
            }
            element.classList.add('dragging');
            event.preventDefault();
        });
    };

    manager.handleDragMove = function(event) {
        if (!this.activeDragElement) return;
        const element = this.activeDragElement;
        const workZone = this.shadow.getElementById('work-zone');
        const workZoneContent = this.shadow.getElementById('work-zone-content');
        const workZoneRect = workZone.getBoundingClientRect();

        const insideWorkZone =
            event.clientX >= workZoneRect.left &&
            event.clientX <= workZoneRect.right &&
            event.clientY >= workZoneRect.top &&
            event.clientY <= workZoneRect.bottom;

        if (this.dragOrigin === 'workzone' && insideWorkZone && this.isDraggingGlobal) {
            document.body.removeChild(element);
            workZoneContent.appendChild(element);
            element.style.position = 'absolute';
            element.style.zIndex = '1000';
            this.isDraggingGlobal = false;
        }

        if (this.dragOrigin === 'workzone' && insideWorkZone) {
            const dx = (event.clientX - this.dragStartMouseX) / this.workZoneScale;
            const dy = (event.clientY - this.dragStartMouseY) / this.workZoneScale;
            element.style.left = `${this.dragStartLeft + dx}px`;
            element.style.top = `${this.dragStartTop + dy}px`;
        } else {
            if (!this.isDraggingGlobal) {
                if (element.parentNode !== document.body) {
                    element.parentNode.removeChild(element);
                    document.body.appendChild(element);
                }
                this.isDraggingGlobal = true;
            }
            element.style.position = 'fixed';
            element.style.left = `${event.clientX - this.dragOffsetX}px`;
            element.style.top = `${event.clientY - this.dragOffsetY}px`;
            element.style.zIndex = '9999';
        }
    };

    manager.handleDragEnd = function(event) {
        if (!this.activeDragElement) return;
        const element = this.activeDragElement;
        element.classList.remove('dragging');
        const bufferZone = this.shadow.getElementById('buffer-zone');
        const workZone = this.shadow.getElementById('work-zone');
        const workZoneContent = this.shadow.getElementById('work-zone-content');
        const workZoneRect = workZone.getBoundingClientRect();
        const bufferZoneRect = bufferZone.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const elementCenterX = elementRect.left + elementRect.width / 2;
        const elementCenterY = elementRect.top + elementRect.height / 2;
        const isOverWorkZone =
            elementCenterX >= workZoneRect.left &&
            elementCenterX <= workZoneRect.right &&
            elementCenterY >= workZoneRect.top &&
            elementCenterY <= workZoneRect.bottom;
        const isOverBufferZone =
            elementCenterX >= bufferZoneRect.left &&
            elementCenterX <= bufferZoneRect.right &&
            elementCenterY >= bufferZoneRect.top &&
            elementCenterY <= bufferZoneRect.bottom;

        if (element.parentNode) element.parentNode.removeChild(element);

        if (isOverWorkZone) {
            workZoneContent.appendChild(element);
            element.style.position = 'absolute';
            element.style.zIndex = '';
            element.style.transform = '';
            const workZoneContentRect = workZoneContent.getBoundingClientRect();
            const relativeX = (event.clientX - workZoneContentRect.left) / this.workZoneScale - this.dragOffsetX / this.workZoneScale;
            const relativeY = (event.clientY - workZoneContentRect.top) / this.workZoneScale - this.dragOffsetY / this.workZoneScale;
            element.style.left = `${relativeX}px`;
            element.style.top = `${relativeY}px`;
        } else if (isOverBufferZone) {
            bufferZone.appendChild(element);
            element.style.position = '';
            element.style.left = '';
            element.style.top = '';
            element.style.zIndex = '';
            element.style.transform = '';
        } else {
            if (this.dragOrigin === 'workzone') {
                workZoneContent.appendChild(element);
                element.style.position = 'absolute';
                element.style.zIndex = '';
                element.style.transform = '';
                element.style.left = `${this.dragStartLeft}px`;
                element.style.top = `${this.dragStartTop}px`;
            } else {
                bufferZone.appendChild(element);
                element.style.position = '';
                element.style.left = '';
                element.style.top = '';
                element.style.zIndex = '';
                element.style.transform = '';
            }
        }
        this.activeDragElement = null;
        this.dragOrigin = null;
        this.isDraggingGlobal = false;
    };
}
