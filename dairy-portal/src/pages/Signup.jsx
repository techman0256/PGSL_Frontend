

import { Link } from 'react-router-dom'
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'

function Signup() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f4f7fb',
        padding: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 500,
          padding: 4,
          backgroundColor: 'white',
          borderRadius: 3,
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        }}
      >
        {/* Heading */}

        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          color="#123B6D"
        >
          PGSL
        </Typography>

        <Typography
          variant="h6"
          textAlign="center"
          sx={{ mt: 0.5 }}
        >
          Create Account
        </Typography>

        <Typography
          variant="body2"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Register for the PGSL Dairy Portal
        </Typography>

        {/* Name */}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="First Name"
            margin="normal"
          />

          <TextField
            fullWidth
            label="Last Name"
            margin="normal"
          />
        </Box>

        {/* Email */}

        <TextField
          fullWidth
          label="Email Address"
          type="email"
          margin="normal"
        />

        {/* Employee ID */}

        <TextField
          fullWidth
          label="Employee ID"
          margin="normal"
        />

        {/* Role */}

        <FormControl fullWidth margin="normal">
          <InputLabel>Role</InputLabel>

          <Select label="Role">
            <MenuItem value="operator">
              Production Operator
            </MenuItem>

            <MenuItem value="supervisor">
              Supervisor
            </MenuItem>

            <MenuItem value="quality">
              Quality Control
            </MenuItem>

            <MenuItem value="manager">
              Manager
            </MenuItem>
          </Select>
        </FormControl>

        {/* Password */}

        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
        />

        {/* Confirm Password */}

        <TextField
          fullWidth
          label="Confirm Password"
          type="password"
          margin="normal"
        />

        {/* Signup Button */}

        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{
            mt: 3,
            backgroundColor: '#123B6D',
            '&:hover': {
              backgroundColor: '#0D2D52',
            },
          }}
        >
          Create Account
        </Button>

        {/* Login */}


<Typography
  variant="body2"
  textAlign="center"
  color="text.secondary"
  sx={{ mt: 3 }}
>
  Already have an account?{' '}
  <Link
    to="/"
    style={{
      color: '#123B6D',
      fontWeight: 'bold',
      textDecoration: 'none',
    }}
  >
    Login
  </Link>
</Typography>


      </Box>
    </Box>
  )
}

export default Signup