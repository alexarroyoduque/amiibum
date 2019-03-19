import { LitElement, html, css } from 'lit-element';

export class AmiiboItem extends LitElement {
  static get properties() {
    return { 
      amiibo: {
        converter: {
          fromAttribute(value) {
            return JSON.parse(value)
          }
        }
      }
    };
  }

  constructor() {
    super();
  }

  static get styles() {
    return css`
      .item {
        background-color: var(--amiibo-item-backgroun-color, gray);
        background-size: 72px 90px;
        background-repeat: no-repeat;
        background-position-x: 0.5rem;
        background-position-y: -0.2rem;
        color: var(--amiibo-item-color, white);
        height: 3.5rem;
        padding: 0 0 0 .5rem;
        box-shadow: inset 0px -2px 6px -4px #767676;
        
        position: relative;
      }

      h1 {
        font-size: 1rem;
        font-family: var(--amiibo-item-font-family);
        margin: 0.3rem 0 0 5rem;
        display: inline-block;
        max-width: 14rem;
      }

      input[type="checkbox"] {
        zoom: 2.5;
        position: absolute;
        left: calc(100% - 20px);
      }
    `;
  }

  checkedChanged(event) {
    this.dispatchEvent(new CustomEvent(`amiibo-checked-change`, {
      detail: {tail: this.amiibo.tail, checked: event.target.checked},
      bubbles: true, 
      composed: true
    }));
  }

  render() {
    // <div class="item" style="background-image: url('/Users/alejandroarroyo/Downloads/Usher.png')">
    return html`
      <div class="item" style="background-image: url(${this.amiibo.image})">
        <h1>${this.amiibo.name}</h1>
        <input type="checkbox" ?checked=${this.amiibo.checked} @change="${this.checkedChanged}">
      </div>
    `;
  }
}

customElements.define('amiibo-item', AmiiboItem);
