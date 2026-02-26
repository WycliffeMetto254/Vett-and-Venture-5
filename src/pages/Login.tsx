import React, { useState } from 'react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (role: UserRole, name: string, email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="bg-slate-900 p-10 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center tracking-tight">Vett & Venture Login</h2>
        <input 
          type="email" 
          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white mb-4 outline-none focus:border-blue-500" 
          placeholder="Enter your work email" 
          onChange={(e) => setEmail(e.target.value)}
        />
        <button 
          onClick={() => onLogin('founder', 'Founder', email)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all"
        >
          Open AI Workspace
        </button>
      </div>
    </div>
  );
};

export default Login;
