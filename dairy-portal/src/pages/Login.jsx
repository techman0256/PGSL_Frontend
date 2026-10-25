
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Alert,
} from '@mui/material'
import api from '../api/axios'
import useAuth from '../context/useAuth'

function Login() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login, authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password,
      })
      const responseData = response.data?.data ?? response.data
      const authenticatedUser = responseData?.user ?? responseData?.profile ?? responseData
      const token = responseData?.token ?? responseData?.accessToken ?? responseData?.jwt
      const name = authenticatedUser?.name || authenticatedUser?.fullName || email.trim()

      login({
        ...authenticatedUser,
        name,
        username: authenticatedUser?.username || authenticatedUser?.email || email.trim(),
        initials: name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0].toUpperCase())
          .join(''),
      }, token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Login failed. Check your email and password and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f4f7fb',
      }}
    >
      <Box
        sx={{
          width: 400,
          padding: 4,
          backgroundColor: 'white',
          borderRadius: 3,
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          color="#123B6D"
          gutterBottom
        >
          PGSL
        </Typography>

        <Typography
          variant="h6"
          textAlign="center"
          gutterBottom
        >
          Dairy Portal
        </Typography>

        <Typography
          variant="body2"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Sign in to access the dairy data management system
        </Typography>

        {location.state?.signupSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {location.state.signupSuccess}
          </Alert>
        )}

        {authError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {authError}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            label="Email Address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            margin="normal"
          />

          <TextField
            fullWidth
            required
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            margin="normal"
          />

          <FormControlLabel
            control={<Checkbox />}
            label="Remember me"
            sx={{ mt: 1 }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              mt: 2,
              backgroundColor: '#123B6D',
              '&:hover': {
                backgroundColor: '#0D2D52',
              },
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Box>
        <Typography
  variant="body2"
  textAlign="center"
  color="text.secondary"
  sx={{ mt: 3 }}
>
  Don't have an account?{' '}
  <Link
    to="/signup"
    style={{
      color: '#123B6D',
      fontWeight: 'bold',
      textDecoration: 'none',
    }}
  >
    Sign up
  </Link>
</Typography>
      </Box>
    </Box>
  )
}

export default Login