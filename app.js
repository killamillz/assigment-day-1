const STORAGE_KEY = 'todo.tasks';
const THEME_KEY = 'todo.theme';

const MINUTE = 60000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let currentFilter = 'all';
let lastDeleted = null;
let toastTimer = null;

const taskInput = document.getElementById('taskInput');
const dueInput = document.getElementById('dueInput');
const clearDueBtn = document.getElementById('clearDueBtn');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const itemsLeft = document.getElementById('itemsLeft');
const clearBtn = document.getElementById('clearBtn');
const progressBar = document.getElementById('progressBar');
const subtitle = document.getElementById('subtitle');
const themeBtn = document.getElementById('themeBtn');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toastText');
const undoBtn = document.getElementById('undoBtn');
const filterBtns = document.querySelectorAll('.filter-btn');

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatGap(ms) {
  const abs = Math.abs(ms);
  if (abs < MINUTE) return 'less than a minute';
  if (abs < HOUR) return `${Math.round(abs / MINUTE)}m`;
  if (abs < DAY) return `${Math.round(abs / HOUR)}h`;
  return `${Math.round(abs / DAY)}d`;
}

function agoLabel(ts) {
  const gap = Date.now() - ts;
  return gap < MINUTE ? 'just now' : `${formatGap(gap)} ago`;
}

function dueLabel(dueAt) {
  const diff = dueAt - Date.now();
  if (Math.abs(diff) >= 7 * DAY) {
    const when = new Date(dueAt).toLocaleString([], {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    return `Due ${when}`;
  }
  return diff >= 0 ? `Due in ${formatGap(diff)}` : `Overdue by ${formatGap(diff)}`;
}

function dueState(task) {
  if (task.completed) return '';
  const diff = task.dueAt - Date.now();
  if (diff < 0) return 'late';
  if (diff < DAY) return 'soon';
  return '';
}

function toInputValue(ts) {
  const d = new Date(ts);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromInputValue(value) {
  const ts = new Date(value).getTime();
  return isNaN(ts) ? null : ts;
}

function addTask() {
  const text = taskInput.value.trim();
  if (text === '') return;

  tasks.unshift({
    id: Date.now(),
    text: text,
    completed: false,
    createdAt: Date.now(),
    dueAt: fromInputValue(dueInput.value)
  });

  taskInput.value = '';
  dueInput.value = '';
  save();
  displayTask();
  taskInput.focus();
}

function updateTask(id, changes) {
  tasks = tasks.map(t => t.id === id ? { ...t, ...changes } : t);
  save();
  displayTask();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) updateTask(id, { completed: !task.completed });
}

function editTask(id, text) {
  const clean = text.trim();
  if (clean === '') {
    deleteTask(id);
    return;
  }

  const task = tasks.find(t => t.id === id);
  if (!task || task.text === clean) {
    displayTask();
    return;
  }

  updateTask(id, { text: clean, updatedAt: Date.now() });
}

function deleteTask(id) {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return;

  lastDeleted = { task: tasks[index], index: index };
  tasks.splice(index, 1);
  save();
  displayTask();
  showToast('Task deleted');
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  save();
  displayTask();
}

function showToast(message) {
  toastText.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
}

function undoDelete() {
  if (!lastDeleted) return;
  tasks.splice(lastDeleted.index, 0, lastDeleted.task);
  lastDeleted = null;
  save();
  displayTask();
  toast.classList.remove('show');
}

function editInline(target, { value, type, className, onCommit }) {
  const input = document.createElement('input');
  input.type = type;
  input.className = className;
  input.value = value;
  target.replaceWith(input);
  input.focus();
  if (type === 'text') input.setSelectionRange(input.value.length, input.value.length);

  let done = false;
  const commit = () => { if (!done) { done = true; onCommit(input.value); } };

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') { done = true; displayTask(); }
  });
}

function buildMeta(task) {
  const meta = document.createElement('div');
  meta.className = 'meta';

  const created = document.createElement('span');
  created.className = 'created';
  created.textContent = `Added ${agoLabel(task.createdAt)}`;
  created.title = new Date(task.createdAt).toLocaleString();
  meta.appendChild(created);

  if (task.updatedAt) {
    const edited = document.createElement('span');
    edited.className = 'edited';
    edited.textContent = `✎ edited ${agoLabel(task.updatedAt)}`;
    edited.title = new Date(task.updatedAt).toLocaleString();
    meta.appendChild(edited);
  }

  if (task.dueAt) {
    const due = document.createElement('span');
    due.className = `due ${dueState(task)}`.trim();
    due.textContent = '⏰ ' + dueLabel(task.dueAt);
    due.title = new Date(task.dueAt).toLocaleString();
    meta.appendChild(due);
  }

  return meta;
}

