import './style.css';
import { domManipulator, toDosManager } from './logicModule';
const todos = JSON.parse(localStorage.getItem('todos')) || {
    "home": [],
    "today": [],
    "week": [],
}
const display = document.querySelector('.main');
const toDoFolders = document.querySelectorAll('.todo-folder');
const openForm = document.querySelector('.new-todo');
const overlayNew = document.querySelector('.overlay-new');
const addToDoForm = document.querySelector('.create-new');

// navigate to home/today/week
toDoFolders.forEach(folder => {
    folder.addEventListener("click", e => domManipulator.changeFolder(e, todos, display));
})

// navigate to notes menu
document.querySelector('#notes-nav').addEventListener('click', () => notesManager.arrangeNotes(notes));
document.querySelector('#notes-nav').addEventListener('click', (e) => domManipulator.updateActiveNavMain(e));

// toggles display on for overlay and form when the open form button is clicked
openForm.addEventListener('click', () => {
    overlayNew.classList.toggle('overlay-new-invisible');
    addToDoForm.classList.toggle('create-new-open');
})