import { useState, useEffect } from 'react';
import { getBudgets, createOrUpdateBudget, getCategories } from '../services/api';
import { Plus, X, PiggyBank } from 'lucide-react';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const now = new Date();

function BudgetModal({ open, onClose, onSave, categories }) {
  const [form, setForm] = useState({
    categoryId: '', monthlyLimit: '',
    month: now.getMonth() + 1, year: now.getFullYear()
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({
      categoryId: '', monthlyLimit: '',
      month: now.getMonth() + 1, year: now.getFullYear()
    });
  }, [open]);

  if (!open) return null;

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        categoryId: parseInt(form.categoryId),
        monthlyLimit: parseFloat(form.monthlyLimit)
      });
    } finally { setSaving(false); }
  };

  return (
    <div style={{
      position:'fixed', inset:0, background:'#000a',
      display:'flex', alignItems:'center',
      justifyContent:'center', zIndex:999, padding:'1rem'
    }}>
      <div className="card" style={{
        width:'100%', maxWidth:'420px',
        padding:'1.75rem', position:'relative'
      }}>
        <button onClick={onClose} style={{
          position:'absolute', top:16, right:16,
          background:'none', border:'none',
          color:'#8892a4', cursor:'pointer'
        }}><X size={20}/></button>

        <h3 style={{ marginBottom:'1.25rem', fontSize:'1.15rem' }}>
          Set Monthly Budget
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category</label>
            <select value={form.categoryId}
              onChange={e => setForm({...form, categoryId: e.target.value})}
              required>
              <option value="">Select category</option>
              {expenseCategories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Monthly Limit (₹)</label>
            <input type="number" min="1" step="0.01"
              placeholder="e.g. 5000"
              value={form.monthlyLimit}
              onChange={e => setForm({...form, monthlyLimit: e.target.value})}
              required/>
          </div>

          <div style={{ display:'flex', gap:8 }}>
            <div className="form-group" style={{ flex:1 }}>
              <label>Month</label>
              <select value={form.month}
                onChange={e => setForm({...form, month: Number(e.target.value)})}>
                {['Jan','Feb','Mar','Apr','May','Jun',
                  'Jul','Aug','Sep','Oct','Nov','Dec'
                ].map((m,i) => (
                  <option key={i} value={i+1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex:1 }}>
              <label>Year</label>
              <select value={form.year}
                onChange={e => setForm({...form, year: Number(e.target.value)})}>
                {[2024,2025,2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display:'flex', gap:8, marginTop:'0.5rem' }}>
            <button type="button" className="btn btn-ghost"
              onClick={onClose} style={{ flex:1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary"
              disabled={saving} style={{ flex:2 }}>
              {saving ? 'Saving...' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BudgetCard({ budget }) {
  const pct   = Math.min(budget.percentageUsed, 100);
  const color = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#22c55e';
  const remaining = budget.monthlyLimit - budget.spent;

  return (
    <div className="card" style={{ padding:'1.25rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'flex-start', marginBottom:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:'1.8rem' }}>{budget.categoryIcon}</span>
          <div>
            <div style={{ fontWeight:600, fontSize:'0.95rem' }}>
              {budget.categoryName}
            </div>
            <div style={{ color:'#8892a4', fontSize:'0.78rem', marginTop:2 }}>
              Monthly budget
            </div>
          </div>
        </div>
        <div style={{
          background: color + '22',
          color, padding:'3px 10px',
          borderRadius:20, fontSize:'0.78rem', fontWeight:600
        }}>
          {pct.toFixed(0)}% used
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height:8, background:'#1e2535',
        borderRadius:4, overflow:'hidden', marginBottom:'0.75rem' }}>
        <div style={{
          height:'100%', width:`${pct}%`,
          background: color, borderRadius:4,
          transition:'width 0.5s ease'
        }}/>
      </div>

      {/* Stats row */}
      <div style={{ display:'flex',
        justifyContent:'space-between', fontSize:'0.82rem' }}>
        <div>
          <div style={{ color:'#8892a4' }}>Spent</div>
          <div style={{ color:'#ef4444', fontWeight:600 }}>
            ₹{Number(budget.spent||0).toLocaleString('en-IN')}
          </div>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ color:'#8892a4' }}>Remaining</div>
          <div style={{
            color: remaining >= 0 ? '#22c55e' : '#ef4444',
            fontWeight:600
          }}>
            ₹{Math.abs(remaining).toLocaleString('en-IN')}
            {remaining < 0 ? ' over' : ''}
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ color:'#8892a4' }}>Limit</div>
          <div style={{ color:'#e2e8f0', fontWeight:600 }}>
            ₹{Number(budget.monthlyLimit).toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BudgetsPage() {
  const [budgets,    setBudgets]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());

  const months = ['Jan','Feb','Mar','Apr','May','Jun',
                  'Jul','Aug','Sep','Oct','Nov','Dec'];

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        getBudgets(month, year),
        getCategories()
      ]);
      setBudgets(bRes.data);
      setCategories(cRes.data);
    } catch {
      toast.error('Failed to load budgets');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, [month, year]);

  const handleSave = async (form) => {
    try {
      await createOrUpdateBudget(form);
      toast.success('Budget saved! 🎯');
      setModalOpen(false);
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
      throw err;
    }
  };

  // Summary stats
  const totalLimit = budgets.reduce(
    (s, b) => s + Number(b.monthlyLimit), 0);
  const totalSpent = budgets.reduce(
    (s, b) => s + Number(b.spent || 0), 0);
  const overBudget = budgets.filter(b => b.percentageUsed >= 100).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'center', marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.6rem', letterSpacing:'-0.02em' }}>
          Budgets
        </h2>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <select value={month}
            onChange={e => setMonth(Number(e.target.value))}
            style={{ width:'auto', padding:'6px 12px' }}>
            {months.map((m,i) => (
              <option key={i} value={i+1}>{m}</option>
            ))}
          </select>
          <select value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{ width:'auto', padding:'6px 12px' }}>
            {[2024,2025,2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button className="btn btn-primary"
            onClick={() => setModalOpen(true)}
            style={{ display:'flex', alignItems:'center', gap:6 }}>
            <Plus size={16}/> Set Budget
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {budgets.length > 0 && (
        <div style={{ display:'flex', gap:'1rem',
          marginBottom:'1.5rem', flexWrap:'wrap' }}>
          {[
            { label:'Total Budget',
              value:`₹${totalLimit.toLocaleString('en-IN')}`,
              color:'#4f8ef7' },
            { label:'Total Spent',
              value:`₹${totalSpent.toLocaleString('en-IN')}`,
              color:'#ef4444' },
            { label:'Categories Over Budget',
              value: overBudget,
              color: overBudget > 0 ? '#ef4444' : '#22c55e' },
          ].map(s => (
            <div key={s.label} className="card"
              style={{ flex:1, minWidth:140 }}>
              <div style={{ color:'#8892a4', fontSize:'0.78rem',
                textTransform:'uppercase', letterSpacing:'.04em',
                marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:'1.5rem',
                fontFamily:'Syne,sans-serif',
                fontWeight:700, color: s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Budget cards grid */}
      {loading
        ? <Loader/>
        : budgets.length === 0
          ? (
            <div className="card" style={{
              textAlign:'center', padding:'3rem'
            }}>
              <PiggyBank size={48} color="#2a3348"
                style={{ marginBottom:'1rem' }}/>
              <h3 style={{ marginBottom:'0.5rem', color:'#8892a4' }}>
                No budgets for {months[month-1]} {year}
              </h3>
              <p style={{ color:'#8892a4', fontSize:'0.875rem',
                marginBottom:'1.5rem' }}>
                Set spending limits per category to track
                your budget health
              </p>
              <button className="btn btn-primary"
                onClick={() => setModalOpen(true)}>
                <Plus size={14} style={{ marginRight:6 }}/>
                Set your first budget
              </button>
            </div>
          )
          : (
            <div style={{ display:'grid',
              gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',
              gap:'1rem' }}>
              {budgets.map(b => (
                <BudgetCard key={b.id} budget={b}/>
              ))}
            </div>
          )
      }

      <BudgetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        categories={categories}
      />
    </div>
  );
}