function buildTaskItem(task) {
  const li = document.createElement('li');
  li.className = task.completed ? 'task completed' : 'task';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => toggleTask(task.id));

  const body = document.createElement('div');
  body.className = 'body';

  const span = document.createElement('span');
  span.className = 'text';
  span.textContent = task.text;
  span.title = 'Double-click to edit';

  const startTextEdit = () => editInline(span, {
    value: task.text,
    type: 'text',
    className: 'edit-input',
    onCommit: value => editTask(task.id, value)
  });

  span.addEventListener('dblclick', startTextEdit);

  body.append(span, buildMeta(task));

  const actions = document.createElement('div');
  actions.className = 'actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'edit';
  editBtn.textContent = '✎';
  editBtn.title = 'Edit task';
  editBtn.addEventListener('click', startTextEdit);

  const clockBtn = document.createElement('button');
  clockBtn.className = 'clock';
  clockBtn.textContent = '⏰';
  clockBtn.title = task.dueAt ? 'Change deadline' : 'Set a deadline';
  clockBtn.addEventListener('click', () => {
    const meta = body.querySelector('.meta');
    editInline(meta, {
      value: task.dueAt ? toInputValue(task.dueAt) : '',
      type: 'datetime-local',
      className: 'due-edit',
      onCommit: value => updateTask(task.id, { dueAt: fromInputValue(value) })
    });
  });

  const delBtn = document.createElement('button');
  delBtn.className = 'del';
  delBtn.textContent = '✕';
  delBtn.title = 'Delete task';
  delBtn.addEventListener('click', () => deleteTask(task.id));

  actions.append(editBtn, clockBtn, delBtn);
  li.append(checkbox, body, actions);
  return li;
}

function displayTask() {
  taskList.innerHTML = '';

  let filtered = tasks;
  if (currentFilter === 'active') filtered = tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') filtered = tasks.filter(t => t.completed);

  if (filtered.length === 0) {
    const messages = {
      all: ['📝', 'Nothing here yet — add your first task.'],
      active: ['🎉', 'All caught up. Nice work!'],
      completed: ['💤', 'No completed tasks yet.']
    };
    const [icon, message] = messages[currentFilter];
    taskList.innerHTML = `<li class="empty"><span class="icon">${icon}</span>${message}</li>`;
  } else {
    filtered.forEach(task => taskList.appendChild(buildTaskItem(task)));
  }

  updateStats();
}

function updateStats() {
  const total = tasks.length;
  const doneCount = tasks.filter(t => t.completed).length;
  const activeCount = total - doneCount;
  const overdue = tasks.filter(t => t.dueAt && dueState(t) === 'late').length;

  itemsLeft.textContent = `${activeCount} item${activeCount === 1 ? '' : 's'} left`;
  clearBtn.disabled = doneCount === 0;
  progressBar.style.width = total ? `${(doneCount / total) * 100}%` : '0%';

  const counts = { all: total, active: activeCount, completed: doneCount };
  document.querySelectorAll('.count').forEach(el => {
    el.textContent = counts[el.dataset.count] || '';
  });

  if (total === 0) subtitle.textContent = "Let's get things done.";
  else if (overdue > 0) subtitle.textContent = `${overdue} task${overdue === 1 ? '' : 's'} overdue ⚠️`;
  else if (activeCount === 0) subtitle.textContent = 'Everything done — enjoy your day! 🎊';
  else subtitle.textContent = `${doneCount} of ${total} complete`;
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem(THEME_KEY, theme);
}

function migrate() {
  tasks = tasks.map(t => ({ createdAt: t.id, dueAt: null, updatedAt: null, ...t }));
}

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});
dueInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});
clearDueBtn.addEventListener('click', () => dueInput.value = '');
clearBtn.addEventListener('click', clearCompleted);
undoBtn.addEventListener('click', undoDelete);

themeBtn.addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    displayTask();
  });
});

setInterval(() => {
  if (!taskList.querySelector('.edit-input, .due-edit')) displayTask();
}, 30000);

migrate();
applyTheme(localStorage.getItem(THEME_KEY) || 'light');
displayTask();
taskInput.focus();
