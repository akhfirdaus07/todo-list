import './style.css';
import { domManipulator, toDosManager } from './logicModule';
const todos = JSON.parse(localStorage.getItem('todos')) || {
    "home": [],
    "today": [],
    "week": [],
}
const display = document.querySelector('.main');

const toDoFolders = document.querySelectorAll('.todo-folder');

// navigate to home/today/week
toDoFolders.forEach(folder => {
    folder.addEventListener("click", e => domManipulator.changeFolder(e, todos, display));
})

// navigate to notes menu
document.querySelector('#notes-nav').addEventListener('click', () => notesManager.arrangeNotes(notes));
document.querySelector('#notes-nav').addEventListener('click', (e) => domManipulator.updateActiveNavMain(e));