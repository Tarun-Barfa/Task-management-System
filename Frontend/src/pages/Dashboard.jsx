import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');

  useEffect(() => {
    if (!token) navigate('/');
  }, []);

  const [apiOnline, setApiOnline] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState('mine');
  const [logs, setLogs] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    apiRequest('/health').then(() => setApiOnline(true)).catch(() => setApiOnline(false));
  }, []);

  function logActivity(method, endpoint, code, ms) {
    const ok = code >= 200 && code < 300;
    setLogs((prev) => [{ text: `${method} ${endpoint} — ${code} — ${ms}ms`, ok }, ...prev]);
  }

  async function request(endpoint, method = 'GET', body = null) {
    const start = performance.now();
    try {
      const res = await apiRequest(endpoint, method, body, true);
      logActivity(method, endpoint, res.status, Math.round(performance.now() - start));
      return res;
    } catch (err) {
      logActivity(method, endpoint, err.status || 500, Math.round(performance.now() - start));
      throw err;
    }
  }

  async function loadTasks() {
    const endpoint = view === 'all' ? '/tasks/all' : '/tasks';
    const params = new URLSearchParams({ page, limit: 5 });
    if (statusFilter) params.set('status', statusFilter);

    try {
      const res = await request(`${endpoint}?${params}`);
      setTasks(res.data);
      setPages(res.pages);
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [page, statusFilter, view]);

  function startEdit(task) {
    setEditingId(task._id);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
  }

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setStatus('pending');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const body = { title, description, status };
    try {
      if (editingId) {
        await request(`/tasks/${editingId}`, 'PUT', body);
      } else {
        await request('/tasks', 'POST', body);
      }
      resetForm();
      loadTasks();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return;
    try {
      await request(`/tasks/${id}`, 'DELETE');
      loadTasks();
    } catch (err) {
      alert(err.message);
    }
  }

  function logout() {
    localStorage.clear();
    navigate('/');
  }

  return (
    <>
      <div className="topbar">
        <span className="eyebrow">TASKFLOW</span>
        <div className="topbar-right">
          <span className={`status-dot ${apiOnline === null ? '' : apiOnline ? 'online' : 'offline'}`}></span>
          <span className="user-name">{name}</span>
          <span className={`pill ${role === 'admin' ? 'pill-admin' : 'pill-muted'}`}>{role}</span>
          <button className="btn-ghost" onClick={logout}>Log out</button>
        </div>
      </div>

      <main className="dashboard">
        <section className="panel add-panel">
          <h2>{editingId ? 'Edit task' : 'Add a task'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <input placeholder=" " required value={title} onChange={(e) => setTitle(e.target.value)} />
              <label>Title</label>
            </div>
            <div className="field">
              <input placeholder=" " value={description} onChange={(e) => setDescription(e.target.value)} />
              <label>Description (optional)</label>
            </div>
            <div className="field select-field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn">{editingId ? 'Update task' : 'Add task'}</button>
              {editingId && <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        </section>

        <section className="panel list-panel">
          <div className="list-header">
            <div className="filter-bar">
              {['', 'pending', 'in-progress', 'done'].map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${statusFilter === f ? 'active' : ''}`}
                  onClick={() => { setStatusFilter(f); setPage(1); }}
                >
                  {f === '' ? 'All' : f === 'in-progress' ? 'In progress' : f[0].toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            {role === 'admin' && (
              <div className="view-toggle">
                <button className={`filter-btn ${view === 'mine' ? 'active' : ''}`} onClick={() => { setView('mine'); setPage(1); }}>My tasks</button>
                <button className={`filter-btn ${view === 'all' ? 'active' : ''}`} onClick={() => { setView('all'); setPage(1); }}>All tasks (admin)</button>
              </div>
            )}
          </div>

          <div className="task-list">
            {tasks.map((task) => (
              <div className="task-row" key={task._id}>
                <span className={`task-dot ${task.status}`}></span>
                <div className="task-main">
                  <div className={`task-title ${task.status === 'done' ? 'done-text' : ''}`}>{task.title}</div>
                  {task.description && <div className="task-desc">{task.description}</div>}
                  {view === 'all' && task.user && <div className="task-owner">owner: {task.user.name}</div>}
                </div>
                <div className="task-actions">
                  <button className="icon-btn" onClick={() => startEdit(task)}>Edit</button>
                  <button className="icon-btn danger" onClick={() => handleDelete(task._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          {tasks.length === 0 && <div className="empty-state">No tasks yet. Add your first one above.</div>}

          {pages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span>Page {page} of {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          )}
        </section>

        <section className="panel log-panel">
          <h2>Activity log</h2>
          <div className="log-body">
            {logs.map((log, i) => (
              <div key={i} className={`log-line ${log.ok ? 'ok' : 'err'}`}>{log.text}</div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}