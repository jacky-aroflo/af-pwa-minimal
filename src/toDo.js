const AfToDoComponent = Vue.defineComponent({
	template: `
		<div>
			Example of a simple To Do list using Vue.js and IndexedDB.
			<hr />
			<div class="alert alert-info">
				<div class="input-group">
					<div class="input-group-prepend">
						<span class="input-group-text" id="">To Do List</span>
					</div>
					<input ref="todoInput" v-model="newTodo" placeholder="Add a new item" type="text" class="form-control" @keyup.enter="addToDo" />
					<div class="input-group-append">
						<button class="btn btn-outline-secondary" type="button" @click="addToDo">Add</button>
					</div>
				</div>
				<hr />
				<ul class="list-group">
					<li v-for="(todo, index) in todos" :key="index" class="list-group-item d-flex justify-content-between align-items-center" :class="{'bg-light': todo.id > lastId}">
						{{ todo.todo }}
						<button @click="removeTodo(index, todo)" type="button" class="btn btn-sm btn-danger">Remove</button>
					</li>
				</ul>
			</div>
		</div>
	`,
	data() {
		return {
			newTodo: '',
			todos: [],
			lastId: 0,
		};
	},
	methods: {
		initDB() {
			// Open the database
			const request = indexedDB.open('af_pwa_minimal_demo', 1);

			request.onupgradeneeded = (event) => {
				const db = event.target.result;
				if (!db.objectStoreNames.contains('todos')) {
					db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
				}
			};

			request.onsuccess = (event) => {
				this.db = event.target.result;
				this.loadToDos();
			};
		},
		loadToDos() {
			const transaction = this.db.transaction('todos', 'readonly');
			const store = transaction.objectStore('todos');
			const request = store.getAll();

			request.onsuccess = (event) => {
				event.target.result.forEach(item => this.todos.push(item));

				if (this.todos.length > 0) {
					this.lastId = this.todos[this.todos.length - 1].id;
				}
			};
		},
		addToDo() {
			if (this.newTodo.trim() === '') return;

			const data = {
				todo: this.newTodo,
			}

			const transaction = this.db.transaction('todos', 'readwrite');
			const store = transaction.objectStore('todos');
			store.add(data);

			// get last item id
			store.openCursor(null, 'prev').onsuccess = (event) => {
				console.log('Cursor', event);
				const cursor = event.target.result;
				if (cursor) {
					this.todos.push(cursor.value);
				}
			};

			transaction.oncomplete = () => {
				this.newTodo = '';
				setTimeout(() => this.$refs.todoInput && this.$refs.todoInput.focus(), 200);
			};
		},
		removeTodo(index, todo) {
			const transaction = this.db.transaction('todos', 'readwrite');
			const store = transaction.objectStore('todos');
			store.delete(todo.id);

			transaction.oncomplete = () => {
				this.todos.splice(index, 1);
			};
		}
	},
	mounted() {
		console.log('TODO');

		// init indexDB
		this.initDB();

		setTimeout(() => this.$refs.todoInput && this.$refs.todoInput.focus(), 200);
	}
});
