// app.js - Vanilla JS ToDo with filters, edit, localStorage

const STORAGE_KEY = 'todo_v1';
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const itemsLeft = document.getElementById('items-left');
const filters = document.querySelectorAll('.filter-btn');
const clearBtn = document.getElementById('clear-completed');

let tasks = []; // {id, text, completed}

init();

function init(){
  load();
  render();
  form.addEventListener('submit', onAdd);
  filters.forEach(btn => btn.addEventListener('click', onFilter));
  clearBtn.addEventListener('click', clearCompleted);
}

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  }catch(e){ tasks = []; }
}

function onAdd(e){
  e.preventDefault();
  const text = input.value.trim();
  if(!text) return;
  const task = { id: Date.now().toString(), text, completed: false };
  tasks.unshift(task);
  input.value = '';
  save();
  render();
}

function onFilter(e){
  filters.forEach(b=>b.classList.remove('active'));
  e.currentTarget.classList.add('active');
  render();
}

function getActiveFilter(){
  const active = document.querySelector('.filter-btn.active');
  return active ? active.getAttribute('data-filter') : 'all';
}

function render(){
  list.innerHTML = '';
  const filter = getActiveFilter();

  const filtered = tasks.filter(t => {
    if(filter === 'active') return !t.completed;
    if(filter === 'completed') return t.completed;
    return true;
  });

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;

    // checkbox
    const check = document.createElement('button');
    check.className = 'check';
    check.setAttribute('aria-label', task.completed ? 'Mark as active' : 'Mark as completed');
    check.innerHTML = task.completed ? '✓' : '';
    check.addEventListener('click', ()=> toggleComplete(task.id));
    li.appendChild(check);

    // label (editable)
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = task.text;
    label.tabIndex = 0;
    // double click to edit
    label.addEventListener('dblclick', ()=> startEdit(task.id, label));
    // allow Enter while label focused to start edit
    label.addEventListener('keydown', (e)=> {
      if(e.key === 'Enter') startEdit(task.id, label);
    });
    li.appendChild(label);

    // remove
    const remove = document.createElement('button');
    remove.className = 'remove-btn';
    remove.innerHTML = '✕';
    remove.title = 'Remove task';
    remove.addEventListener('click', ()=> removeTask(task.id));
    li.appendChild(remove);

    list.appendChild(li);
  });

  updateStats();
}

function toggleComplete(id){
  tasks = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
  save();
  render();
}

function removeTask(id){
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

function startEdit(id, labelElement){
  const task = tasks.find(t => t.id === id);
  if(!task) return;
  const inputEl = document.createElement('input');
  inputEl.type = 'text';
  inputEl.className = 'edit-input';
  inputEl.value = task.text;
  labelElement.replaceWith(inputEl);
  inputEl.focus();
  // select text
  inputEl.setSelectionRange(0, inputEl.value.length);

  function finish(saveChange){
    if(saveChange){
      const newValue = inputEl.value.trim();
      if(newValue) task.text = newValue;
      else { // empty => remove
        tasks = tasks.filter(t => t.id !== id);
      }
      save();
    }
    render();
  }

  inputEl.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') finish(true);
    if(e.key === 'Escape') finish(false);
  });

  inputEl.addEventListener('blur', () => finish(true));
}

function updateStats(){
  const left = tasks.filter(t => !t.completed).length;
  itemsLeft.textContent = left;
}

function clearCompleted(){
  tasks = tasks.filter(t => !t.completed);
  save();
  render();
}