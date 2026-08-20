import { Box, LayoutDashboard, LogOut, Plus, Store } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Brand from './Brand'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function DashboardShell({ children }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  async function signOut() { await supabase.auth.signOut(); navigate('/') }
  return <main className="dashboard"><aside className="dash-side"><Brand /><nav><Link className="active" to="/dashboard"><LayoutDashboard />Обзор</Link><Link to="/dashboard"><Box />Товары</Link><Link to="/dashboard/store/new"><Store />Магазин</Link></nav><div className="profile"><span>{user?.email?.[0].toUpperCase()}</span><div><b>Продавец</b><small>{user?.email}</small></div></div><button className="sign-out" onClick={signOut}><LogOut />Выйти</button></aside><section className="dash-main">{children}</section><Link className="mobile-add" to="/dashboard/products/new"><Plus /></Link></main>
}
