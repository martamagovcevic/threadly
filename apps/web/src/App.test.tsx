import { ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CatalogPage } from './features/catalog/CatalogPage'
import { theme } from './theme'

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>,
  )
}

describe('CatalogPage', () => {
  it('renders the heading and stub items', () => {
    renderWithProviders(<CatalogPage />)

    expect(screen.getByRole('heading', { name: /browse the rack/i })).toBeInTheDocument()
    expect(screen.getByText(/vintage levi/i)).toBeInTheDocument()
    expect(screen.getByText(/\$45\.00/i)).toBeInTheDocument()
  })
})
