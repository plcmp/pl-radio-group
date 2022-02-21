import { PlElement, html, css } from "polylib";

import "@plcmp/pl-labeled-container";

class PlRadioGroup extends PlElement {
	static get properties() {
		return {
			label: { type: String },
			variant: { type: String },
			required: { type: Boolean, value: false, observer: '_requiredObserver' },
			disabled: { type: Boolean, reflectToAttribute: true },
			selected: { type: String, observer: '_selectedObserver' },
			invalid: { type: Boolean, value: false }
		}
	}

	static get css() {
		return css`
			:host([disabled]) {
				color: var(--grey-base);
				cursor: not-allowed;
				pointer-events: none;
				user-select: none;
			}

			.radio-container {
				display: flex;
				flex-direction: column;
				border: 1px solid var(--grey-light);
				width: var(--content-width, 200px);
				box-sizing: border-box;
				padding: 0px 8px;
				border-radius: 4px;
				position: relative;	
			}

			.radio-container::before {
				content: '';
				display: block;
				position: absolute;
				box-sizing: border-box;
				top: 0;
				left: 0;
			}

			.radio-container.required::before {
				border-top: 8px solid var(--attention-light);
				border-left: 8px  solid var(--attention-light);
				border-bottom: 8px solid transparent;
				border-right: 8px solid transparent;
			}
		`;
	}

	static get template() {
		return html`
			<pl-labeled-container label="[[label]]" variant$="[[variant]]">
				<slot name="label-prefix" slot="label-prefix"></slot>
				<div class="radio-container">
					<slot></slot>
				</div>
				<slot name="label-suffix" slot="label-suffix"></slot>
			</pl-labeled-container>
		`;
	}

	connectedCallback() {
		super.connectedCallback();
		this._radioButtons = this.root.querySelector('.radio-container slot').assignedElements();
        this._radioContainer = this.root.querySelector('.radio-container');

		this.addEventListener('radio-selected', (ev) => {
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