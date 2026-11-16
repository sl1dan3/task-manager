class BurgerMenu {
    selectors = {
        burgerButton: "[data-js-menu-toggle]",
        sidebar: "[data-js-sidebar]",
        menuCloseButton: "[data-js-menu-close]",
        menuBackdrop: "[data-js-menu-backdrop]",
    }

    stateClasses = {
        isOpen: "is-open",
        isScrollLocked: "is-scroll-locked",
    }

    desktopMedia = window.matchMedia('(width > 47.99875rem)');

    constructor() {
        this.bodyElement = document.body;
        this.burgerButtonElement = document.querySelector(this.selectors.burgerButton);
        this.sidebarElement = document.querySelector(this.selectors.sidebar);
        this.menuCloseButtonElement = document.querySelector(this.selectors.menuCloseButton);
        this.menuBackdropElement = document.querySelector(this.selectors.menuBackdrop);
        this.bindEvents();
    }

    get isSidebarOpen() {
        return this.sidebarElement.classList.contains(this.stateClasses.isOpen);
    }

    onBurgerButtonClick = () => {
        this.setMenuOpen(!this.isSidebarOpen)
    }

    setMenuOpen(isOpen) {
        this.sidebarElement.classList.toggle(
            this.stateClasses.isOpen,
            isOpen
        );
        this.bodyElement.classList.toggle(
            this.stateClasses.isScrollLocked,
            isOpen
        )

        this.burgerButtonElement.setAttribute("aria-expanded", String(isOpen));

        if (isOpen) {
            this.menuCloseButtonElement.focus();
        } else {
            this.burgerButtonElement.focus();
        }
    }

    onMenuCloseButtonClick = () => {
        this.setMenuOpen(!this.isSidebarOpen);
    }

    onMenuBackdropClick = () => {
        this.setMenuOpen(!this.isSidebarOpen);
    }

    onDocumentKeydown = (event) => {
        const { key } = event;

        if (!this.isSidebarOpen) return;

        if (key === 'Escape') {
            this.setMenuOpen(!this.isSidebarOpen);
        }
    }

    onViewportChange = (event) => {
        if (event.matches && this.isSidebarOpen) {
            this.setMenuOpen(false);
        }
    }

    bindEvents() {
        this.burgerButtonElement.addEventListener("click", this.onBurgerButtonClick);
        this.menuCloseButtonElement.addEventListener("click", this.onMenuCloseButtonClick);
        this.menuBackdropElement.addEventListener("click", this.onMenuBackdropClick);
        document.addEventListener("keydown", this.onDocumentKeydown);
        this.desktopMedia.addEventListener("change", this.onViewportChange);
    }
}

export default BurgerMenu;