import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function AuthPage() {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    try {
      const email = String(data.get('email'))
      const password = String(data.get('password'))
      if (mode === 'register') await register(String(data.get('name')), email, password)
      else await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to continue')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Paper sx={{ maxWidth: 460, mx: 'auto', p: { xs: 3, sm: 5 } }}>
      <Stack component="form" spacing={2.5} onSubmit={submit}>
        <Typography variant="h4" component="h1">
          Welcome to Threadly
        </Typography>
        <Tabs value={mode} onChange={(_event, value: 'login' | 'register') => setMode(value)}>
          <Tab value="login" label="Sign in" />
          <Tab value="register" label="Create account" />
        </Tabs>
        {error && <Alert severity="error">{error}</Alert>}
        {mode === 'register' && <TextField required name="name" label="Name" autoComplete="name" />}
        <TextField required name="email" type="email" label="Email" autoComplete="email" />
        <TextField
          required
          name="password"
          type="password"
          label="Password"
          inputProps={{ minLength: 8 }}
        />
        <Button type="submit" variant="contained" size="large" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Join Threadly'}
        </Button>
      </Stack>
    </Paper>
  )
}
