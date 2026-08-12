import CircularProgress from '@mui/material/CircularProgress'
import { lazy, Suspense } from 'react'
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AuthProvider } from './features/auth/AuthContext'

const CatalogPage = lazy(() =>
  import('./features/catalog/CatalogPage').then((module) => ({ default: module.CatalogPage })),
)
const AuthPage = lazy(() =>
  import('./features/auth/AuthPage').then((module) => ({ default: module.AuthPage })),
)
const WishlistPage = lazy(() =>
  import('./features/wishlist/WishlistPage').then((module) => ({ default: module.WishlistPage })),
)
const OrdersPage = lazy(() =>
  import('./features/orders/OrdersPage').then((module) => ({ default: module.OrdersPage })),
)
const AdminPage = lazy(() =>
  import('./features/admin/AdminPage').then((module) => ({ default: module.AdminPage })),
)
const ListingsPage = lazy(() =>
  import('./features/listings/ListingsPage').then((module) => ({ default: module.ListingsPage })),
)

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<CircularProgress aria-label="Loading page" sx={{ m: 4 }} />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<CatalogPage />} />
              <Route path="account" element={<AuthPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="listings" element={<ListingsPage />} />
              <Route path="*" element={<div>Page not found</div>} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
