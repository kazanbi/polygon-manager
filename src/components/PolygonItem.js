export default class PolygonItem extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['points'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'points') {
            this.render();
        }
    }

    set points(val) {
        this.setAttribute('points', val);
    }

    get points() {
        return this.getAttribute('points');
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <svg width="80" height="80" viewBox="0 0 100 100">
                <polygon points="${this.points || ''}" fill="#871929" stroke="none"/>
            </svg>
        `;
    }
}
customElements.define('polygon-item', PolygonItem);
