import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role);
      navigate('/login');
    } catch (err) {
      alert(`Registration failed: ${err.response?.data?.message || err.message}`);
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="Name" className="w-full p-2 border rounded"
            value={name} onChange={e => setName(e.target.value)} required 
          />
          <input 
            type="email" placeholder="Email" className="w-full p-2 border rounded"
            value={email} onChange={e => setEmail(e.target.value)} required 
          />
          <input 
            type="password" placeholder="Password" className="w-full p-2 border rounded"
            value={password} onChange={e => setPassword(e.target.value)} required 
          />
          <select 
            className="w-full p-2 border rounded"
            value={role} onChange={e => setRole(e.target.value)}
          >
            <option value="User">User</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
          <button className="w-full bg-blue-600 text-white p-2 rounded">Register</button>
        </form>
        <p className="mt-4 text-center">
          Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
        </p>
      </div>
    </div>
  );
}
