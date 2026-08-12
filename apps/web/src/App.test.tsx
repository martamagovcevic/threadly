import { ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CatalogPage } from './features/catalog/CatalogPage'
import { api } from './lib/api'
import { theme } from './theme'

vi.mock('./lib/api', () => ({ api: vi.fn() }))
vi.mock('./features/auth/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'buyer', name: 'Buyer', role: 'USER' } }),
}))

const item = {
  id: 'item-1',
  name: 'Vintage Levi’s 501',
  description: 'Classic denim',
  price: 45,
  condition: 'GOOD',
  category: 'DENIM',
  imageUrl: null,
  sold: false,
  seller: { id: 'seller', name: 'Marta' },
}

function renderCatalog() {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('CatalogPage', () => {
  beforeEach(() => {
    vi.mocked(api).mockReset()
    vi.mocked(api).mockImplementation(async (path) =>
      path === '/wishlist' ? { items: [] } : { items: [item] },
    )
  })

  it('loads real catalog items and prices', async () => {
    renderCatalog()
    expect(screen.getByRole('heading', { name: /find your next favorite/i })).toBeInTheDocument()
    expect(await screen.findByText(/vintage levi/i)).toBeInTheDocument()
    expect(screen.getByText(/\$45\.00/i)).toBeInTheDocument()
  })

  it('adds a catalog item to the wishlist', async () => {
    renderCatalog()
    const button = await screen.findByRole('button', { name: /add vintage levi/i })
    fireEvent.click(button)
    await waitFor(() => expect(api).toHaveBeenCalledWith('/wishlist/item-1', { method: 'POST' }))
    expect(await screen.findByRole('button', { name: /remove vintage levi/i })).toBeInTheDocument()
  })

  it('checks out an item and removes it from the rack', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderCatalog()
    fireEvent.click(await screen.findByRole('button', { name: /buy now/i }))
    await waitFor(() =>
      expect(api).toHaveBeenCalledWith('/orders', {
        method: 'POST',
        body: JSON.stringify({ itemId: 'item-1' }),
      }),
    )
    expect(screen.queryByText(/vintage levi/i)).not.toBeInTheDocument()
  })
})
