class Tasks {
  selectors = {
    // Форма создания и редактирования
    root: '[data-js-todo-form]',
    modal: '[data-js-task-modal]',
    taskNameInput: '[data-js-task-input]',
    taskPriority: '[data-js-task-priority]',
    taskDeadline: '[data-js-task-deadline]',
    taskErrorMessage: '[data-js-task-error]',

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

  constructor() {
    const { selectors } = this;

    this.rootElement = document.querySelector(selectors.root);
    this.modalElement = document.querySelector(selectors.modal);
    this.taskNameInputElement = this.rootElement.querySelector(selectors.taskNameInput);
    this.taskPriorityElement = this.rootElement.querySelector(selectors.taskPriority);
    this.taskDeadlineElement = this.rootElement.querySelector(selectors.taskDeadline);
    this.taskErrorMessageElement = this.rootElement.querySelector(selectors.taskErrorMessage);

    this.taskTemplateElement = document.querySelector(selectors.taskTemplate);
    this.listElement = document.querySelector(selectors.list);
    this.taskCounterElement = document.querySelector(selectors.taskCounter);
    this.taskEmptyStateElement = document.querySelector(selectors.taskEmptyState);

    this.state = {
      tasks: this.getTasksFromLocalStorage(),
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

  // Полностью строим список только при загрузке страницы.
  render() {
    const items = this.state.tasks.map((task) => this.createTaskElement(task));
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
    this.taskCounterElement.textContent = String(this.state.tasks.length);
    this.taskEmptyStateElement.classList.toggle(
      this.stateClasses.isHidden,
      this.state.tasks.length > 0,
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
      title,
      priority: this.taskPriorityElement.value,
      dueDate: this.taskDeadlineElement.value,
      completed: false,
    };
    const tasks = [...this.state.tasks, task];

    // Меняем состояние и DOM после успешного сохранения.
    if (!this.saveTasksToLocalStorage(tasks)) return;

    this.state.tasks = tasks;
    this.listElement.append(this.createTaskElement(task));
    this.updateSummary();
    this.taskErrorMessageElement.textContent = '';
    this.taskNameInputElement.removeAttribute('aria-invalid');
    this.rootElement.reset();
    this.modalElement.close();
  };

  deleteTask(id, item) {
      const tasks = this.state.tasks.filter(task => task.id !== id);

      if (!this.saveTasksToLocalStorage(tasks)) return;

      this.state.tasks = tasks;
      item.remove();
      this.updateSummary();
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
      this.deleteTask(taskElement.dataset.taskId, taskElement);
  }

  bindEvents() {
    this.rootElement.addEventListener('submit', this.onFormSubmit);
    this.listElement.addEventListener('click', this.onDeleteTaskButton);
    this.listElement.addEventListener('change', this.onTaskCheckboxChange);
  }
}

export default Tasks;