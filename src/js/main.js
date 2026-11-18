import ModalTaskCreate from "./ModalTaskCreate.js";
import Tasks from "./Tasks.js";
import BurgerMenu from "./BurgerMenu.js";
import ThemeSwitcher from "./ThemeSwitcher.js";
import ModalTaskEdit from "./ModalTaskEdit.js";
import Tabs from "./Tabs.js";

new ModalTaskCreate();
new BurgerMenu();
new ThemeSwitcher();
const modalTaskEdit = new ModalTaskEdit();
const tabs = new Tabs();
const tasks = new Tasks(modalTaskEdit, tabs);
