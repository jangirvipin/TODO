import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/todos";

const TODO = () => {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [editTask, setEditTask] = useState(null);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(API_URL);
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  // Add a new todo
  const addTodo = async () => {
    if (!task) return alert("Task cannot be empty!");
    try {
      const response = await axios.post(API_URL, { task });
      setTodos([...todos, response.data]);
      setTask("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  // Update an existing todo
  const updateTodo = async (id) => {
    if (!editTask) return alert("Task cannot be empty!");
    try {
      const response = await axios.put(`${API_URL}/${id}`, { task: editTask });
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, task: response.data.task } : todo
        )
      );
      setEditTask(null);
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  // Delete a todo
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">Todo App</h1>

        {/* Add Todo */}
        <div className="flex items-center mb-6">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addTodo}
            className="px-4 py-2 text-white bg-blue-500 rounded-r-md hover:bg-blue-600"
          >
            Add
          </button>
        </div>

        {/* Todo List */}
        <ul className="space-y-4">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-md shadow-sm">
              {editTask && editTask.id === todo.id ? (
                <>
                  <input
                    type="text"
                    value={editTask.task}
                    onChange={(e) =>
                      setEditTask({ ...editTask, task: e.target.value })
                    }
                    className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="ml-2 space-x-2">
                    <button
                      onClick={() => updateTodo(todo.id)}
                      className="px-3 py-1 text-white bg-green-500 rounded-md hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditTask(null)}
                      className="px-3 py-1 text-white bg-gray-400 rounded-md hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="flex-1 text-gray-800">{todo.task}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => setEditTask({ id: todo.id, task: todo.task })}
                      className="px-3 py-1 text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="px-3 py-1 text-white bg-red-500 rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TODO;
