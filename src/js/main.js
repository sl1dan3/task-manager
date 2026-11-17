import ModalTaskCreate from "./ModalTaskCreate.js";
import Tasks from "./Tasks.js";
import BurgerMenu from "./BurgerMenu.js";
import ThemeSwitcher from "./ThemeSwitcher.js";
import ModalTaskEdit from "./ModalTaskEdit.js";

new ModalTaskCreate();
new BurgerMenu();
new ThemeSwitcher();
const modalTaskEdit = new ModalTaskEdit();
const tasks = new Tasks(modalTaskEdit);