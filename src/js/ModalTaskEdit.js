class ModalTaskEdit {
    selectors = {
        root: "[data-js-edit-modal]",
        modalEditCloseButton: "[data-js-edit-close]",
        modalEditCancelButton: "[data-js-edit-cancel]",
    }

    constructor() {
        this.rootElement = document.querySelector(this.selectors.root);
        this.modalEditCloseButtonElement = this.rootElement.querySelector(
            this.selectors.modalEditCloseButton
        )
        this.modalEditCancelButtonElement = this.rootElement.querySelector(
            this.selectors.modalEditCancelButton
        )
        this.bindEvents();
    }

    open() {
        this.rootElement.showModal();
    }

    close = () => {
        this.rootElement.close();
    }

    bindEvents() {
        this.modalEditCloseButtonElement.addEventListener("click", this.close);
        this.modalEditCancelButtonElement.addEventListener("click", this.close);
    }
}

export default ModalTaskEdit;