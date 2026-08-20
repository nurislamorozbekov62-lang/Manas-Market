import { useEffect, useState } from 'react'
import { Box, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import { useAuth } from '../lib/AuthContext'
import { formatMoney } from '../lib/sales'
import { supabase } from '../lib/supabase'

export default function ProductsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const storeResult = await supabase.from('stores').select('id').eq('owner_id', user.id).maybeSingle()
      if (storeResult.error) { setError('Не удалось загрузить магазин'); setLoading(false); return }
      if (!storeResult.data) { navigate('/dashboard/store/new', { replace: true }); return }
      const result = await supabase.from('products').select('*').eq('store_id', storeResult.data.id).order('created_at', { ascending: false })
      if (result.error) setError('Не удалось загрузить товары')
      else setProducts(result.data)
      setLoading(false)
    }
    load()
  }, [navigate, user.id])

  async function removeProduct(id) {
    if (!window.confirm('Удалить этот товар?')) return
    const { error: deleteError } = await supabase.from('products').delete().eq('id', id)
    if (deleteError) setError('Не удалось удалить товар')
    else setProducts(current => current.filter(product => product.id !== id))
  }

  if (loading) return <div className="page-loader"><span /></div>
  return <DashboardShell><div className="products-page">
    <header className="products-page-head"><div><small>АССОРТИМЕНТ</small><h1>Товары</h1><p>{products.length} позиций в магазине</p></div><Link className="button products-add" to="/dashboard/products/new"><Plus />Добавить товар</Link></header>
    {error && <div className="error">{error}</div>}
    {!products.length ? <div className="products empty"><span><Box /></span><h3>Добавьте первый товар</h3><p>Укажите цену, закупочную стоимость и остаток.</p><Link className="button" to="/dashboard/products/new"><Plus />Добавить товар</Link></div> : <div className="products-table">
      <div className="products-table-head"><span>Товар</span><span>Цена продажи</span><span>Закупочная цена</span><span>Остаток</span><span>Статус</span><span>Действия</span></div>
      {products.map(product => <article key={product.id}>
        <div className="product-name"><span><Box /></span><div><b>{product.name}</b><small>{product.description || 'Без описания'}</small></div></div>
        <strong>{formatMoney(product.price)} сом</strong>
        <span>{product.purchase_price == null ? '—' : `${formatMoney(product.purchase_price)} сом`}</span>
        <span>{product.stock} шт.</span>
        <span className={product.is_active ? 'status on' : 'status'}>{product.is_active ? 'Активен' : 'Скрыт'}</span>
        <div className="product-actions"><Link to={`/dashboard/products/${product.id}/edit`}><Pencil />Редактировать</Link><button onClick={() => removeProduct(product.id)} aria-label={`Удалить ${product.name}`}><Trash2 /></button></div>
      </article>)}
    </div>}
  </div></DashboardShell>
}
