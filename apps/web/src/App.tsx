import { Route, BrowserRouter, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CatalogPage } from './features/catalog/CatalogPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<CatalogPage />} />
          <Route path="*" element={<div>Page not found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
