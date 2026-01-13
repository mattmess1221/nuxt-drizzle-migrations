<script setup lang="ts">
interface Todo {
  id: number
  title: string
  completed: boolean
}

const { data: todos } = await useFetch<Todo[]>('/api/todos', {
  default: () => [],
  deep: true,
})

const newTodoTitle = ref('')

async function addTodo() {
  const todo = await $fetch<Todo>('/api/todos', {
    method: 'POST',
    body: { title: newTodoTitle.value },
  })
  todos.value.push(todo)
  newTodoTitle.value = ''
}

async function toggleTodoState(todo: Todo) {
  // Implement toggle logic here
  await $fetch(`/api/todos/${todo.id}`, {
    method: 'PATCH',
    body: { completed: !todo.completed },
  })
  todo.completed = !todo.completed
}

async function removeTodo(todo: Todo) {
  // Implement remove logic here
  await $fetch(`/api/todos/${todo.id}`, {
    method: 'DELETE',
  })
  todos.value.splice(todos.value.indexOf(todo), 1)
}

async function clearTodos() {
  // Implement clear all todos logic here
  await $fetch('/api/todos', {
    method: 'DELETE',
  })
  todos.value = []
}
</script>

<template>
  <div>
    <h1>Todo List</h1>
    <form @submit.prevent="addTodo">
      <input v-model="newTodoTitle" placeholder="New todo title" required>
      <button :disabled="!newTodoTitle" type="submit">
        Add
      </button>
    </form>
    <ul>
      <li v-for="todo in todos" :key="todo.id">
        <input type="checkbox" :checked="todo.completed" @change="toggleTodoState(todo)">
        <span>{{ todo.title }}</span>
        <button title="Remove todo" @click="removeTodo(todo)">
          &Cross;
        </button>
      </li>
    </ul>
    <button :disabled="todos.length === 0" @click="clearTodos">
      Clear all Todos
    </button>
  </div>
</template>

<style scoped>
ul {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0 8px;
  grid-template-columns: 1rem max-content 1rem;
}
li {
  display: grid;
  grid-column: 1 / span 3;
  grid-template-columns: subgrid;
}
li:not(:last-child) {
  border-bottom: 1px solid #ccc;
  margin-bottom: 0.5rem;
}
li > button {
  width: 1rem;
  height: 1rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 1px;
  margin-left: 2rem;
}
</style>
