class Tabs {
  selectors = {
    button: '[data-js-task-filter]',
    count: '[data-js-task-filter-count]',
  };

  stateClasses = {
    isActive: 'is-active',
  };

  filters = {
    all: () => true,
    active: (task) => !task.completed,
    completed: (task) => task.completed,
  };

  constructor() {
    this.buttonElements = document.querySelectorAll(this.selectors.button);
    this.countElements = document.querySelectorAll(this.selectors.count);
    this.state = { activeFilter: 'all' };
    this.onChange = () => {};

    this.updateButtons();
    this.bindEvents();
  }

  filterTasks(tasks) {
    return tasks.filter(this.filters[this.state.activeFilter]);
  }

  updateCounts(tasks) {
    this.countElements.forEach((countElement) => {
      const filter = countElement.dataset.jsTaskFilterCount;
      countElement.textContent = tasks.filter(this.filters[filter]).length;
    });
  }

  updateButtons() {
    this.buttonElements.forEach((buttonElement) => {
      const isActive =
        buttonElement.dataset.jsTaskFilter === this.state.activeFilter;

      buttonElement.classList.toggle(this.stateClasses.isActive, isActive);
      buttonElement.setAttribute('aria-pressed', String(isActive));
    });
  }

  onButtonClick = (event) => {
    const filter = event.currentTarget.dataset.jsTaskFilter;

    if (filter === this.state.activeFilter) return;

    this.state.activeFilter = filter;
    this.updateButtons();
    this.onChange();
  };

  bindEvents() {
    this.buttonElements.forEach((buttonElement) => {
      buttonElement.addEventListener('click', this.onButtonClick);
    });
  }
}

export default Tabs;