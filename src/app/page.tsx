'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Rocket, Database, Smartphone, CheckCircle, XCircle } from 'lucide-react';

export default function Home() {
  const [isPwa, setIsPwa] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwa(true);
    }


    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });


    async function checkSupabase() {
      try {
        const { error } = await supabase.from('test').select('count').limit(1);
        if (error && error.code === 'PGRST301') {

        }
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')) {
          setSupabaseConnected(false);
        } else {
          setSupabaseConnected(true);
        }
      } catch (e) {
        setSupabaseConnected(false);
      }
    }
    checkSupabase();
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 mb-4">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
            Next.js PWA Demo
          </h1>
          <p className="text-slate-400 text-lg">
            A proof of concept for your PWA architecture.
          </p>
        </div>

        <div className="grid gap-4">

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 flex items-center justify-between transition-all hover:bg-slate-800/70">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">PWA Status</h3>
                <p className="text-sm text-slate-400">
                  {isPwa ? 'Running as App' : 'Running in Browser'}
                </p>
              </div>
            </div>
            {isPwa ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  Install
                </button>
              )
            )}
          </div>


          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 flex items-center justify-between transition-all hover:bg-slate-800/70">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">Supabase</h3>
                <p className="text-sm text-slate-400">
                  {supabaseConnected === null ? 'Checking...' : supabaseConnected ? 'Connected' : 'Not Configured'}
                </p>
              </div>
            </div>
            {supabaseConnected ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
          </div>
        </div>

        {/* Todo Demo Section */}
        {supabaseConnected && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-200">Todo List Demo</h2>
              <span className="text-xs text-slate-500 px-2 py-1 bg-slate-800 rounded-full">Live Data</span>
            </div>

            <TodoList />
          </div>
        )}

        <div className="pt-8 text-center">
          <p className="text-xs text-slate-500">
            Edit <code className="bg-slate-800 px-1 py-0.5 rounded">.env.local</code> to connect your Supabase project.
          </p>
        </div>
      </div>
    </main>
  );
}

function TodoList() {
  const [todos, setTodos] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('inserted_at', { ascending: false });

      if (error) console.error('Error fetching todos:', error);
      else setTodos(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;

    const { error } = await supabase
      .from('todos')
      .insert([{ task: newTask }]);

    if (error) {
      console.error('Error adding todo:', error);
    } else {
      setNewTask('');
      fetchTodos();
    }
  }

  async function toggleTodo(id: number, is_complete: boolean) {
    const { error } = await supabase
      .from('todos')
      .update({ is_complete: !is_complete })
      .eq('id', id);

    if (error) {
      console.error('Error updating todo:', error);
    } else {
      fetchTodos();
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addTodo} className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!newTask.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
        >
          Add
        </button>
      </form>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <p className="text-center text-sm text-slate-500 py-4">Loading tasks...</p>
        ) : todos.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-4">No tasks yet. Add one!</p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              onClick={() => toggleTodo(todo.id, todo.is_complete)}
              className={`flex items-center gap-3 p-3 rounded-lg border border-slate-700/50 cursor-pointer transition-all hover:bg-slate-700/30 ${todo.is_complete ? 'opacity-50 bg-slate-800/30' : 'bg-slate-800/50'
                }`}
            >
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${todo.is_complete ? 'bg-green-500/20 border-green-500 text-green-500' : 'border-slate-500 text-transparent'
                }`}>
                <CheckCircle className="w-3 h-3" />
              </div>
              <span className={`text-sm ${todo.is_complete ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {todo.task}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
