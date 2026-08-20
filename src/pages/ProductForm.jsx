import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EntityForm from '../components/EntityForm'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

export default function ProductForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('')
    const form = new FormData(event.currentTarget)
    const { data: store, error: storeError } = await supabase.from('stores').select('id').eq('owner_id', user.id).single()
    if (storeError) { setBusy(false); setError('Сначала создайте магазин'); return }
    const { error: createError } = await supabase.from('products').insert({
      store_id: store.id,
      name: String(form.get('name')).trim(),
      description: String(form.get('description')).trim() || null,
      price: Number(form.get('price')),
      purchase_price: form.get('purchase_price') === '' ? null : Number(form.get('purchase_price')),
      stock: Number(form.get('stock')),
      is_active: form.get('is_active') === 'on',
    })
    setBusy(false)
    if (createError) setError(createError.message)
    else navigate('/dashboard', { replace: true })
  }
  return <EntityForm type="product" error={error} busy={busy} onSubmit={submit} />
}
