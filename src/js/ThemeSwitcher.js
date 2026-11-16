class ThemeSwitcher {
    selectors = {
        themeToggleButton: '[data-js-theme-toggle]',
        themeToggleButtonLabel: '[data-js-theme-label]',
    }

    themes = {
        dark: "dark",
        light: "light",
    }

    localStorageKey = "theme";

    constructor() {
        this.htmlElement = document.documentElement;
        this.themeToggleButtonElement = document.querySelector(this.selectors.themeToggleButton);
        this.themeToggleButtonLabelElement = this.themeToggleButtonElement.querySelector(
            this.selectors.themeToggleButtonLabel
        )
        this.systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
        this.setInitialTheme();
        this.updateButton();
        this.bindEvents();
    }

    get currentTheme() {
        return (
            this.htmlElement.dataset.theme ??
            (this.systemTheme.matches ? this.themes.dark : this.themes.light)
        )
    }

    setInitialTheme() {
        let savedTheme

        try {
            savedTheme = localStorage.getItem(this.localStorageKey);
        } catch (error) {
            console.error("Getting theme from localStorage error", error);
        }

        const isValidTheme =
            savedTheme === this.themes.dark ||
            savedTheme === this.themes.light

        this.htmlElement.dataset.theme = isValidTheme ? savedTheme :
            this.systemTheme.matches ? this.themes.dark : this.themes.light;
    }

    updateButton = () => {
        const isDarkTheme = this.currentTheme === this.themes.dark;

        this.themeToggleButtonLabelElement.textContent = isDarkTheme ? "Светлая тема" : "Тёмная тема";
        this.themeToggleButtonElement.setAttribute(
            "aria-label",
            isDarkTheme ? "Переключить на светлую тему" : "Переключить на тёмную тему"
        )

        if (isDarkTheme) {
            this.themeToggleButtonElement.setAttribute("aria-pressed", "true");
        } else {
            this.themeToggleButtonElement.setAttribute("aria-pressed", "false");
        }
    }

    onThemeToggleButtonClick = () => {
        const isDarkTheme = this.currentTheme === this.themes.dark;

        const nextTheme = isDarkTheme ? this.themes.light : this.themes.dark;
        this.htmlElement.dataset.theme = nextTheme;
        this.updateButton();

        try {
            localStorage.setItem(this.localStorageKey, nextTheme);
        } catch (error) {
            console.error("Set theme by button error", error);
        }
    }

    bindEvents() {
        this.themeToggleButtonElement.addEventListener("click", this.onThemeToggleButtonClick);
        // this.systemTheme.addEventListener("change", this.updateButton);
    }
}

export default ThemeSwitcher;