import { PlElement, html, css } from "polylib";

import "@plcmp/pl-labeled-container";

class PlRadioGroup extends PlElement {
	static properties = {
		label: { type: String },
		orientation: { type: String, reflectToAttribute: true },
		required: { type: Boolean, value: false, observer: '_requiredObserver' },
		disabled: { type: Boolean, reflectToAttribute: true },
		selected: { type: String, observer: '_selectedObserver' },
		invalid: { type: Boolean, value: false },
		readonly: { type: Boolean, reflectToAttribute: true },
		hidden: { type: Boolean, reflectToAttribute: true }
	}

	static css = css`
		:host{
			width: auto;
			--pl-content-width: auto;
		}

		:host([hidden]) {
			display:none;
		}

		:host([disabled]) {
			color: var(--pl-grey-base);
			cursor: not-allowed;
			user-select: none;
		}

		:host([disabled]) ::slotted(pl-radio[selected]){
			--pl-radio-border: var(--pl-grey-base);
			--pl-radio-background: var(--pl-grey-base);
		}

		:host([disabled]) .radio-container {
			pointer-events: none;
		}

		::slotted(pl-radio) {
			margin: 0 var(--pl-space-sm);
		}


		.radio-container ::slotted(pl-radio-button:first-child) {
			border-radius: var(--pl-border-radius) 0 0  var(--pl-border-radius);
			border-left: 1px solid var(--pl-grey-base);
		}

		.radio-container ::slotted(pl-radio-button:last-child) {
			border-radius: 0  var(--pl-border-radius)  var(--pl-border-radius) 0;
			border-right: 1px solid var(--pl-grey-base);
		}

		:host([readonly]) .radio-container {
			pointer-events: none;
		}

		.radio-container {
			display: flex;
			flex-direction: row;
			background: transparent;
			border: 1px solid transparent;
			position: relative;	
			overflow: hidden;
		}

		.radio-container::before {
			content: '';
			display: block;
			position: absolute;
			box-sizing: border-box;
			inset-block-start: 0;
			inset-inline-start: 0;
		}

		.radio-container.required::before {
			border-block-start: calc(var(--pl-space-md) / 2) solid var(--pl-attention);
			border-inline-start: calc(var(--pl-space-md) / 2)  solid var(--pl-attention);
			border-inline-end: calc(var(--pl-space-md) / 2) solid transparent;
			border-block-end: calc(var(--pl-space-md) / 2) solid transparent;
		}
	`;

	static template = html`
		<pl-labeled-container label="[[label]]" orientation="[[orientation]]">
			<slot name="label-prefix" slot="label-prefix"></slot>
			<div class="radio-container" id="container">
				<slot></slot>
			</div>
			<slot name="label-suffix" slot="label-suffix"></slot>
		</pl-labeled-container>
	`;

	connectedCallback() {
		super.connectedCallback();
		this._radioButtons = this.root.querySelector('.radio-container slot').assignedElements();

		this.addEventListener('radio-selected', (ev) => {
			if (this.readonly) {
				return;
			}
			this.selected = ev.detail.name;
		});
		this.validate();
	}

	_requiredObserver() {
		this.validate();
	}

	validate() {
		this.invalid = this.selected == undefined && this.required;
		if (this.invalid && !this.disabled) {
			this.$.container.classList.add('required');
		} else {
			this.$.container.classList.remove('required');
		}

		this.dispatchEvent(new CustomEvent('validation-changed', { bubbles: true, composed: true }))
	}

	_selectedObserver(val) {
		this._radioButtons = this.root.querySelector('.radio-container slot').assignedElements();
		this._radioButtons.forEach((el) => {
			el.selected = false;
		});

		let button = this._radioButtons.find(x => x.name == val);
		if (button) {
			button.selected = true;
		}

		this.validate();
	}
}

customElements.define('pl-radio-group', PlRadioGroup);