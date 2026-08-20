export const paymentMethods = [
  { value: 'cash', label: 'Наличные' },
  { value: 'transfer', label: 'Перевод' },
  { value: 'other', label: 'Другое' },
]

export function saleErrorMessage(error) {
  const messages = {
    out_of_stock: 'Товар закончился',
    insufficient_stock: 'Недостаточно товара',
    product_not_found: 'Товар не найден',
    store_access_denied: 'Нет доступа',
    not_authenticated: 'Нет доступа',
    invalid_quantity: 'Укажите корректное количество',
    invalid_amount: 'Укажите корректную сумму',
    invalid_payment_method: 'Выберите способ оплаты',
  }
  return messages[error?.message] || 'Не удалось сохранить продажу'
}

export function localPeriodStart(days) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  if (days > 1) start.setDate(start.getDate() - (days - 1))
  return start.toISOString()
}

export function formatMoney(value) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(Number(value) || 0)
}
