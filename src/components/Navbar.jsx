import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ArrowLeftRight,
  PiggyBank, LogOut, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getNotifications } from '../services/api';


export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    getNotifications()
      .then(r => setUnread(r.data.filter(n => !n.read).length))
      .catch(() => {});
  }, [location.pathname]);

  const logout = () => { logoutUser(); navigate('/login'); };

  const navStyle = {
    background: '#161b27',
    borderBottom: '1px solid #2a3348',
    padding: '0 2rem',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const linkStyle = (path) => ({
    display: 'flex', alignItems: 'center', gap: '7px',
    color: location.pathname === path ? '#4f8ef7' : '#8892a4',
    textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500,
    padding: '6px 12px', borderRadius: '8px',
    background: location.pathname === path ? '#1e2535' : 'transparent',
    transition: 'all .2s',
  });

  return (
    <nav style={navStyle}>
      <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800,
        fontSize:'1.2rem', color:'#4f8ef7', letterSpacing:'-0.02em' }}>
        FinFlow
      </span>

      <div style={{ display:'flex', gap:'8px' }}>
        <Link to="/dashboard" style={linkStyle('/dashboard')}>
          <LayoutDashboard size={16}/> Dashboard
        </Link>
        <Link to="/transactions" style={linkStyle('/transactions')}>
          <ArrowLeftRight size={16}/> Transactions
        </Link>
        <Link to="/budgets" style={linkStyle('/budgets')}>
                <PiggyBank size={16}/> Budgets
        </Link>
      </div>


      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        {/* Notification bell */}
        <div style={{ position:'relative', cursor:'pointer' }}>
          <Bell size={18} color="#8892a4"/>
          {unread > 0 && (
            <span style={{
              position:'absolute', top:'-5px', right:'-5px',
              background:'#ef4444', color:'#fff',
              borderRadius:'50%', width:'16px', height:'16px',
              fontSize:'10px', display:'flex',
              alignItems:'center', justifyContent:'center',
            }}>{unread}</span>
          )}
        </div>

        <span style={{ color:'#8892a4', fontSize:'0.85rem' }}>
          {user?.fullName}
        </span>

        <button className="btn btn-ghost" onClick={logout}
          style={{ display:'flex', alignItems:'center', gap:'6px',
            padding:'6px 12px', fontSize:'0.85rem' }}>
          <LogOut size={14}/> Logout
        </button>
      </div>
    </nav>
  );
}