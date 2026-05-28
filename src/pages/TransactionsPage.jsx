import { useState, useEffect, useCallback } from 'react';
import {
  getTransactions, createTransaction,
  updateTransaction, deleteTransaction,
  getCategories
} from '../services/api';
import { Plus, Pencil, Trash2, ChevronLeft,
  ChevronRight, X } from 'lucide-react';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  amount: '', description: '',
  transactionDate: new Date().toISOString().split('T')[0],
  type: 'EXPENSE', categoryId: ''
};

/* ── Modal ─────────────────────────────────────────── */
function TransactionModal({ open, onClose, onSave,
  categories, initial }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial
        ? {
            amount: initial.amount,
            description: initial.description,
            transactionDate: initial.transactionDate,
            type: initial.type,
            categoryId: categories.find(
              c => c.name === initial.categoryName)?.id || ''
          }
        : EMPTY_FORM
      );
    }
  }, [open, initial]);

  if (!open) return null;

  const filteredCategories = categories.filter(
    c => c.type === form.type
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form,
        amount: parseFloat(form.amount),
        categoryId: parseInt(form.categoryId) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position:'fixed', inset:0, background:'#000a',
      display:'flex', alignItems:'center',
      justifyContent:'center', zIndex:999, padding:'1rem'
    }}>
      <div className="card" style={{
        width:'100%', maxWidth:'460px',
        padding:'1.75rem', position:'relative'
      }}>
        <button onClick={onClose} style={{
          position:'absolute', top:16, right:16,
          background:'none', border:'none',
          color:'#8892a4', cursor:'pointer'
        }}>
          <X size={20}/>
        </button>

        <h3 style={{ marginBottom:'1.25rem', fontSize:'1.15rem' }}>
          {initial ? 'Edit Transaction' : 'Add Transaction'}
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Type toggle */}
          <div className="form-group">
            <label>Type</label>
            <div style={{ display:'flex', gap:8 }}>
              {['EXPENSE','INCOME'].map(t => (
                <button key={t} type="button"
                  onClick={() => setForm({
                    ...form, type:t, categoryId:'' })}
                  style={{
                    flex:1, padding:'8px',
                    borderRadius:8, border:'1px solid',
                    cursor:'pointer', fontWeight:600,
                    fontSize:'0.85rem', transition:'all .2s',
                    borderColor: form.type === t
                      ? (t==='INCOME' ? '#22c55e' : '#ef4444')
                      : '#2a3348',
                    background: form.type === t
                      ? (t==='INCOME' ? '#16653444' : '#7f1d1d44')
                      : 'transparent',
                    color: form.type === t
                      ? (t==='INCOME' ? '#22c55e' : '#ef4444')
                      : '#8892a4'
                  }}>
                  {t === 'INCOME' ? '↑ Income' : '↓ Expense'}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Amount (₹)</label>
            <input type="number" min="0.01" step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={e => setForm({
                ...form, amount: e.target.value })}
              required/>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input placeholder="e.g. Lunch at Murugan Idli"
              value={form.description}
              onChange={e => setForm({
                ...form, description: e.target.value })}
              required/>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select value={form.categoryId}
              onChange={e => setForm({
                ...form, categoryId: e.target.value })}
              required>
              <option value="">Select category</option>
              {filteredCategories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input type="date"
              value={form.transactionDate}
              onChange={e => setForm({
                ...form, transactionDate: e.target.value })}
              required/>
          </div>

          <div style={{ display:'flex', gap:8, marginTop:'0.5rem' }}>
            <button type="button" className="btn btn-ghost"
              onClick={onClose} style={{ flex:1 }}>
              Cancel
            </button>
            <button type="submit"
              className="btn btn-primary"
              disabled={saving} style={{ flex:2 }}>
              {saving
                ? 'Saving...'
                : (initial ? 'Update' : 'Add Transaction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Delete confirm modal ───────────────────────────── */
function DeleteModal({ open, onClose, onConfirm, deleting }) {
  if (!open) return null;
  return (
    <div style={{
      position:'fixed', inset:0, background:'#000a',
      display:'flex', alignItems:'center',
      justifyContent:'center', zIndex:999
    }}>
      <div className="card"
        style={{ maxWidth:'360px', width:'90%', padding:'1.75rem' }}>
        <h3 style={{ marginBottom:'0.75rem' }}>Delete Transaction?</h3>
        <p style={{ color:'#8892a4', fontSize:'0.9rem',
          marginBottom:'1.5rem' }}>
          This action cannot be undone.
        </p>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost"
            onClick={onClose} style={{ flex:1 }}>
            Cancel
          </button>
          <button className="btn btn-danger"
            onClick={onConfirm} disabled={deleting}
            style={{ flex:1 }}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────── */
export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(0);
  const [pageInfo, setPageInfo] = useState({});
  const [filter,   setFilter]   = useState('ALL');
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [deleteTarget,setDeleteTarget]= useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, catRes] = await Promise.all([
        getTransactions(page, 10),
        getCategories()
      ]);
      setTransactions(txRes.data.content);
      setPageInfo(txRes.data);
      setCategories(catRes.data);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSave = async (form) => {
    try {
      if (editTarget) {
        await updateTransaction(editTarget.id, form);
        toast.success('Transaction updated');
      } else {
        await createTransaction(form);
        toast.success('Transaction added 🎉');
      }
      setModalOpen(false);
      setEditTarget(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
      throw err;
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTransaction(deleteTarget.id);
      toast.success('Transaction deleted');
      setDeleteTarget(null);
      fetchAll();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const displayed = filter === 'ALL'
    ? transactions
    : transactions.filter(t => t.type === filter);

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'center', marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.6rem', letterSpacing:'-0.02em' }}>
          Transactions
        </h2>
        <button className="btn btn-primary"
          onClick={() => {
            setEditTarget(null);
            setModalOpen(true);
          }}
          style={{ display:'flex', alignItems:'center', gap:6 }}>
          <Plus size={16}/> Add Transaction
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display:'flex', gap:8, marginBottom:'1.25rem' }}>
        {['ALL','INCOME','EXPENSE'].map(f => (
          <button key={f}
            className={filter === f ? 'btn btn-primary' : 'btn btn-ghost'}
            onClick={() => setFilter(f)}
            style={{ padding:'6px 16px', fontSize:'0.85rem' }}>
            {f === 'ALL' ? 'All' :
              f === 'INCOME' ? '↑ Income' : '↓ Expense'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        {loading
          ? <Loader/>
          : displayed.length === 0
            ? (
              <div style={{ textAlign:'center', padding:'3rem',
                color:'#8892a4' }}>
                No transactions found.{' '}
                <button className="btn btn-primary"
                  onClick={() => setModalOpen(true)}
                  style={{ marginLeft:8 }}>
                  Add one
                </button>
              </div>
            )
            : (
              <table style={{ width:'100%',
                borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #2a3348' }}>
                    {['Date','Description','Category',
                      'Type','Amount','Actions'].map(h => (
                      <th key={h} style={{
                        padding:'12px 16px', textAlign:'left',
                        color:'#8892a4', fontSize:'0.78rem',
                        fontWeight:600, textTransform:'uppercase',
                        letterSpacing:'.04em',
                        fontFamily:'DM Sans,sans-serif'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((t, i) => (
                    <tr key={t.id} style={{
                      borderBottom:'1px solid #2a3348',
                      background: i % 2 === 0
                        ? 'transparent' : '#ffffff05',
                      transition:'background .15s'
                    }}
                    onMouseEnter={e =>
                      e.currentTarget.style.background='#ffffff08'}
                    onMouseLeave={e =>
                      e.currentTarget.style.background=
                        i%2===0?'transparent':'#ffffff05'}>

                      <td style={{ padding:'13px 16px',
                        color:'#8892a4', fontSize:'0.85rem' }}>
                        {t.transactionDate}
                      </td>

                      <td style={{ padding:'13px 16px',
                        fontSize:'0.9rem', maxWidth:200 }}>
                        <div style={{ fontWeight:500 }}>
                          {t.description}
                        </div>
                      </td>

                      <td style={{ padding:'13px 16px' }}>
                        <span style={{ fontSize:'0.85rem',
                          color:'#8892a4' }}>
                          {t.categoryIcon} {t.categoryName}
                        </span>
                      </td>

                      <td style={{ padding:'13px 16px' }}>
                        <span className={`badge badge-${
                          t.type.toLowerCase()}`}>
                          {t.type === 'INCOME' ? '↑' : '↓'} {t.type}
                        </span>
                      </td>

                      <td style={{ padding:'13px 16px',
                        fontWeight:600, fontSize:'0.95rem',
                        color: t.type === 'INCOME'
                          ? '#22c55e' : '#ef4444' }}>
                        {t.type === 'INCOME' ? '+' : '-'}
                        ₹{Number(t.amount)
                          .toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding:'13px 16px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          <button
                            onClick={() => {
                              setEditTarget(t);
                              setModalOpen(true);
                            }}
                            title="Edit"
                            style={{
                              background:'#1e2535',
                              border:'1px solid #2a3348',
                              color:'#8892a4', borderRadius:6,
                              padding:'5px 8px', cursor:'pointer',
                              transition:'all .2s'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.color='#4f8ef7';
                              e.currentTarget.style.borderColor='#4f8ef7';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.color='#8892a4';
                              e.currentTarget.style.borderColor='#2a3348';
                            }}>
                            <Pencil size={14}/>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(t)}
                            title="Delete"
                            style={{
                              background:'#1e2535',
                              border:'1px solid #2a3348',
                              color:'#8892a4', borderRadius:6,
                              padding:'5px 8px', cursor:'pointer',
                              transition:'all .2s'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.color='#ef4444';
                              e.currentTarget.style.borderColor='#ef4444';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.color='#8892a4';
                              e.currentTarget.style.borderColor='#2a3348';
                            }}>
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
        }

        {/* Pagination */}
        {!loading && pageInfo.totalPages > 1 && (
          <div style={{
            display:'flex', alignItems:'center',
            justifyContent:'space-between',
            padding:'12px 16px',
            borderTop:'1px solid #2a3348'
          }}>
            <span style={{ color:'#8892a4', fontSize:'0.85rem' }}>
              Page {(pageInfo.pageNumber||0)+1} of {pageInfo.totalPages}
              {' '}· {pageInfo.totalElements} total
            </span>
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn btn-ghost"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                style={{ padding:'6px 10px' }}>
                <ChevronLeft size={16}/>
              </button>
              <button className="btn btn-ghost"
                disabled={pageInfo.last}
                onClick={() => setPage(p => p + 1)}
                style={{ padding:'6px 10px' }}>
                <ChevronRight size={16}/>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        categories={categories}
        initial={editTarget}
      />
      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}