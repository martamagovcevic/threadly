import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../auth/AuthContext'
import { ItemCard } from '../catalog/CatalogPage'
import type { Item } from '../catalog/types'

export function WishlistPage() {
  const { user, loading } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    if (user)
      void api<{ items: Item[] }>('/wishlist')
        .then((body) => setItems(body.items))
        .catch((err: Error) => setError(err.message))
  }, [user])
  if (!loading && !user) return <Navigate to="/account" replace />
  async function remove(id: string) {
    await api(`/wishlist/${id}`, { method: 'DELETE' })
    setItems((current) => current.filter((item) => item.id !== id))
  }
  return (
    <Stack spacing={3}>
      <Typography variant="h3" component="h1">
        Your wishlist
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {items.length === 0 ? (
        <Alert severity="info">Save pieces you love and they will appear here.</Alert>
      ) : (
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <ItemCard item={item} wished onToggle={() => void remove(item.id)} />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  )
}
