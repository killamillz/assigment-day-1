//GROUP 3

// Eronini Kelechi
// Adetola Pelumi
// Peace Ngozichukwuka
//Innocent Ibeto
// Ireoluwa Adeoluwa
// Emmanuel Njoku

const addTodos = document.querySelector('.add-btn');
const aa = document.querySelector('.add')
const list = document.querySelector('.todos');
const completedList = document.querySelector('.completed-todos');
const bodyContainer = document.querySelector('.body-container');

const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour12 = ((+hours + 11) % 12) + 1;
    const period = +hours < 12 ? 'AM' : 'PM';
    return `${hour12}:${minutes} ${period}`;
}

const generateTodo = (todos, time) => {
    const timeHtml = time ? `<span class="todo-time">${formatTime(time)}</span>` : '';
    const html = `<li class="todo-item"><input type="checkbox" class="complete-checkbox" /><span>${todos}</span>${timeHtml}<i class="delete"><iconify-icon icon="codicon:trash"></iconify-icon></i></li>`

    list.innerHTML += html;
}


// add todo
addTodos.addEventListener('click', () => {
    const todos = aa.add.value.trim();
    const time = aa['add-time'].value;
    if (todos !== '') {
        console.log(todos)

        generateTodo(todos, time);
    } else { }

    aa.reset();

})

aa.addEventListener('submit', e => {
    e.preventDefault()

    const todos = aa.add.value;
    const time = aa['add-time'].value;
    console.log(todos)

    generateTodo(todos, time);

    aa.reset();
})



// delete todo (works for both active and completed lists)
bodyContainer.addEventListener('click', e => {
    const deleteBtn = e.target.closest('.delete');

    if (deleteBtn) {
        console.log('dele')
        deleteBtn.closest('li').remove();
    }
})


// complete todo - checking the box moves the item to the Completed
// section, unchecking it sends it back to the active list
bodyContainer.addEventListener('change', e => {
    if (e.target.classList.contains('complete-checkbox')) {
        const todoItem = e.target.closest('li');

        if (e.target.checked) {
            todoItem.classList.add('completed');
            completedList.appendChild(todoItem);
        } else {
            todoItem.classList.remove('completed');
            list.appendChild(todoItem);
        }
    }
})


// search todos
filterTodo = (terms) => {
    const listArray = Array.from(list.children)
    listArray
        .filter(todo => !todo.textContent.toLowerCase().includes(terms))

        .forEach(todo => todo.classList.add('filtered'));


    listArray
        .filter(todo => todo.textContent.toLowerCase().includes(terms))

        .forEach(todo => todo.classList.remove('filtered'));
}


const search = document.querySelector('.search input');
if (search) {
    search.addEventListener('keyup', () => {
        const terms = search.value.toLowerCase().trim()
        filterTodo(terms)
    })
}