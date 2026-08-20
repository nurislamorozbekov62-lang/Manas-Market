import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EntityForm from '../components/EntityForm'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

export default function StoreForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('')
    const form = new FormData(event.currentTarget)
    const { error: createError } = await supabase.from('stores').insert({
      owner_id: user.id,
      name: String(form.get('name')).trim(),
      slug: String(form.get('slug')).trim().toLowerCase(),
      description: String(form.get('description')).trim() || null,
    })
    setBusy(false)
    if (createError) setError(createError.code === '23505' ? 'Этот адрес уже занят или магазин уже создан' : createError.message)
    else navigate('/dashboard', { replace: true })
  }
  return <EntityForm type="store" error={error} busy={busy} onSubmit={submit} />
}
