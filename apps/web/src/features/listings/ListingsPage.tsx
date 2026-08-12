import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../auth/AuthContext'
import type { Item } from '../catalog/types'

const categories = ['DENIM', 'OUTERWEAR', 'DRESSES', 'KNITWEAR', 'SHOES', 'ACCESSORIES', 'OTHER']

export function ListingsPage() {
  const { user, loading } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [editing, setEditing] = useState<Item | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function refresh() {
    const body = await api<{ items: Item[] }>('/items/mine')
    setItems(body.items)
  }

  useEffect(() => {
    if (user) void refresh().catch((err: Error) => setError(err.message))
  }, [user])
  if (!loading && !user) return <Navigate to="/account" replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const payload = {
      name: String(data.get('name')),
      description: String(data.get('description')),
      price: Number(data.get('price')),
      condition: String(data.get('condition')),
      category: String(data.get('category')),
    }
    setError('')
    try {
      const body = await api<{ item: Item }>(editing ? `/items/${editing.id}` : '/items', {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      })
      const image = data.get('image')
      if (image instanceof File && image.size > 0) {
        const upload = new FormData()
        upload.append('image', image)
        await api(`/items/${body.item.id}/image`, { method: 'POST', body: upload })
      }
      setEditing(null)
      form.reset()
      setNotice(editing ? 'Listing updated.' : 'Listing published.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save listing')
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this listing?')) return
    await api(`/items/${id}`, { method: 'DELETE' })
    await refresh()
  }
  async function markSold(id: string) {
    await api(`/items/${id}/sell`, { method: 'POST' })
    await refresh()
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h3" component="h1">
        Your listings
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {notice && <Alert severity="success">{notice}</Alert>}
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Stack component="form" spacing={2} onSubmit={submit} key={editing?.id ?? 'new'}>
          <Typography variant="h5">{editing ? `Edit ${editing.name}` : 'List a piece'}</Typography>
          <TextField
            name="name"
            label="Name"
            required
            defaultValue={editing?.name ?? ''}
            inputProps={{ maxLength: 120 }}
          />
          <TextField
            name="description"
            label="Description"
            required
            multiline
            minRows={3}
            defaultValue={editing?.description ?? ''}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              name="price"
              label="Price (USD)"
              required
              type="number"
              defaultValue={editing?.price ?? ''}
              inputProps={{ min: 0, step: '0.01' }}
              fullWidth
            />
            <TextField
              name="condition"
              label="Condition"
              select
              required
              defaultValue={editing?.condition ?? 'GOOD'}
              fullWidth
            >
              {['NEW', 'GOOD', 'FAIR'].map((value) => (
                <MenuItem key={value} value={value}>
                  {value.toLowerCase()}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="category"
              label="Category"
              select
              required
              defaultValue={editing?.category ?? 'OTHER'}
              fullWidth
            >
              {categories.map((value) => (
                <MenuItem key={value} value={value}>
                  {value.toLowerCase()}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Button component="label" variant="outlined">
            Choose image
            <input hidden type="file" name="image" accept="image/jpeg,image/png,image/webp" />
          </Button>
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained">
              {editing ? 'Save changes' : 'Publish listing'}
            </Button>
            {editing && <Button onClick={() => setEditing(null)}>Cancel</Button>}
          </Stack>
        </Stack>
      </Paper>
      <Stack spacing={2}>
        <Typography variant="h5">Published pieces ({items.length})</Typography>
        {items.length === 0 ? (
          <Alert severity="info">You have not listed anything yet.</Alert>
        ) : (
          items.map((item) => (
            <Paper key={item.id} sx={{ p: 2 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ sm: 'center' }}
                spacing={2}
              >
                <Stack sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography color="text.secondary">
                    ${item.price.toFixed(2)} · {item.sold ? 'Sold' : 'Live'}
                  </Typography>
                </Stack>
                <Button onClick={() => setEditing(item)} disabled={item.sold}>
                  Edit
                </Button>
                <Button onClick={() => void markSold(item.id)} disabled={item.sold}>
                  Mark sold
                </Button>
                <Button color="error" onClick={() => void remove(item.id)}>
                  Delete
                </Button>
              </Stack>
            </Paper>
          ))
        )}
      </Stack>
    </Stack>
  )
}
