import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { api } from '../../lib/api'
import type { Item } from './types'

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export function ItemCard({
  item,
  wished,
  onToggle,
  onBuy,
}: {
  item: Item
  wished: boolean
  onToggle?: () => void
  onBuy?: () => void
}) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {item.imageUrl ? (
        <CardMedia
          component="img"
          height="220"
          image={`http://localhost:4000${item.imageUrl}`}
          alt={item.name}
        />
      ) : (
        <Box sx={{ height: 220, bgcolor: 'grey.200', display: 'grid', placeItems: 'center' }}>
          <Typography color="text.secondary">No photo yet</Typography>
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="start">
          <Typography variant="h6" component="h2">
            {item.name}
          </Typography>
          {onToggle && (
            <IconButton
              aria-label={
                wished ? `Remove ${item.name} from wishlist` : `Add ${item.name} to wishlist`
              }
              onClick={onToggle}
              color={wished ? 'secondary' : 'default'}
            >
              {wished ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sold by {item.seller.name}
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Chip label={item.condition.toLowerCase()} size="small" />
          <Typography variant="h6">{formatPrice(item.price)}</Typography>
        </Stack>
        {onBuy && (
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={onBuy}>
            Buy now
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function CatalogPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [wishedIds, setWishedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
    const timer = window.setTimeout(
      () => {
        setLoading(true)
        void api<{ items: Item[] }>(`/items${query}`)
          .then((body) => setItems(body.items))
          .catch((err: Error) => setError(err.message))
          .finally(() => setLoading(false))
      },
      search ? 250 : 0,
    )
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (!user) return setWishedIds(new Set())
    void api<{ items: Item[] }>('/wishlist').then((body) =>
      setWishedIds(new Set(body.items.map((item) => item.id))),
    )
  }, [user])

  async function toggle(itemId: string) {
    const wished = wishedIds.has(itemId)
    await api(`/wishlist/${itemId}`, { method: wished ? 'DELETE' : 'POST' })
    setWishedIds((current) => {
      const next = new Set(current)
      if (wished) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  async function buy(item: Item) {
    if (!window.confirm(`Purchase ${item.name} for ${formatPrice(item.price)}?`)) return
    try {
      await api('/orders', { method: 'POST', body: JSON.stringify({ itemId: item.id }) })
      setItems((current) => current.filter((candidate) => candidate.id !== item.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    }
  }

  const countLabel = useMemo(
    () => `${items.length} ${items.length === 1 ? 'piece' : 'pieces'}`,
    [items.length],
  )
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" component="h1">
          Find your next favorite
        </Typography>
        <Typography color="text.secondary">Pre-loved clothes, ready for another story.</Typography>
      </Box>
      <TextField
        label="Search the rack"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        fullWidth
        inputProps={{ 'aria-label': 'Search the rack' }}
      />
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress aria-label="Loading catalog" />
        </Box>
      ) : items.length === 0 ? (
        <Alert severity="info">No pieces match your search.</Alert>
      ) : (
        <>
          <Typography color="text.secondary">{countLabel}</Typography>
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ItemCard
                  item={item}
                  wished={wishedIds.has(item.id)}
                  onToggle={user ? () => void toggle(item.id) : undefined}
                  onBuy={user && user.id !== item.seller.id ? () => void buy(item) : undefined}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Stack>
  )
}
