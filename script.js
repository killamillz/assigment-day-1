// Connect the page controls to JavaScript.
const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const subjectInput = document.querySelector("#subjectInput");
const startTimeInput = document.querySelector("#startTimeInput");
const dueDateInput = document.querySelector("#dueDateInput");
const dueTimeInput = document.querySelector("#dueTimeInput");
const priorityInput = document.querySelector("#priorityInput");
const taskList = document.querySelector("#taskList");
const emptyState = document.querySelector("#emptyState");
const modalBackdrop = document.querySelector("#modalBackdrop");
const openModalButton = document.querySelector("#openModalButton");
const closeModalButton = document.querySelector("#closeModalButton");
const dateBadge = document.querySelector("#dateBadge");
const dailyQuote = document.querySelector("#dailyQuote");

// Quotes are selected randomly whenever the page loads.
const motivationalQuotes = [
	"Small steps still move you forward.",
	"Start where you are. Use what you have.",
	"Progress, not perfection.",
	"You can do hard things.",
	"A little focus goes a long way.",
	"Done is better than perfect.",
	"Keep going. Your future self will thank you."
];

// Set the date badge and choose today's motivational quote.
const today = new Date();
dateBadge.dateTime = today.toISOString().split("T")[0];
dateBadge.textContent = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
dailyQuote.textContent = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

// Example tasks shown on a first visit before local storage has data.
const starterTasks = [
	{ id: 1, title: "Review today's class notes", subject: "Study", dueDate: "", priority: "Medium", completed: true },
	{ id: 2, title: "Finish the mathematics assignment", subject: "Mathematics", dueDate: "", priority: "High", completed: false },
	{ id: 3, title: "Read chapter four", subject: "English", dueDate: "", priority: "Low", completed: true },
	{ id: 4, title: "Prepare for tomorrow's class", subject: "Study", dueDate: "", priority: "Medium", completed: false },
	{ id: 5, title: "Organise study notes", subject: "Study", dueDate: "", priority: "Low", completed: false }
];

// Restore saved tasks, or use the starter list for a new user.
let tasks = JSON.parse(localStorage.getItem("daymark-tasks")) || starterTasks;

// Save the current task list in the browser.
function saveTasks() {
	localStorage.setItem("daymark-tasks", JSON.stringify(tasks));
}

// Build the visible task rows and update the unfinished-task count.
function renderTasks() {
	taskList.innerHTML = tasks.map((task) => `
		<article class="task-item ${task.completed ? "is-complete" : ""}">
			<button class="check-button" type="button" data-action="toggle" data-id="${task.id}" aria-label="${task.completed ? "Mark task as incomplete" : "Mark task as complete"}">${task.completed ? "✓" : ""}</button>
			<div>
				<p class="task-title">${escapeHtml(task.title)}</p>
				${task.subject || task.startTime || task.dueDate || task.dueTime ? `<span class="task-meta">${escapeHtml(task.subject || "Task")}${task.startTime ? ` · Starts ${formatTime(task.startTime)}` : ""}${task.dueDate ? ` · Due ${formatDate(task.dueDate)}` : ""}${task.dueTime ? ` at ${formatTime(task.dueTime)}` : ""}</span>` : ""}
			</div>
			<button class="delete-button" type="button" data-action="delete" data-id="${task.id}" aria-label="Delete ${escapeHtml(task.title)}">×</button>
		</article>
	`).join("");

	document.querySelector("#activeCount").textContent = tasks.filter((task) => !task.completed).length;
	emptyState.hidden = tasks.length !== 0;
}

// Convert stored dates and times into readable labels.
function formatDate(dateValue) {
		return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(timeValue) {
	const [hours, minutes] = timeValue.split(":");
	const time = new Date();
	time.setHours(Number(hours), Number(minutes));
	return time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// Escape user-entered text before placing it into generated HTML.
function escapeHtml(value) {
	return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[character]));
}

// Open the task form and place the cursor in the task-name field.
function openModal() {
	modalBackdrop.hidden = false;
	document.body.classList.add("modal-open");
	taskInput.focus();
}

// Close and reset the task form.
function closeModal() {
	modalBackdrop.hidden = true;
	document.body.classList.remove("modal-open");
	taskForm.reset();
}

// Connect modal controls, including background click and Escape key closing.
openModalButton.addEventListener("click", openModal);
closeModalButton.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (event) => {
	if (event.target === modalBackdrop) closeModal();
});
document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && !modalBackdrop.hidden) closeModal();
});

// Validate the form, create a task, save it, and refresh the list.
taskForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const title = taskInput.value.trim();
	if (!title) return;
	tasks.push({
		id: Date.now(),
		title,
		subject: subjectInput.value.trim(),
		startTime: startTimeInput.value,
		dueDate: dueDateInput.value,
		dueTime: dueTimeInput.value,
		priority: priorityInput.value,
		completed: false
	});
	saveTasks();
	closeModal();
	renderTasks();
});

// Handle completion and deletion for all generated task buttons.
taskList.addEventListener("click", (event) => {
	const button = event.target.closest("button");
	if (!button) return;
	const taskId = Number(button.dataset.id);
	if (button.dataset.action === "toggle") tasks = tasks.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task);
	if (button.dataset.action === "delete") tasks = tasks.filter((task) => task.id !== taskId);
	saveTasks();
	renderTasks();
});

// Render saved or starter tasks when the page first loads.
renderTasks();
