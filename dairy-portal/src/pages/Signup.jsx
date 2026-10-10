


import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

import api from "../api/axios";

function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    employeeId: "",
    role: "operator",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      console.log("Calling API with data:", formData);
      // const r1 = await api.get("/health")
      // console.log("Health check response:", r1.data);
      const response = await api.post("/auth/register", {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      const data = response.data;

      setSuccess("Account registered successfully!");

      console.log("Registration response:", data);

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        employeeId: "",
        role: "operator",
        password: "",
        confirmPassword: "",
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              required
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleChange}
              margin="normal"
            />

            <TextField
              fullWidth
              required
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              margin="normal"
            />
          </Box>

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
            name="employeeId"
            label="Employee ID"
            value={formData.employeeId}
            onChange={handleChange}
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Role</InputLabel>

            <Select
              labelId="role-label"
              name="role"
              value={formData.role}
              label="Role"
              onChange={handleChange}
            >
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
