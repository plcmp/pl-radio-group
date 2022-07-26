import { PlElement, html, css } from "polylib";

import "@plcmp/pl-labeled-container";

class PlRadioGroup extends PlElement {
	static properties = {
		label: { type: String },
		variant: { type: String },
		orientation: { type: String },
		vertical: { type: Boolean, reflectToAttribute: true },
		required: { type: Boolean, value: false, observer: '_requiredObserver' },
		disabled: { type: Boolean, reflectToAttribute: true },
		selected: { type: String, observer: '_selectedObserver' },
		invalid: { type: Boolean, value: false },
		readonly: { type: Boolean, reflectToAttribute: true }
	}

	static css = css`
		:host([disabled]) {
			color: var(--grey-base);
			cursor: not-allowed;
			pointer-events: none;
			user-select: none;
		}

		:host([vertical]) .radio-container {
			flex-direction: column;
		}

		.radio-container ::slotted(pl-radio-button:first-child) {
			border-radius: 4px 0 0 4px;
			border-left: 1px solid var(--grey-base);
		}

		.radio-container ::slotted(pl-radio-button:last-child) {
			border-radius: 0 4px 4px 0;
			border-right: 1px solid var(--grey-base);
		}

		:host([readonly]) .radio-container {
			pointer-events: none;
		}

		.radio-container {
			display: flex;
			flex-direction: row;
			background: var(--background-color);
			border: 1px solid transparent;
			position: relative;	
			overflow: hidden;
		}

		.radio-container.required {
			border: 1px solid var(--grey-base);
			border-radius: var(--border-radius);
		}

		.radio-container.required ::slotted(pl-radio-button) {
			border-top: 1px solid transparent;
			border-bottom: 1px solid transparent;
		}

		.radio-container.required ::slotted(pl-radio-button:first-child) {
			border-left: 1px solid transparent;
		}

		.radio-container.required ::slotted(pl-radio-button:last-child) {
			border-right: 1px solid transparent;
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
			border-block-start: calc(var(--space-md) / 2) solid var(--attention);
			border-inline-start: calc(var(--space-md) / 2)  solid var(--attention);
			border-inline-end: calc(var(--space-md) / 2) solid transparent;
			border-block-end: calc(var(--space-md) / 2) solid transparent;
		}
	`;

	static template = html`
		<pl-labeled-container label="[[label]]" orientation="[[variant]]">
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
		this._radioContainer = this.$.container;

		if (this.variant) {
			console.log('Variant is deprecated, use orientation instead');
			this.orientation = this.variant;
		}


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
		this.invalid = !this.selected && this.required;
		if (this.invalid) {
			this._radioContainer.classList.add('required');
		} else {
			this._radioContainer.classList.remove('required');
		}

		this.dispatchEvent(new CustomEvent('validation-changed', { bubbles: true, composed: true }))
	}

	_selectedObserver(val) {
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