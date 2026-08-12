import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'

export function Layout() {
  const { user, logout } = useAuth()
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Threadly
          </Typography>
          <Button component={Link} to="/" color="inherit">
            Browse
          </Button>
          {user ? (
            <>
              <Button component={Link} to="/wishlist" color="inherit">
                Wishlist
              </Button>
              <Button component={Link} to="/orders" color="inherit">
                Orders
              </Button>
              <Button color="inherit" onClick={() => void logout()}>
                Sign out
              </Button>
            </>
          ) : (
            <Button component={Link} to="/account" color="inherit">
              Sign in
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
