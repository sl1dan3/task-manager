class ModalTask {
    selectors = {
        modal: "[data-js-task-modal]",
        openModalButton: "[data-js-add-task]",
        closeModalButton: "[data-js-modal-close]",
        cancelModalFormButton: "[data-js-form-cancel]",
    }

    constructor () {
        this.modalElement = document.querySelector(this.selectors.modal);
        this.closeModalButtonElement = this.modalElement.querySelector(this.selectors.closeModalButton);
        this.cancelModalFormButtonElement = this.modalElement.querySelector(this.selectors.cancelModalFormButton);
        this.bindEvents();
    }

    onOpenModalButtonsClick = (event) => {
        const { target } = event;

        const openModalButtonElement = target.closest(this.selectors.openModalButton);

        if (!openModalButtonElement) {
            return;
        }

        this.modalElement.showModal();
    }

    onCloseModalButtonClick = (event) => {
        const { target } = event;

        const closeModalButtonElement = target.closest(this.selectors.closeModalButton);

        if (!closeModalButtonElement) {
            return;
        }

        this.modalElement.close();
    }

    onCancelModalFormButtonClick = () => {
        this.modalElement.close();
    }

    bindEvents() {
        document.addEventListener('click', this.onOpenModalButtonsClick);
        this.closeModalButtonElement.addEventListener("click", this.onCloseModalButtonClick);
        this.cancelModalFormButtonElement.addEventListener("click", this.onCancelModalFormButtonClick);

    }
}

export default ModalTask;