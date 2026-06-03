import { useState, useEffect } from 'react';
import { getDashboard, getNotifications, markNotificationRead } from '../services/api';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, Wallet,
  Bell, ArrowRight, AlertTriangle
} from 'lucide-react';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const COLORS = [
  '#4f8ef7','#7c3aed','#22c55e','#f59e0b',
  '#ef4444','#06b6d4','#ec4899','#84cc16'
];
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="card" style={{
      display:'flex', alignItems:'center',
      gap:'1rem', flex:1
    }}>
      <div style={{
        width:48, height:48, borderRadius:12,
        background: color + '22',
        display:'flex', alignItems:'center', justifyContent:'center',
        flexShrink:0
      }}>
        <Icon size={22} color={color}/>
      </div>
      <div>
        <div style={{ color:'#8892a4', fontSize:'0.78rem',
          textTransform:'uppercase', letterSpacing:'.04em',
          marginBottom:4 }}>{label}</div>
        <div style={{ fontSize:'1.5rem', fontFamily:'Syne,sans-serif',
          fontWeight:700, color:'#e2e8f0' }}>
          ₹{Number(value || 0).toLocaleString('en-IN')}
        </div>
      </div>
    </div>
  );
}

function BudgetBar({ budget }) {
  const pct   = Math.min(budget.percentageUsed, 100);
  const color = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#22c55e';
  return (
    <div style={{ marginBottom:'1rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between',
        marginBottom:6, fontSize:'0.85rem' }}>
        <span>{budget.categoryIcon} {budget.categoryName}</span>
        <span style={{ color:'#8892a4' }}>
          ₹{Number(budget.spent||0).toLocaleString('en-IN')} /
          ₹{Number(budget.monthlyLimit||0).toLocaleString('en-IN')}
        </span>
      </div>
      <div style={{ height:8, background:'#1e2535',
        borderRadius:4, overflow:'hidden' }}>
        <div style={{
          height:'100%', width:`${pct}%`,
          background: color, borderRadius:4,
          transition:'width 0.5s ease'
        }}/>
      </div>
      <div style={{ textAlign:'right', fontSize:'0.75rem',
        color, marginTop:3 }}>{pct.toFixed(0)}%</div>
    </div>
  );
}
// Build last 6 months labels for trend chart
function getLast6Months() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun',
                  'Jul','Aug','Sep','Oct','Nov','Dec'];
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      label: months[d.getMonth()],
      month: d.getMonth() + 1,
      year: d.getFullYear()
    });
  }
  return result;
}
export default function DashboardPage() {
  const now   = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [data,  setData]  = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getDashboard(month, year),
      getNotifications()
    ])
      .then(([dashRes, notifRes]) => {
        setData(dashRes.data);
        setNotifications(notifRes.data.filter(n => !n.read).slice(0, 5));
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [month, year]);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifications(n => n.filter(x => x.id !== id));
  };

  const pieData = data?.expenseByCategory
    ? Object.entries(data.expenseByCategory).map(([name, value]) => ({
        name, value: Number(value)
      }))
    : [];

  const months = [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'
  ];
const [trendData, setTrendData] = useState([]);

