import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import { useAuth } from '../lib/AuthContext'
import { formatMoney, localPeriodStart, paymentMethods } from '../lib/sales'
import { supabase } from '../lib/supabase'

const periods = [{ days: 1, label: 'Сегодня' }, { days: 7, label: '7 дней' }, { days: 30, label: '30 дней' }]

export default function SalesHistory() {
  const { user } = useAuth()
  const [period, setPeriod] = useState(1)
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true); setError('')
      const storeResult = await supabase.from('stores').select('id').eq('owner_id', user.id).maybeSingle()
      if (storeResult.error || !storeResult.data) { setError('Магазин не найден'); setLoading(false); return }
      const result = await supabase.from('sales').select('id,created_at,quantity,total_amount,gross_profit,payment_method,sale_type,products(name)').eq('store_id', storeResult.data.id).gte('created_at', localPeriodStart(period)).order('created_at', { ascending: false })
      if (result.error) setError('Не удалось загрузить историю продаж')
      else setSales(result.data)
      setLoading(false)
    }
    load()
  }, [period, user.id])

  return <DashboardShell><div className="sales-page"><Link className="back" to="/dashboard"><ArrowLeft />На главную</Link><header className="sales-title"><div><small>ПРОДАЖИ</small><h1>История продаж</h1></div><Link className="button" to="/dashboard/sales/new">Новая продажа</Link></header><div className="period-tabs">{periods.map(item => <button className={period === item.days ? 'active' : ''} onClick={() => setPeriod(item.days)} key={item.days}>{item.label}</button>)}</div>{error && <div className="error">{error}</div>}{loading ? <div className="history-loading">Загрузка…</div> : !sales.length ? <div className="empty"><h3>Продаж пока нет</h3><p>Продажи за выбранный период появятся здесь.</p></div> : <div className="sales-history"><div className="history-head"><span>Время</span><span>Товар</span><span>Кол-во</span><span>Сумма</span><span>Оплата</span><span>Прибыль</span></div>{sales.map(sale => <article key={sale.id}><time>{new Date(sale.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</time><b>{sale.sale_type === 'quick' ? 'Быстрая продажа' : sale.products?.name || 'Удалённый товар'}</b><span>{sale.quantity}</span><strong>{formatMoney(sale.total_amount)} сом</strong><span>{paymentMethods.find(method => method.value === sale.payment_method)?.label}</span><span>{sale.gross_profit == null ? '—' : `${formatMoney(sale.gross_profit)} сом`}</span></article>)}</div>}</div></DashboardShell>
}
