import { Route, BrowserRouter, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CatalogPage } from './features/catalog/CatalogPage'
import { AuthProvider } from './features/auth/AuthContext'
import { AuthPage } from './features/auth/AuthPage'
import { WishlistPage } from './features/wishlist/WishlistPage'
import { OrdersPage } from './features/orders/OrdersPage'
import { AdminPage } from './features/admin/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<CatalogPage />} />
            <Route path="account" element={<AuthPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="*" element={<div>Page not found</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
