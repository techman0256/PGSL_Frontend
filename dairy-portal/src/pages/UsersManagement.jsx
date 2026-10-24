import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { createUser, getUsers } from "../services/userService";

const initialForm = { name: "", email: "", password: "" };

export default function UsersManagement() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialForm);
  const [feedback, setFeedback] = useState(null);
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setFormData(initialForm);
      setFeedback({ severity: "success", message: "Operator account created." });
    },
    onError: (error) => {
      setFeedback({
        severity: "error",
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Could not create the user.",
      });
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    createUserMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: "OPERATOR",
    });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1160, mx: "auto", p: { xs: 1, md: 2 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", mb: 0.5 }}>
          User Management
        </Typography>
        <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
          Create operator accounts and view registered users.
        </Typography>
      </Box>

      {usersQuery.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {usersQuery.error.response?.data?.message ||
            usersQuery.error.message ||
            "Could not load users."}
        </Alert>
      )}

      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{ p: 3, mb: 3, border: "1px solid #E5E7EB", borderRadius: "8px" }}
      >
        <Typography sx={{ fontSize: "15px", fontWeight: 700, mb: 2 }}>
          Create an operator
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <TextField
            label="Full name"
            value={formData.name}
            onChange={(event) =>
              setFormData((current) => ({ ...current, name: event.target.value }))
            }
            required
            fullWidth
            size="small"
          />
          <TextField
            label="Email address"
            type="email"
            value={formData.email}
            onChange={(event) =>
              setFormData((current) => ({ ...current, email: event.target.value }))
            }
            required
            fullWidth
            size="small"
          />
          <TextField
            label="Temporary password"
            type="password"
            value={formData.password}
            onChange={(event) =>
              setFormData((current) => ({ ...current, password: event.target.value }))
            }
            inputProps={{ minLength: 8 }}
            helperText="At least 8 characters"
            required
            fullWidth
            size="small"
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={createUserMutation.isPending}
            sx={{ textTransform: "none", bgcolor: "#2D5A43" }}
          >
            {createUserMutation.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Create Operator"
            )}
          </Button>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #F3F4F6" }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 700 }}>
            Registered users
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#FAFAFA" }}>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : (usersQuery.data || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                usersQuery.data.map((user) => (
                  <TableRow key={user._id || user.id} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.isActive === false ? "Inactive" : "Active"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={5000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {feedback ? (
          <Alert
            severity={feedback.severity}
            variant="filled"
            onClose={() => setFeedback(null)}
          >
            {feedback.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
