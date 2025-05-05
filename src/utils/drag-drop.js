// drag-drop.js
export function setupDragAndDrop(manager) {
  manager.setupDragAndDrop = function (element) {
      element.setAttribute('draggable', 'true');

      element.addEventListener('dragstart', (e) => {
          manager.isDraggingGlobal = true;
          manager.activeDragElement = element;
          e.dataTransfer.setData('text/plain', '');
          setTimeout(() => element.classList.add('dragging'), 0);
      });

      element.addEventListener('dragend', () => {
          manager.isDraggingGlobal = false;
          if (element) element.classList.remove('dragging');
      });

      const workZone = manager.querySelector('#work-zone');
      const workZoneContent = manager.querySelector('#work-zone-content');

      workZone.addEventListener('dragover', (e) => {
          if (manager.isDraggingGlobal) {
              e.preventDefault();
          }
      });

      workZone.addEventListener('drop', (e) => {
          if (!manager.activeDragElement) return;
          const rect = workZone.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const scale = manager.workZoneScale;
          const translateX = manager.workZoneTranslateX;
          const translateY = manager.workZoneTranslateY;

          const adjustedX = (x - translateX) / scale;
          const adjustedY = (y - translateY) / scale;

          const droppedElement = manager.activeDragElement;
          droppedElement.style.position = 'absolute';
          droppedElement.style.left = `${adjustedX}px`;
          droppedElement.style.top = `${adjustedY}px`;

          workZoneContent.appendChild(droppedElement);
          droppedElement.classList.remove('dragging');

          manager.activeDragElement = null;
          manager.isDraggingGlobal = false;
      });
  };
}
