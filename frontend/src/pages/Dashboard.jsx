import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TaskBoard from '../components/TaskBoard';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('Medium');
  
  useEffect(() => {
    fetchTasks();
    if (user?.role === 'Admin' || user?.role === 'Manager') {
      fetchUsers();
    }
  }, [user]);


  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data.tasks);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
      if (res.data.length > 0) {
        setAssignedTo(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks', 
        { title, assignedTo, priority },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      fetchTasks();
    } catch (err) {
      alert('Error creating task');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
    } catch (err) {
      alert('Error updating task');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Task Manager ({user?.role})</h1>
        <div className="flex gap-4 items-center">
          <span>{user?.name}</span>
          <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
        </div>
      </nav>

      <div className="p-6">
        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="text-lg font-bold mb-4">Create Task</h2>
            <form onSubmit={handleCreateTask} className="flex gap-4">
              <input 
                type="text" placeholder="Task Title" required
                className="border p-2 rounded flex-1"
                value={title} onChange={e => setTitle(e.target.value)}
              />
              <select 
                className="border p-2 rounded"
                value={priority} onChange={e => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <select 
                className="border p-2 rounded"
                value={assignedTo} onChange={e => setAssignedTo(e.target.value)}
              >
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
            </form>
          </div>
        )}

        <TaskBoard tasks={tasks} updateTaskStatus={updateTaskStatus} />
      </div>
    </div>
  );
}
