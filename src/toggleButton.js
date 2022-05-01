/* eslint-disable no-underscore-dangle */
const KEYCODE = {
  SPACE: 32,
};

const template = document.createElement('template');
template.innerHTML = `
    <style>
      :host {
        --mode-btn-color: Black;
        background-color: transparent;
        border-radius: 8px;
        border: 2px solid var(--mode-btn-color);
        cursor: pointer;
        display: block;
        flex-basis: 48px;
        flex-grow: 0;
        flex-shrink: 0;
        height: 20px;
        position: relative;
        width: 48px;
    }
    :host:after {
        background-color: var(--mode-btn-color);
        border-radius: 8px;
        content: '';
        height: 14px;
        left: 3px;
        position: absolute;
        top: 3px; 
        transition: all 300ms cubic-bezier(0.83, 0, 0.17, 1);
        width: 14px;
    }
    :host([aria-checked="true"]):after { left: 26px; }
    :host([disabled]) { --mode-btn-color: Grey; }
    :host([hidden]) { display: none; }
    </style>
  `;

export default class ToggleButton extends HTMLElement {
  static get observedAttributes() {
    return ['checked', 'disabled'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'checkbox');
    }
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', 0);
    }
    this.addEventListener('keyup', this.onKeyUp);
    this.addEventListener('click', this.onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('keyup', this.onKeyUp);
    this.removeEventListener('click', this.onClick);
  }

  set checked(value) {
    const isChecked = Boolean(value);
    if (isChecked) {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }
  }

  get checked() {
    return this.hasAttribute('checked');
  }

  set disabled(value) {
    const isDisabled = Boolean(value);
    if (isDisabled) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    const hasValue = newValue !== null;
    switch (name) {
      case 'checked':
        this.setAttribute('aria-checked', hasValue);
        break;
      case 'disabled':
        this.setAttribute('aria-disabled', hasValue);
        if (hasValue) {
          this.removeAttribute('tabindex');
          this.blur();
        } else {
          this.setAttribute('tabindex', '0');
        }
        break;
      default:
        break;
    }
  }

  onKeyUp(event) {
    if (event.altKey) {
      return;
    }
    switch (event.keyCode) {
      case KEYCODE.SPACE:
        event.preventDefault();
        this.toggleChecked();
        break;
      default:
    }
  }

  // eslint-disable-next-line no-unused-vars
  onClick(event) {
    this.toggleChecked();
    this.constructor.setMode();
  }

  toggleChecked() {
    if (this.disabled) {
      return;
    }
    this.checked = !this.checked;
    this.dispatchEvent(new CustomEvent('change', {
      detail: {
        checked: this.checked,
      },
      bubbles: true,
    }));
  }

  static setMode() {
    document.documentElement.classList.toggle('dark-mode');
    const mode = (document.documentElement.classList.contains('dark-mode'))
      ? 'dark'
      : 'light';
    localStorage.setItem('mode', mode);
  }
}
