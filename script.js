class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.initEventListeners();
        this.renderTodos();
        this.updateFilterButtons();
    }

    initEventListeners() {
        // Form submission
        document.getElementById('todoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        // Filter buttons
        document.getElementById('filterAll').addEventListener('click', () => this.setFilter('all'));
        document.getElementById('filterPending').addEventListener('click', () => this.setFilter('pending'));
        document.getElementById('filterCompleted').addEventListener('click', () => this.setFilter('completed'));

        // Delete all button
        document.getElementById('deleteAll').addEventListener('click', () => this.deleteAllTodos());
    }

    addTodo() {
        const todoInput = document.getElementById('todoInput');
        const dateInput = document.getElementById('dateInput');
        const errorMessage = document.getElementById('errorMessage');

        // Clear previous error
        errorMessage.textContent = '';

        // Validation
        const todoText = todoInput.value.trim();
        const todoDate = dateInput.value;

        if (!todoText) {
            this.showError('Please enter a todo task');
            return;
        }

        if (!todoDate) {
            this.showError('Please select a date');
            return;
        }

        // Check if date is in the past
        const selectedDate = new Date(todoDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            this.showError('Please select a current or future date');
            return;
        }

        // Create new todo
        const newTodo = {
            id: Date.now(),
            text: todoText,
            date: todoDate,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(newTodo);
        this.saveTodos();
        this.renderTodos();

        // Clear form
        todoInput.value = '';
        dateInput.value = '';
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        setTimeout(() => {
            errorMessage.textContent = '';
        }, 3000);
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.renderTodos();
    }

    toggleComplete(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
        }
    }

    editTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (!todo) return;

        const newText = prompt('Edit todo:', todo.text);
        if (newText !== null && newText.trim() !== '') {
            todo.text = newText.trim();
            this.saveTodos();
            this.renderTodos();
        }
    }

    deleteAllTodos() {
        if (this.todos.length === 0) return;

        if (confirm('Are you sure you want to delete all todos?')) {
            this.todos = [];
            this.saveTodos();
            this.renderTodos();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.updateFilterButtons();
        this.renderTodos();
    }

    updateFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));

        switch(this.currentFilter) {
            case 'all':
                document.getElementById('filterAll').classList.add('active');
                break;
            case 'pending':
                document.getElementById('filterPending').classList.add('active');
                break;
            case 'completed':
                document.getElementById('filterCompleted').classList.add('active');
                break;
        }
    }

    getFilteredTodos() {
        switch(this.currentFilter) {
            case 'pending':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    renderTodos() {
        const todoList = document.getElementById('todoList');
        const noTasks = document.getElementById('noTasks');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            noTasks.style.display = 'flex';
            // Remove all todo items but keep the no-tasks element
            const todoItems = todoList.querySelectorAll('.todo-item');
            todoItems.forEach(item => item.remove());
        } else {
            noTasks.style.display = 'none';

            // Clear existing todo items
            const todoItems = todoList.querySelectorAll('.todo-item');
            todoItems.forEach(item => item.remove());

            // Sort todos by date
            filteredTodos.sort((a, b) => new Date(a.date) - new Date(b.date));

            // Render todos
            filteredTodos.forEach(todo => {
                const todoItem = this.createTodoElement(todo);
                todoList.appendChild(todoItem);
            });
        }
    }

    createTodoElement(todo) {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        todoItem.innerHTML = `
            <div class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</div>
            <div class="todo-date">${this.formatDate(todo.date)}</div>
            <div class="todo-status">
                <span class="status-badge ${todo.completed ? 'status-completed' : 'status-pending'}">
                    ${todo.completed ? 'Completed' : 'Pending'}
                </span>
            </div>
            <div class="todo-actions">
                <button class="action-btn complete-btn" onclick="app.toggleComplete(${todo.id})" title="${todo.completed ? 'Mark as pending' : 'Mark as completed'}">
                    ${todo.completed ? '↺' : '✓'}
                </button>
                <button class="action-btn edit-btn" onclick="app.editTodo(${todo.id})" title="Edit todo">
                    ✎
                </button>
                <button class="action-btn delete-btn" onclick="app.deleteTodo(${todo.id})" title="Delete todo">
                    ✕
                </button>
            </div>
        `;
        return todoItem;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});