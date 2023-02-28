import './style.css';
import { domManipulator, toDosManager } from './logicModule';
const todos = JSON.parse(localStorage.getItem('todos')) || {
    "home": [],
    "today": [],
    "week": [],
}
const display = document.querySelector('.main');

const toDoFolders = document.querySelectorAll('.todo-folder');

toDoFolders.forEach(folder => {
    folder.addEventListener("click", e => domManipulator.changeFolder(e, todos, display));
})
