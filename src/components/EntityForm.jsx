import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function EntityForm({ type, error, busy, onSubmit, initialValues = {}, editing = false }) {
  const store = type === 'store'
  return <div className="entity-page">
    <Link className="back" to={store ? '/' : '/dashboard/products'}><ArrowLeft /> {store ? 'На главную' : 'К товарам'}</Link>
    <div className="form-card">
      <div className="form-step">{store ? 'ШАГ 2 ИЗ 2' : editing ? 'РЕДАКТИРОВАНИЕ' : 'НОВЫЙ ТОВАР'}</div>
      <h1>{store ? 'Создайте магазин' : editing ? 'Редактировать товар' : 'Добавьте товар'}</h1>
      <p>{store ? 'Расскажите о своём бренде.' : 'Заполните основные сведения о товаре.'}</p>
      {error && <div className="error">{error}</div>}
      <form onSubmit={onSubmit}>
        <label>{store ? 'Название магазина' : 'Название товара'}
          <input required minLength="2" name="name" defaultValue={initialValues.name || ''} placeholder={store ? 'Например, Nomad Goods' : 'Например, Шоппер «Орнамент»'} />
        </label>
        {store && <label>Адрес магазина
          <div className="slug"><span>manas.market/</span><input required minLength="3" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" name="slug" placeholder="nomad-goods" /></div>
          <small>Латинские буквы, цифры и дефис</small>
        </label>}
        <label>Описание
          <textarea name="description" defaultValue={initialValues.description || ''} maxLength={store ? 500 : 1000} rows="4" placeholder={store ? 'Что вы создаёте и чем ваш бренд особенный?' : 'Коротко расскажите о товаре'} />
        </label>
        {!store && <div className="form-grid">
          <label>Цена продажи, сом<input required type="number" min="0" step="0.01" name="price" defaultValue={initialValues.price ?? ''} placeholder="0" /></label>
          <label>Закупочная цена, сом<input required type="number" min="0" step="0.01" name="purchase_price" defaultValue={initialValues.purchase_price ?? ''} placeholder="0" /></label>
          <label>Остаток, шт.<input required type="number" min="0" step="1" name="stock" defaultValue={initialValues.stock ?? ''} placeholder="0" /></label>
        </div>}
        {!store && <label className="check"><input type="checkbox" name="is_active" defaultChecked={initialValues.is_active ?? true} />Товар активен</label>}
        <button className="button" disabled={busy}>{busy ? 'Сохранение…' : store ? 'Создать магазин' : editing ? 'Сохранить изменения' : 'Добавить товар'}<ArrowRight /></button>
      </form>
    </div>
  </div>
}
