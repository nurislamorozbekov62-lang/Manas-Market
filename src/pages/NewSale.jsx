import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Minus, Plus, Search, Zap } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import { useAuth } from '../lib/AuthContext'
import { formatMoney, paymentMethods, saleErrorMessage } from '../lib/sales'
import { supabase } from '../lib/supabase'

export default function NewSale() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [selected, setSelected] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [search, setSearch] = useState('')
  const [quick, setQuick] = useState(false)
  const [quickAmount, setQuickAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const storeResult = await supabase.from('stores').select('id').eq('owner_id', user.id).maybeSingle()
      if (storeResult.error || !storeResult.data) { setError('Магазин не найден'); return }
      setStore(storeResult.data)
      const productResult = await supabase.from('products').select('id,name,price,stock').eq('store_id', storeResult.data.id).eq('is_active', true).order('name')
      if (productResult.error) setError('Не удалось загрузить товары')
      else setProducts(productResult.data)
    }
    load()
  }, [user.id])

  const filtered = useMemo(() => products.filter(product => product.name.toLocaleLowerCase('ru').includes(search.toLocaleLowerCase('ru').trim())), [products, search])

  function chooseProduct(product) {
    setSelected(product); setQuantity(1); setError('')
  }

  async function completeProductSale(method) {
    if (busy || !store || !selected) return
    setBusy(true); setError('')
    const { error: rpcError } = await supabase.rpc('create_product_sale', {
      p_store_id: store.id,
      p_product_id: selected.id,
      p_quantity: quantity,
      p_payment_method: method,
    })
    setBusy(false)
    if (rpcError) { setError(saleErrorMessage(rpcError)); return }
    navigate('/dashboard', { replace: true })
  }

  async function completeQuickSale(method) {
    const amount = Number(quickAmount)
    if (busy || !store || !Number.isFinite(amount) || amount <= 0) { setError('Укажите корректную сумму'); return }
    setBusy(true); setError('')
    const { error: rpcError } = await supabase.rpc('create_quick_sale', { p_store_id: store.id, p_amount: amount, p_payment_method: method })
    setBusy(false)
    if (rpcError) { setError(saleErrorMessage(rpcError)); return }
    navigate('/dashboard', { replace: true })
  }

  if (selected) return <DashboardShell><div className="sale-flow"><button className="back button-reset" onClick={() => setSelected(null)}><ArrowLeft />К товарам</button><div className="checkout-card"><small>ПРОДАЖА ТОВАРА</small><h1>{selected.name}</h1><strong>{formatMoney(selected.price)} сом</strong><p>Остаток: {selected.stock}</p><div className="quantity"><button onClick={() => setQuantity(value => Math.max(1, value - 1))}><Minus /></button><b>{quantity}</b><button disabled={quantity >= selected.stock} onClick={() => setQuantity(value => Math.min(selected.stock, value + 1))}><Plus /></button></div><div className="sale-total">Итого <b>{formatMoney(Number(selected.price) * quantity)} сом</b></div>{error && <div className="error">{error}</div>}<p className="payment-prompt">Выберите способ оплаты — продажа завершится сразу</p><div className="payment-grid">{paymentMethods.map(method => <button disabled={busy || selected.stock < quantity} key={method.value} onClick={() => completeProductSale(method.value)}>{busy ? 'Сохранение…' : method.label}</button>)}</div></div></div></DashboardShell>

  if (quick) return <DashboardShell><div className="sale-flow"><button className="back button-reset" onClick={() => { setQuick(false); setError('') }}><ArrowLeft />К товарам</button><div className="checkout-card"><small>БЫСТРАЯ ПРОДАЖА</small><h1>Введите сумму</h1><label className="quick-amount"><input autoFocus inputMode="decimal" type="number" min="0.01" step="0.01" value={quickAmount} onChange={event => setQuickAmount(event.target.value)} placeholder="0" /><span>сом</span></label>{error && <div className="error">{error}</div>}<p className="payment-prompt">Выберите способ оплаты — продажа завершится сразу</p><div className="payment-grid">{paymentMethods.map(method => <button disabled={busy} key={method.value} onClick={() => completeQuickSale(method.value)}>{busy ? 'Сохранение…' : method.label}</button>)}</div></div></div></DashboardShell>

  return <DashboardShell><div className="sales-page"><header className="sales-title"><div><small>НОВАЯ ПРОДАЖА</small><h1>Выберите товар</h1></div><button className="button quick-button" onClick={() => setQuick(true)}><Zap />Быстрая продажа</button></header>{error && <div className="error">{error}</div>}<label className="product-search"><Search /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Поиск по названию" /></label><div className="sale-products">{filtered.map(product => <button disabled={product.stock === 0} onClick={() => chooseProduct(product)} key={product.id}><span>{product.name}</span><strong>{formatMoney(product.price)} сом</strong><small className={product.stock === 0 ? 'sold-out' : ''}>{product.stock === 0 ? 'Товар закончился' : `Остаток: ${product.stock}`}</small></button>)}</div>{!filtered.length && <div className="empty"><h3>Товары не найдены</h3><p>Измените поисковый запрос или добавьте товар.</p><Link className="button" to="/dashboard/products/new">Добавить товар</Link></div>}</div></DashboardShell>
}
