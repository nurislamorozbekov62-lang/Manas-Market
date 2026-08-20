import { useEffect, useState } from 'react'
import { Banknote, Box, PackageCheck, PackagePlus, Plus, ReceiptText, Store as StoreIcon, Trash2, TrendingUp } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { formatMoney, localPeriodStart } from '../lib/sales'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [todaySales, setTodaySales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const storeResult = await supabase.from('stores').select('*').eq('owner_id', user.id).maybeSingle()
      if (storeResult.error) { setError(storeResult.error.message); setLoading(false); return }
      if (!storeResult.data) { navigate('/dashboard/store/new', { replace: true }); return }
      setStore(storeResult.data)
      const productResult = await supabase.from('products').select('*').eq('store_id', storeResult.data.id).order('created_at', { ascending: false })
      if (productResult.error) setError(productResult.error.message)
      else setProducts(productResult.data)
      const salesResult = await supabase.from('sales').select('total_amount,gross_profit').eq('store_id', storeResult.data.id).gte('created_at', localPeriodStart(1))
      if (salesResult.error) setError('Не удалось загрузить продажи за сегодня')
      else setTodaySales(salesResult.data)
      setLoading(false)
    }
    load()
  }, [navigate, user.id])

  async function removeProduct(id) {
    if (!window.confirm('Удалить этот товар?')) return
    const { error: deleteError } = await supabase.from('products').delete().eq('id', id)
    if (deleteError) setError(deleteError.message)
    else setProducts(current => current.filter(product => product.id !== id))
  }

  if (loading) return <div className="page-loader"><span /></div>
  const revenue = todaySales.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
  const profit = todaySales.reduce((sum, sale) => sum + (sale.gross_profit == null ? 0 : Number(sale.gross_profit)), 0)
  return <DashboardShell><header className="dash-head"><div><small>ВАШ МАГАЗИН</small><h1>{store?.name}</h1><p>{store?.description || 'Управляйте ассортиментом вашего магазина'}</p></div><div className="dash-actions"><Link className="button secondary" to="/dashboard/products/new"><PackagePlus />Добавить товар</Link><Link className="button secondary" to="/dashboard/sales"><ReceiptText />История</Link><Link className="button" to="/dashboard/sales/new"><Plus />Новая продажа</Link></div></header>{error && <div className="error">{error}</div>}<section className="today"><header><div><small>СЕГОДНЯ</small><h2>Продажи за день</h2></div></header><div className="dash-stats"><article><span><Banknote /></span><div><small>Выручка сегодня</small><b>{formatMoney(revenue)} сом</b></div></article><article><span><ReceiptText /></span><div><small>Продаж сегодня</small><b>{todaySales.length}</b></div></article><article><span><TrendingUp /></span><div><small>Валовая прибыль</small><b>{formatMoney(profit)} сом</b></div></article></div></section><div className="dash-stats inventory-stats"><article><span><Box /></span><div><small>Всего товаров</small><b>{products.length}</b></div></article><article><span><PackageCheck /></span><div><small>Активных</small><b>{products.filter(product => product.is_active).length}</b></div></article><article><span><StoreIcon /></span><div><small>Единиц на складе</small><b>{products.reduce((sum, product) => sum + product.stock, 0)}</b></div></article></div><section className="products"><header><h2>Товары</h2><small>{products.length} позиций</small></header>{!products.length ? <div className="empty"><span><Box /></span><h3>Добавьте первый товар</h3><p>Он появится здесь, и вы сможете управлять его наличием.</p><Link className="button" to="/dashboard/products/new"><Plus />Добавить товар</Link></div> : <div className="product-list">{products.map(product => <article key={product.id}><div className="product-icon"><Box /></div><div><b>{product.name}</b><small>{product.description || 'Без описания'}</small></div><strong>{formatMoney(product.price)} сом</strong><span className={product.is_active ? 'status on' : 'status'}>{product.is_active ? 'Активен' : 'Скрыт'}</span><small>{product.stock} шт.</small><button onClick={() => removeProduct(product.id)} aria-label={`Удалить ${product.name}`}><Trash2 /></button></article>)}</div>}</section></DashboardShell>
}
