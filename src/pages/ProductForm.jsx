import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EntityForm from '../components/EntityForm'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

export default function ProductForm({ editing = false }) {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(editing)

  useEffect(() => {
    if (!editing) return
    async function load() {
      const { data, error: loadError } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
      if (loadError || !data) setError('Товар не найден или нет доступа')
      else setProduct(data)
      setLoading(false)
    }
    load()
  }, [editing, id])

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('')
    const form = new FormData(event.currentTarget)
    const values = {
      name: String(form.get('name')).trim(),
      description: String(form.get('description')).trim() || null,
      price: Number(form.get('price')),
      purchase_price: Number(form.get('purchase_price')),
      stock: Number(form.get('stock')),
      is_active: form.get('is_active') === 'on',
    }
    let saveError
    if (editing) {
      const result = await supabase.from('products').update(values).eq('id', id).select('id').maybeSingle()
      saveError = result.error || (!result.data ? new Error('product_not_found') : null)
    } else {
      const { data: store, error: storeError } = await supabase.from('stores').select('id').eq('owner_id', user.id).single()
      if (storeError) { setBusy(false); setError('Сначала создайте магазин'); return }
      const result = await supabase.from('products').insert({ store_id: store.id, ...values })
      saveError = result.error
    }
    setBusy(false)
    if (saveError) setError('Не удалось сохранить товар')
    else navigate('/dashboard/products', { replace: true })
  }

  if (loading) return <div className="page-loader"><span /></div>
  if (editing && !product) return <EntityForm type="product" error={error || 'Товар не найден или нет доступа'} busy onSubmit={event => event.preventDefault()} editing />
  return <EntityForm type="product" error={error} busy={busy} onSubmit={submit} initialValues={product || {}} editing={editing} />
}
