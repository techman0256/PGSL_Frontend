
import { Link } from 'react-router-dom'

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material'

function Login() {
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

        <TextField
          fullWidth
          label="Username or Email"
          margin="normal"
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
        />

        <FormControlLabel
          control={<Checkbox />}
          label="Remember me"
          sx={{ mt: 1 }}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{
            mt: 2,
            backgroundColor: '#123B6D',
            '&:hover': {
              backgroundColor: '#0D2D52',
            },
          }}
        >
          Login
        </Button>
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