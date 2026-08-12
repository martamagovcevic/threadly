import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../auth/AuthContext'
import type { Item } from '../catalog/types'

interface AdminItem extends Item {
  hidden: boolean
}
interface AdminOrder {
  id: string
  pricePaid: number
  buyer: { name: string; email: string }
  item: AdminItem
}

export function AdminPage() {
  const { user, loading } = useAuth()
  const [items, setItems] = useState<AdminItem[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    void Promise.all([
      api<{ items: AdminItem[] }>('/admin/items'),
      api<{ orders: AdminOrder[] }>('/admin/orders'),
    ])
      .then(([itemBody, orderBody]) => {
        setItems(itemBody.items)
        setOrders(orderBody.orders)
      })
      .catch((err: Error) => setError(err.message))
  }, [user])

  if (!loading && user?.role !== 'ADMIN') return <Navigate to="/" replace />

  async function toggle(item: AdminItem) {
    try {
      const body = await api<{ item: AdminItem }>(`/admin/items/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ hidden: !item.hidden }),
      })
      setItems((current) =>
        current.map((candidate) => (candidate.id === item.id ? body.item : candidate)),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Moderation failed')
    }
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h3" component="h1">
        Marketplace moderation
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Stack spacing={2}>
        <Typography variant="h5">Listings</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Seller</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.seller.name}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={item.hidden ? 'warning' : item.sold ? 'default' : 'success'}
                      label={item.hidden ? 'Hidden' : item.sold ? 'Sold' : 'Live'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button onClick={() => void toggle(item)} disabled={item.sold}>
                      {item.hidden ? 'Restore' : 'Hide'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h5">Orders ({orders.length})</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Buyer</TableCell>
                <TableCell align="right">Paid</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.item.name}</TableCell>
                  <TableCell>
                    {order.buyer.name}
                    <Typography variant="caption" display="block">
                      {order.buyer.email}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">${order.pricePaid.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Stack>
  )
}
