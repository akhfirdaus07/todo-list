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
const newToDoLink = document.querySelector('#new-todo-link'); 
const newProjectLink = document.querySelector('#new-project-link'); 
const newNoteLink = document.querySelector('#new-note-link'); 
const newToDoMenu = document.querySelector('#new-todo-menu');
const newProjectMenu = document.querySelector('#new-project-menu');
const newNoteMenu = document.querySelector('#new-note-menu');

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

// control which form menu is open 
newToDoLink.addEventListener('click', () =>{
    // turn off other menus
    newProjectMenu.style.display = "none";
    newNoteMenu.style.display = "none";
    // DISPLAY SELECTED MENU
    newToDoMenu.style.display = "flex";
})

newProjectLink.addEventListener('click', () =>{
    // turn off other menus
    newToDoMenu.style.display = "none";
    newNoteMenu.style.display = "none";
    // DISPLAY SELECTED MENU
    newProjectMenu.style.display = "flex";
})

newNoteLink.addEventListener('click', () =>{
    // turn off other menus
    newToDoMenu.style.display = "none";
    newProjectMenu.style.display = "none";
    // DISPLAY SELECTED MENU
    newNoteMenu.style.display = "flex";
})

const createNewOptions = document.querySelectorAll('.create-new__options-items');
createNewOptions.forEach(option => {
    option.addEventListener('click', e => {
        createNewOptions.forEach(option => {
            option.classList.remove('create-new__options-items-active');
        });
        e.target.classList.add('create-new__options-items-active');
    });
})