//GROUP 3

// Eronini Kelechi
// Adetola Pelumi
// Peace Ngozichukwuka
//Innocent Ibeto
// Ireoluwa Adeoluwa
// Emmanuel Njoku

const addTodos = document.querySelector('.add-btn');
const aa = document.querySelector('.add')
const list = document.querySelector('ul');
const generateTodo = (todos) => {
    const html = `<li class="todo-item"><span>${todos}</span><i class="delete"><iconify-icon icon="codicon:trash"></iconify-icon></i></li>`

    list.innerHTML += html;
}


// add todo
addTodos.addEventListener('click', () => {
    const todos = aa.add.value.trim();
    if (todos !== '') {
        console.log(todos)

        generateTodo(todos);
    } else { }

    aa.reset();

})

aa.addEventListener('submit', e => {
    e.preventDefault()

    const todos = aa.add.value;
    console.log(todos)

    generateTodo(todos);

    aa.reset();
})



// delete todo
list.addEventListener('click', e => {
    const deleteBtn = e.target.closest('.delete');

    if (deleteBtn) {
        console.log('dele')
        deleteBtn.parentElement.remove();
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
search.addEventListener('keyup', () => {
    const terms = search.value.toLowerCase().trim()
    filterTodo(terms)
})