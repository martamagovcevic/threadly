import Alert from '@mui/material/Alert'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../auth/AuthContext'
import type { Item } from '../catalog/types'

interface Order {
  id: string
  pricePaid: number
  createdAt: string
  item: Item
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function OrdersPage() {
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (user)
      void api<{ orders: Order[] }>('/orders')
        .then((body) => setOrders(body.orders))
        .catch((err: Error) => setError(err.message))
  }, [user])

  if (!loading && !user) return <Navigate to="/account" replace />

  return (
    <Stack spacing={3}>
      <Typography variant="h3" component="h1">
        Order history
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {orders.length === 0 ? (
        <Alert severity="info">Your purchased pieces will appear here.</Alert>
      ) : (
        <Paper>
          <List>
            {orders.map((order) => (
              <ListItem key={order.id} divider>
                <ListItemText
                  primary={order.item.name}
                  secondary={`Purchased ${new Date(order.createdAt).toLocaleDateString()} from ${order.item.seller.name}`}
                />
                <Typography fontWeight={700}>{money.format(order.pricePaid)}</Typography>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Stack>
  )
}
