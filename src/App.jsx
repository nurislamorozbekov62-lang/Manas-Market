import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import Home from './pages/Home'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import StoreForm from './pages/StoreForm'
import ProductForm from './pages/ProductForm'
import ProductsPage from './pages/ProductsPage'
import NewSale from './pages/NewSale'
import SalesHistory from './pages/SalesHistory'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return <AuthProvider><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/dashboard/store/new" element={<ProtectedRoute><StoreForm /></ProtectedRoute>} />
    <Route path="/dashboard/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
    <Route path="/dashboard/products/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
    <Route path="/dashboard/products/:id/edit" element={<ProtectedRoute><ProductForm editing /></ProtectedRoute>} />
    <Route path="/dashboard/sales/new" element={<ProtectedRoute><NewSale /></ProtectedRoute>} />
    <Route path="/dashboard/sales" element={<ProtectedRoute><SalesHistory /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AuthProvider>
}
