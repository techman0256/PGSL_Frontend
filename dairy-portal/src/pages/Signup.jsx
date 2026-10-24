import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

import api from "../api/axios";
import useAuth from "../context/useAuth";

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      const responseData = response.data?.data ?? response.data;
      const registeredUser = responseData?.user ?? responseData?.profile;
      const token = responseData?.token ?? responseData?.accessToken ?? responseData?.jwt;

      if (token && registeredUser) {
        const name = registeredUser.name || formData.name.trim();
        login({
          ...registeredUser,
          name,
          username: registeredUser.username || registeredUser.email || formData.email.trim(),
          initials: name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join(""),
        }, token);
        navigate("/dashboard", { replace: true });
        return;
      }

      navigate("/", {
        replace: true,
        state: { signupSuccess: "Account registered successfully. Please log in." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f7fb",
        padding: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 500,
          padding: 4,
          backgroundColor: "white",
          borderRadius: 3,
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          color="#123B6D"
        >
          PGSL
        </Typography>

        <Typography variant="h6" textAlign="center" sx={{ mt: 0.5 }}>
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            required
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            required
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            required
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              mt: 3,
              backgroundColor: "#123B6D",
              "&:hover": {
                backgroundColor: "#0D2D52",
              },
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </Box>

        <Typography
          variant="body2"
          textAlign="center"
          color="text.secondary"
          sx={{ mt: 3 }}
        >
          Already have an account?{" "}
          <Link
            to="/"
            style={{
              color: "#123B6D",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Login
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default Signup;