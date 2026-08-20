import { Box, LayoutDashboard, LogOut, Plus, ReceiptText, Store } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import Brand from './Brand'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function DashboardShell({ children }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  async function signOut() { await supabase.auth.signOut(); navigate('/') }
  return <main className="dashboard"><aside className="dash-side"><Brand /><nav><NavLink end to="/dashboard"><LayoutDashboard />Обзор</NavLink><NavLink to="/dashboard/products"><Box />Товары</NavLink><NavLink to="/dashboard/sales"><ReceiptText />Продажи</NavLink><NavLink to="/dashboard/store/new"><Store />Магазин</NavLink></nav><div className="profile"><span>{user?.email?.[0].toUpperCase()}</span><div><b>Продавец</b><small>{user?.email}</small></div></div><button className="sign-out" onClick={signOut}><LogOut />Выйти</button></aside><section className="dash-main">{children}</section><NavLink className="mobile-add" aria-label="Новая продажа" to="/dashboard/sales/new"><Plus /></NavLink></main>
}
