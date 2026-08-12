import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

interface StubItem {
  id: string
  name: string
  price: number
  condition: 'New' | 'Good' | 'Fair'
  category: string
}

const stubItems: StubItem[] = [
  { id: '1', name: 'Vintage Levi\u2019s 501', price: 45, condition: 'Good', category: 'Denim' },
  { id: '2', name: '90s Leather Jacket', price: 120, condition: 'Good', category: 'Outerwear' },
  { id: '3', name: 'Floral Tea Dress', price: 28, condition: 'New', category: 'Dresses' },
  { id: '4', name: 'Hand-knit Wool Sweater', price: 35, condition: 'Fair', category: 'Knitwear' },
]

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export function CatalogPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h1">
        Browse the rack
      </Typography>
      <Grid container spacing={3}>
        {stubItems.map((item) => (
          <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" noWrap>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {item.category}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Chip label={item.condition} size="small" />
                  <Typography variant="subtitle1">{formatPrice(item.price)}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