useEffect(() => {
  const last6 = getLast6Months();
  Promise.all(
    last6.map(m =>
      getDashboard(m.month, m.year)
        .then(r => ({
          month: m.label,
          Income: Number(r.data.totalIncome  || 0),
          Expense: Number(r.data.totalExpense || 0),
        }))
        .catch(() => ({
          month: m.label, Income: 0, Expense: 0
        }))
    )
  ).then(setTrendData);
}, []);

  if (loading) return <Loader/>;

  return (
    <div>
      {/* Header row */}
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'center', marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.6rem', letterSpacing:'-0.02em' }}>
          Dashboard
        </h2>
        {/* Month / Year picker */}
        <div style={{ display:'flex', gap:'8px' }}>
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
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div style={{ marginBottom:'1.5rem' }}>
          {notifications.map(n => (
            <div key={n.id} style={{
              display:'flex', alignItems:'flex-start',
              gap:'10px', padding:'10px 14px',
              background: n.type === 'BUDGET_EXCEEDED'
                ? '#7f1d1d33' : '#78350f33',
              border: `1px solid ${n.type === 'BUDGET_EXCEEDED'
                ? '#ef4444' : '#f59e0b'}44`,
              borderRadius:8, marginBottom:8
            }}>
              <AlertTriangle size={16}
                color={n.type==='BUDGET_EXCEEDED' ? '#ef4444':'#f59e0b'}
                style={{ marginTop:2, flexShrink:0 }}/>
              <span style={{ fontSize:'0.875rem', flex:1 }}>
                {n.message}
              </span>
              <button onClick={() => handleMarkRead(n.id)}
                style={{ background:'none', border:'none',
                  color:'#8892a4', cursor:'pointer',
                  fontSize:'1.1rem', lineHeight:1 }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display:'flex', gap:'1rem', marginBottom:'1.5rem',
        flexWrap:'wrap' }}>
        <StatCard label="Total Income"
          value={data?.totalIncome}
          icon={TrendingUp} color="#22c55e"/>
        <StatCard label="Total Expense"
          value={data?.totalExpense}
          icon={TrendingDown} color="#ef4444"/>
        <StatCard label="Balance"
          value={data?.balance}
          icon={Wallet}
          color={Number(data?.balance||0) >= 0 ? '#4f8ef7' : '#ef4444'}/>
      </div>

      {/* Charts row */}
      <div style={{ display:'grid',
        gridTemplateColumns:'1fr 1fr', gap:'1rem',
        marginBottom:'1.5rem' }}>

        {/* Expense pie */}
        <div className="card">
          <h3 style={{ fontSize:'1rem', marginBottom:'1rem',
            color:'#8892a4', fontWeight:600,
            textTransform:'uppercase', letterSpacing:'.04em' }}>
            Expense Breakdown
          </h3>
          {pieData.length === 0
            ? <p style={{ color:'#8892a4', textAlign:'center',
                padding:'2rem 0' }}>No expenses this month</p>
            : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} dataKey="value"
                    nameKey="name" cx="50%" cy="50%"
                    outerRadius={80} innerRadius={40}>
                    {pieData.map((_, i) => (
                      <Cell key={i}
                        fill={COLORS[i % COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={v =>
                      `₹${Number(v).toLocaleString('en-IN')}`}
                    contentStyle={{
                      background:'#1e2535',
                      border:'1px solid #2a3348',
                      borderRadius:8, color:'#e2e8f0'
                    }}/>
                  <Legend
                    formatter={v => (
                      <span style={{ color:'#e2e8f0',
                        fontSize:'0.8rem' }}>{v}</span>
                    )}/>
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </div>
        {/* Monthly Trend Bar Chart */}
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <h3 style={{ fontSize:'1rem', marginBottom:'1rem',
            color:'#8892a4', fontWeight:600,
            textTransform:'uppercase', letterSpacing:'.04em' }}>
            6-Month Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trendData}
              margin={{ top:5, right:10, left:10, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3348"/>
              <XAxis dataKey="month"
                tick={{ fill:'#8892a4', fontSize:12 }}
                axisLine={{ stroke:'#2a3348' }}/>
              <YAxis
                tick={{ fill:'#8892a4', fontSize:12 }}
                axisLine={{ stroke:'#2a3348' }}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}/>
              <Tooltip
                contentStyle={{
                  background:'#1e2535',
                  border:'1px solid #2a3348',
                  borderRadius:8, color:'#e2e8f0'
                }}
                formatter={v => `₹${Number(v).toLocaleString('en-IN')}`}/>
              <Legend
                formatter={v => (
                  <span style={{ color:'#e2e8f0', fontSize:'0.8rem' }}>{v}</span>
                )}/>
              <Bar dataKey="Income"  fill="#22c55e" radius={[4,4,0,0]}/>
              <Bar dataKey="Expense" fill="#ef4444" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Budget health */}
        <div className="card">
          <h3 style={{ fontSize:'1rem', marginBottom:'1rem',
            color:'#8892a4', fontWeight:600,
            textTransform:'uppercase', letterSpacing:'.04em' }}>
            Budget Health
          </h3>
          {!data?.budgets?.length
            ? <p style={{ color:'#8892a4', textAlign:'center',
                padding:'2rem 0', fontSize:'0.875rem' }}>
                No budgets set.{' '}
                <Link to="/transactions"
                  style={{ color:'#4f8ef7' }}>
                  Add one
                </Link>
              </p>
            : data.budgets.map(b => (
                <BudgetBar key={b.id} budget={b}/>
              ))
          }
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between',
          alignItems:'center', marginBottom:'1rem' }}>
          <h3 style={{ fontSize:'1rem', color:'#8892a4',
            fontWeight:600, textTransform:'uppercase',
            letterSpacing:'.04em' }}>
            Recent Transactions
          </h3>
          <Link to="/transactions"
            style={{ color:'#4f8ef7', fontSize:'0.85rem',
              textDecoration:'none', display:'flex',
              alignItems:'center', gap:4 }}>
            View all <ArrowRight size={14}/>
          </Link>
        </div>

        {!data?.recentTransactions?.length
          ? <p style={{ color:'#8892a4', textAlign:'center',
              padding:'1.5rem 0' }}>
              No transactions yet
            </p>
          : data.recentTransactions.map(t => (
              <div key={t.id} style={{
                display:'flex', justifyContent:'space-between',
                alignItems:'center', padding:'10px 0',
                borderBottom:'1px solid #2a3348'
              }}>
                <div style={{ display:'flex',
                  alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:'1.3rem' }}>
                    {t.categoryIcon}
                  </span>
                  <div>
                    <div style={{ fontSize:'0.9rem' }}>
                      {t.description}
                    </div>
                    <div style={{ fontSize:'0.75rem',
                      color:'#8892a4' }}>
                      {t.categoryName} · {t.transactionDate}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontWeight:600, fontSize:'0.95rem',
                  color: t.type === 'INCOME'
                    ? '#22c55e' : '#ef4444'
                }}>
                  {t.type === 'INCOME' ? '+' : '-'}
                  ₹{Number(t.amount).toLocaleString('en-IN')}
                </span>
              </div>
            ))
        }
      </div>
    </div>
  );
}