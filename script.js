(() => {
    const STORAGE_KEY = 'tasks';
    const taskForm = document.getElementById('task-form');
    const titleInput = document.querySelector('#task-form [name="title"]');
    const priorityInput = document.querySelector('#task-form [name="priority"]');
    const dueDateInput = document.querySelector('#task-form [name="dueDate"]');
    const taskList = document.getElementById('task-list');
    const sortBtn = document.getElementById('sort-btn');
    const errorEl = document.getElementById('error-msg');

    function showError(msg) {
        if (errorEl) {
            errorEl.textContent = msg;
        } else {
            console.error(msg);
        }
    }

    function loadTasks() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            showError('Failed to load tasks: ' + e.message);
            return [];
        }
    }

    function saveTasks(tasks) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch (e) {
            showError('Failed to save tasks: ' + e.message);
        }
    }

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;

        const titleSpan = document.createElement('span');
        titleSpan.className = 'task-title';
        titleSpan.textContent = task.title;

        const prioritySpan = document.createElement('span');
        prioritySpan.className = 'task-priority';
        prioritySpan.textContent = task.priority;

        const dueSpan = document.createElement('span');
        dueSpan.className = 'task-due';
        dueSpan.textContent = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '';

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const completeBtn = document.createElement('button');
        completeBtn.type = 'button';
        completeBtn.className = 'complete-btn';
        completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
        completeBtn.addEventListener('click', () => toggleComplete(task.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        actionsDiv.appendChild(completeBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(titleSpan);
        li.appendChild(prioritySpan);
        li.appendChild(dueSpan);
        li.appendChild(actionsDiv);

        if (task.completed) li.classList.add('completed');

        return li;
    }

    function renderTasks() {
        const tasks = loadTasks();
        if (!taskList) return;
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const el = createTaskElement(task);
            taskList.appendChild(el);
        });
    }

    function addTask(e) {
        e.preventDefault();
        const title = titleInput?.value.trim() ?? '';
        const priority = priorityInput?.value ?? 'Low';
        const dueDate = dueDateInput?.value ?? '';

        if (!title) {
            showError('Title cannot be empty.');
            return;
        }

        const tasks = loadTasks();
        const newTask = {
            id: Date.now().toString(),
            title,
            priority,
            dueDate: dueDate || null,
            completed: false
        };
        tasks.push(newTask);
        saveTasks(tasks);
        renderTasks();
        taskForm?.reset();
    }

    function toggleComplete(id) {
        const tasks = loadTasks();
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        task.completed = !task.completed;
        saveTasks(tasks);
        renderTasks();
    }

    function deleteTask(id) {
        let tasks = loadTasks();
        tasks = tasks.filter(t => t.id !== id);
        saveTasks(tasks);
        renderTasks();
    }

    function sortByPriority() {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        const tasks = loadTasks();
        tasks.sort((a, b) => {
            const diff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            if (diff !== 0) return diff;
            if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
            return 0;
        });
        saveTasks(tasks);
        renderTasks();
    }

    document.addEventListener('DOMContentLoaded', () => {
        try {
            if (taskForm) taskForm.addEventListener('submit', addTask);
            if (sortBtn) sortBtn.addEventListener('click', sortByPriority);
            renderTasks();
        } catch (e) {
            showError('Initialization error: ' + e.message);
        }
    });
})();