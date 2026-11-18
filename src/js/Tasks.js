class Tasks {
  selectors = {
    // Форма создания и редактирования
    root: '[data-js-todo-form]',
    modal: '[data-js-task-modal]',
    taskNameInput: '[data-js-task-input]',
    taskPriority: '[data-js-task-priority]',
    taskDeadline: '[data-js-task-deadline]',
    taskErrorMessage: '[data-js-task-error]',

    // Поиск(фильтрация)
    searchForm: "[data-js-search-form]",
    searchFormInput: "[data-js-search-input]",

    //Редактирование
    taskEditButton: "[data-js-task-edit]",
    editForm: '[data-js-edit-form]',
    editInput: '[data-js-edit-input]',
    editPriority: '[data-js-edit-priority]',
    editDeadline: '[data-js-edit-deadline]',
    editError: '[data-js-edit-error]',

    // Список
    taskTemplate: '[data-js-todo-template]',
    list: '[data-js-todo-list]',
    taskCounter: '[data-js-todo-count]',
    taskEmptyState: '[data-js-empty-state]',

    // Элементы внутри клонированной строки
    item: '[data-js-todo-item]',
    itemTitle: '[data-js-task-title]',
    itemCheckbox: '[data-js-task-toggle]',
    itemPriority: '[data-js-item-priority]',
    itemDeadline: '[data-js-item-deadline]',
    itemDueDate: '[data-js-item-due-date]',
    itemOverdue: '[data-js-item-overdue]',
    taskDeleteButton: '[data-js-task-delete]',
  };

  stateClasses = {
    isHidden: 'is-hidden',
    isCompleted: 'is-completed',
    isPriorityHigh: 'is-priority-high',
    isPriorityMedium: 'is-priority-medium',
    isPriorityLow: 'is-priority-low',
    isOverdue: 'is-overdue',
  };

  localStorageKey = 'todo-tasks';

  constructor(modalEdit) {
    const { selectors } = this;

    this.modalTaskEdit = modalEdit;

    this.rootElement = document.querySelector(selectors.root);
    this.modalElement = document.querySelector(selectors.modal);
    this.taskNameInputElement = this.rootElement.querySelector(selectors.taskNameInput);
    this.taskPriorityElement = this.rootElement.querySelector(selectors.taskPriority);
    this.taskDeadlineElement = this.rootElement.querySelector(selectors.taskDeadline);
    this.taskErrorMessageElement = this.rootElement.querySelector(selectors.taskErrorMessage);
    this.searchFormElement = document.querySelector(selectors.searchForm);
    this.searchFormInputElement = document.querySelector(selectors.searchFormInput);

    this.editFormElement = document.querySelector(selectors.editForm);
    this.editInputElement = this.editFormElement.querySelector(selectors.editInput);
    this.editPriorityElement = this.editFormElement.querySelector(selectors.editPriority);
    this.editDeadlineElement = this.editFormElement.querySelector(selectors.editDeadline);
    this.editErrorElement = this.editFormElement.querySelector(selectors.editError);
    this.editingTaskId = null;

    this.taskTemplateElement = document.querySelector(selectors.taskTemplate);
    this.listElement = document.querySelector(selectors.list);
    this.taskCounterElement = document.querySelector(selectors.taskCounter);
    this.taskEmptyStateElement = document.querySelector(selectors.taskEmptyState);

    this.state = {
      tasks: this.getTasksFromLocalStorage(),
      filteredTasks: null,
      searchQuery: "",
    };

    this.render();
    this.bindEvents();
  }

  getTasksFromLocalStorage() {
    try {
      const tasks = JSON.parse(
        localStorage.getItem(this.localStorageKey) ?? '[]',
      );

      if (!Array.isArray(tasks)) return [];

      return tasks.filter(
        (task) =>
          task !== null &&
          typeof task === 'object' &&
          typeof task.id === 'string' &&
          typeof task.title === 'string' &&
          typeof task.completed === 'boolean' &&
          typeof task.dueDate === 'string' &&
          ['none', 'low', 'medium', 'high'].includes(task.priority),
      );
    } catch (error) {
      console.error('Не удалось загрузить задачи', error);
      this.taskErrorMessageElement.textContent =
        'Не удалось загрузить сохранённые задачи.';
      return [];
    }
  }

  saveTasksToLocalStorage(tasks) {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(tasks));
      return true;
    } catch (error) {
      console.error('Не удалось сохранить задачи', error);
      window.alert(
        'Не удалось сохранить изменения. Проверьте доступ к хранилищу браузера.',
      );
      return false;
    }
  }

  getFilteredTasks() {
    const queryFormatted = this.state.searchQuery.trim().toLowerCase();

    return this.state.filteredTasks = this.state.tasks.filter(({title}) => {
      const titleFormatted = title.toLowerCase();

      return titleFormatted.includes(queryFormatted);
    })
  }

  resetFilter() {
    this.state.searchQuery = "";
    this.searchFormInputElement.value = '';
    this.render();
  }

  render() {
    const items = this.getFilteredTasks().map(task => this.createTaskElement(task));
    this.listElement.replaceChildren(...items);
    this.updateSummary();
  }

  createTaskElement(task) {
    const fragment = this.taskTemplateElement.content.cloneNode(true);
    const item = fragment.querySelector(this.selectors.item);
    const priorityElement = item.querySelector(this.selectors.itemPriority);
    const dueDateElement = item.querySelector(this.selectors.itemDueDate);
    const priorities = {
      none: { label: 'Без приоритета', className: null },
      low: { label: 'Низкий', className: this.stateClasses.isPriorityLow },
      medium: {
        label: 'Средний',
        className: this.stateClasses.isPriorityMedium,
      },
      high: { label: 'Высокий', className: this.stateClasses.isPriorityHigh },
    };
    const priority = priorities[task.priority];

    item.dataset.taskId = task.id;
    item.querySelector(this.selectors.itemTitle).textContent = task.title;
    priorityElement.textContent = priority.label;
    priorityElement.classList.remove(this.stateClasses.isHidden);

    if (priority.className) priorityElement.classList.add(priority.className);

    dueDateElement.textContent = task.dueDate;
    if (task.dueDate) dueDateElement.dateTime = task.dueDate;

    this.updateTaskState(item, task);
    return item;
  }

  updateTaskState(item, task) {
    item.querySelector(this.selectors.itemCheckbox).checked = task.completed;
    item.classList.toggle(this.stateClasses.isCompleted, task.completed);
    this.updateTaskOverdue(item, task);
  }

  updateTaskOverdue(item, task) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    const isOverdue = Boolean(
      task.dueDate && task.dueDate < today && !task.completed,
    );
    const deadline = item.querySelector(this.selectors.itemDeadline);
    const overdue = item.querySelector(this.selectors.itemOverdue);

    deadline.classList.toggle(this.stateClasses.isHidden, !task.dueDate);
    deadline.classList.toggle(this.stateClasses.isOverdue, isOverdue);
    overdue.classList.toggle(this.stateClasses.isHidden, !isOverdue);
  }

  updateSummary() {
    const tasksCount = this.state.filteredTasks.length;

    this.taskCounterElement.textContent = tasksCount;
    this.taskEmptyStateElement.classList.toggle(
        this.stateClasses.isHidden,
        tasksCount
    );
  }

  onFormSubmit = (event) => {
    event.preventDefault();
    const title = this.taskNameInputElement.value.trim();

    if (!title) {
      this.taskErrorMessageElement.textContent = 'Введите текст задачи';
      this.taskNameInputElement.setAttribute('aria-invalid', 'true');
      this.taskNameInputElement.focus();
      return;
    }

    const task = {
      id: crypto.randomUUID() ?? Date.now().toString(),
      title: title.trim(),
      priority: this.taskPriorityElement.value,
      dueDate: this.taskDeadlineElement.value,
      completed: false,
    };
    const tasks = [...this.state.tasks, task];

    // Меняем состояние и DOM после успешного сохранения.
    if (!this.saveTasksToLocalStorage(tasks)) return;

    this.state.tasks = tasks;
    this.render();

    this.taskErrorMessageElement.textContent = '';
    this.taskNameInputElement.removeAttribute('aria-invalid');
    this.rootElement.reset();
    this.modalElement.close();
  };

  deleteTask(id) {
      const tasks = this.state.tasks.filter(task => task.id !== id);

      if (!this.saveTasksToLocalStorage(tasks)) return;

      this.state.tasks = tasks;
      this.render();
  }

  toggleTaskCompleted(id, completed, item) {
      const task = this.state.tasks.find(task => task.id === id);
      if (!task) return;

      const updatedTask = { ...task, completed };
      const tasks = this.state.tasks.map(task =>
        task.id === id ? updatedTask : task
      );

      if (!this.saveTasksToLocalStorage(tasks)) {
          this.updateTaskState(item, task);
          return;
      }

      this.state.tasks = tasks;
      this.updateTaskState(item, updatedTask);
  }

  onTaskCheckboxChange = (event) => {
      const { target } = event;

      const checkboxElement = target.closest(this.selectors.itemCheckbox);

      if (!checkboxElement) return;

      const taskElement = checkboxElement.closest(this.selectors.item);
      this.toggleTaskCompleted(taskElement.dataset.taskId, checkboxElement.checked, taskElement);
  }

  onDeleteTaskButton = (event) => {
      const { target } = event;

      const deleteButtonElement = target.closest(this.selectors.taskDeleteButton);

      if (!deleteButtonElement) return;

      const taskElement = deleteButtonElement.closest(this.selectors.item);
      this.deleteTask(taskElement.dataset.taskId);
  }

  onSearchFormInputChange = (event) => {
    const { target } = event;

    const inputValue = target.value.trim();

    if (inputValue.length > 0) {
      this.state.searchQuery = inputValue;
      this.render();
    } else {
      this.resetFilter();
    }
  }

  onSearchFormSubmit = (event) => {
    event.preventDefault();
  }

  onTaskEditButtonClick = (event) => {
    const { target } = event;

    const taskEditButtonElement = target.closest(this.selectors.taskEditButton);
    if (!taskEditButtonElement) return;

    const taskElement = taskEditButtonElement.closest(this.selectors.item);

    const taskElementInfo = this.state.tasks.find(task =>
        task.id === taskElement.dataset.taskId);

    if (!taskElementInfo) return;

    this.editingTaskId = taskElementInfo.id;

    this.editInputElement.value = taskElementInfo.title;
    this.editPriorityElement.value = taskElementInfo.priority;
    this.editDeadlineElement.value = taskElementInfo.dueDate;

    this.editErrorElement.textContent = "";
    this.editInputElement.removeAttribute('aria-invalid');

    this.modalTaskEdit.open();
  }

  onEditFormSubmit = (event) => {
    event.preventDefault();

    const taskTitleFormatted = this.editInputElement.value.trim();

    if (taskTitleFormatted.length === 0) {
      this.editErrorElement.textContent = 'Название задачи не может быть пустым';
      this.editInputElement.setAttribute('aria-invalid', 'true');
      this.editInputElement.focus();

      return;
    }

    this.editErrorElement.textContent = '';
    this.editInputElement.removeAttribute('aria-invalid');

    const updatedTasks = this.state.tasks.map(task => {
      if (task.id !== this.editingTaskId) {
        return task;
      }

      return {
        ...task,
        title: taskTitleFormatted,
        priority: this.editPriorityElement.value,
        dueDate: this.editDeadlineElement.value,
      }
    })

    if (!this.saveTasksToLocalStorage(updatedTasks)) return;

    this.state.tasks = updatedTasks;

    this.render();

    this.modalTaskEdit.close();
  }

  onModalTaskEditClose = () => {
    this.editingTaskId = null;
  }

  bindEvents() {
    this.rootElement.addEventListener('submit', this.onFormSubmit);
    this.listElement.addEventListener('click', this.onDeleteTaskButton);
    this.listElement.addEventListener('change', this.onTaskCheckboxChange);
    this.searchFormElement.addEventListener('submit', this.onSearchFormSubmit);
    this.searchFormElement.addEventListener("reset", () => this.resetFilter());
    this.searchFormInputElement.addEventListener('input', this.onSearchFormInputChange);
    this.listElement.addEventListener("click", this.onTaskEditButtonClick);
    this.editFormElement.addEventListener('submit', this.onEditFormSubmit);
    this.modalTaskEdit.rootElement.addEventListener("close", this.onModalTaskEditClose);
  }
}

export default Tasks;