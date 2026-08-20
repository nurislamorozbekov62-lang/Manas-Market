import { useState } from 'react'
import { ArrowLeft, ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand'
import { useAuth } from '../lib/AuthContext'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export default function AuthPage({ mode }) {
  const register = mode === 'register'
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function submit(event) {
    event.preventDefault()
    if (!isSupabaseConfigured) {
      setError('Сначала подключите Supabase в файле .env.local')
      return
    }
    setBusy(true); setError(''); setMessage('')
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email')).trim()
    const password = String(form.get('password'))
    const result = register
      ? await supabase.auth.signUp({ email, password, options: { data: { full_name: String(form.get('name')).trim(), role: 'seller' } } })
      : await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (result.error) { setError(result.error.message); return }
    if (register && !result.data.session) setMessage('Проверьте почту и подтвердите регистрацию')
    else navigate(location.state?.from?.pathname || (register ? '/dashboard/store/new' : '/dashboard'), { replace: true })
  }

  return <main className="auth-page">
    <section className="auth-art"><Brand light /><div><small>ПРОСТРАНСТВО ДЛЯ ВАШЕГО ДЕЛА</small><blockquote>«Большое начинается<br />с одного <em>решения.</em>»</blockquote><p>Присоединяйтесь к предпринимателям, которые создают локальные бренды.</p></div><footer>Сделано с заботой в Кыргызстане</footer></section>
    <section className="auth-panel"><div className="auth-wrap"><Link to="/" className="back"><ArrowLeft size={16} /> На главную</Link><h1>{register ? 'Создайте аккаунт' : 'С возвращением'}</h1><p>{register ? 'Откройте свой магазин за несколько минут' : 'Войдите, чтобы продолжить работу'}</p>{error && <div className="error">{error}</div>}{message && <div className="success">{message}</div>}<form onSubmit={submit}>{register && <label>Ваше имя<div><UserRound /><input required minLength="2" name="name" placeholder="Айжан" autoComplete="name" /></div></label>}<label>Электронная почта<div><Mail /><input required type="email" name="email" placeholder="you@example.com" autoComplete="email" /></div></label><label>Пароль<div><LockKeyhole /><input required minLength="8" type="password" name="password" placeholder="Минимум 8 символов" autoComplete={register ? 'new-password' : 'current-password'} /></div></label><button className="button" disabled={busy}>{busy ? 'Подождите…' : register ? 'Создать аккаунт' : 'Войти'}<ArrowRight size={18} /></button></form><div className="switch">{register ? 'Уже есть аккаунт?' : 'Ещё нет аккаунта?'} <Link to={register ? '/login' : '/register'}>{register ? 'Войти' : 'Зарегистрироваться'}</Link></div></div></section>
  </main>
}
