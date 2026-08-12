import { ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../../lib/api'
import { theme } from '../../theme'
import { AdminPage } from './AdminPage'

vi.mock('../../lib/api', () => ({ api: vi.fn() }))
vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'admin', role: 'ADMIN' }, loading: false }),
}))

const item = {
  id: 'one',
  name: 'Review coat',
  price: 20,
  condition: 'GOOD',
  category: 'OUTERWEAR',
  imageUrl: null,
  sold: false,
  hidden: false,
  seller: { id: 'seller', name: 'Seller' },
}

describe('AdminPage', () => {
  beforeEach(() => {
    vi.mocked(api).mockReset()
    vi.mocked(api).mockImplementation(async (path) => {
      if (path === '/admin/items') return { items: [item] }
      if (path === '/admin/orders') return { orders: [] }
      return { item: { ...item, hidden: true } }
    })
  })

  it('loads listings and moderates one', async () => {
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <AdminPage />
        </MemoryRouter>
      </ThemeProvider>,
    )
    expect(await screen.findByText('Review coat')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Hide' }))
    await waitFor(() =>
      expect(api).toHaveBeenCalledWith('/admin/items/one', {
        method: 'PATCH',
        body: JSON.stringify({ hidden: true }),
      }),
    )
    expect(await screen.findByText('Hidden')).toBeInTheDocument()
  })
})
