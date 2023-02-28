import './style.css';
import {toDosManager, domManipulator, notesManager} from "./logicModule"
const todos = JSON.parse(localStorage.getItem('todos')) || {
    "home": [],
    "today": [],
    "week": [],
}
const display = document.querySelector('.main');
const toDoFolders = document.querySelectorAll('.todo-folder');
const createProject = document.querySelector('.create-new__project-submit');
const createNote = document.querySelector('.create-new__note-submit');
const openForm = document.querySelector('.new-todo');
const closeForm = document.querySelector('.create-new__close');
const overlayNew = document.querySelector('.overlay-new');
const addToDoForm = document.querySelector('.create-new');
const newToDoLink = document.querySelector('#new-todo-link'); 
const newProjectLink = document.querySelector('#new-project-link'); 
const newNoteLink = document.querySelector('#new-note-link'); 
const newToDoMenu = document.querySelector('#new-todo-menu');
const newProjectMenu = document.querySelector('#new-project-menu');
const newNoteMenu = document.querySelector('#new-note-menu');

// initial homescreen render
domManipulator.renderAllToDos(todos, display);
domManipulator.renderProjectNames(todos, display);

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
    domManipulator.changeActiveFormLink()
});

// control which form menu is open 
newToDoLink.addEventListener('click', () =>{
    newProjectMenu.style.display = "none";
    newNoteMenu.style.display = "none";
    newToDoMenu.style.display = "flex";
});
newProjectLink.addEventListener('click', () =>{
    newToDoMenu.style.display = "none";
    newNoteMenu.style.display = "none";
    newProjectMenu.style.display = "flex";
});
newNoteLink.addEventListener('click', () =>{
    newToDoMenu.style.display = "none";
    newProjectMenu.style.display = "none";
    newNoteMenu.style.display = "flex";
});

// closes the form and toggles the display back 
closeForm.addEventListener('click', () => {
    overlayNew.classList.toggle('overlay-new-invisible');
    addToDoForm.classList.toggle('create-new-open');
    addToDoForm.reset();
    domManipulator.resetActiveFormLink();
    domManipulator.removeActivePriority();
    newToDoMenu.style.display = "flex"; 
    newProjectMenu.style.display = "none";
    newNoteMenu.style.display = "none";
});

// when the submit new todo button is pressed, grab data from the form and create a new todo
addToDoForm.addEventListener('submit', e => {
    toDosManager.addNewToDo(e, todos, display, overlayNew, addToDoForm);
});

// when a low / medium / high priority button is clicked
const priorityBtns = document.querySelectorAll('.create-new__priority-btn');
    priorityBtns.forEach(btn => {
    btn.addEventListener('click', e =>{
        domManipulator.activePriority(e);
    });
})


// add new poject
createProject.addEventListener('click', e => {
    toDosManager.addNewProject(e, todos, overlayNew, addToDoForm, display);
    
    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
      }
    sleep(300).then(() => {
        // resets form active link back to new todo
        domManipulator.resetActiveFormLink();
    })
})

// add new note
createNote.addEventListener('click', e => {
    notesManager.addNewNote(e, notes, overlayNew, addToDoForm, display);

    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
      }
    sleep(300).then(() => {
        // resets form active link back to new todo
        domManipulator.resetActiveFormLink();
    })
});
    