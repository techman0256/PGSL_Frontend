import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  MenuItem,
  Select,
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
import { createUser, getUsers, updateUserRole } from "../services/userService";
import { ASSIGNABLE_ROLES, ROLES, getRoleLabel } from "../auth/roleAccess";

const initialForm = { name: "", email: "", password: "", role: "OPERATOR" };

export default function UsersManagement() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialForm);
  const [selectedRoles, setSelectedRoles] = useState({});
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
      setFeedback({ severity: "success", message: "User account created." });
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

  const updateRoleMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setFeedback({ severity: "success", message: "User role updated." });
    },
    onError: (error) => {
      setFeedback({
        severity: "error",
        message:
          error.response?.data?.message ||
          error.message ||
          "Could not update the user role.",
      });
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    createUserMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role,
    });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1160, mx: "auto", p: { xs: 1, md: 2 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", mb: 0.5 }}>
          User Management
        </Typography>
        <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
          Create accounts, review role requests, and assign authorized roles.
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
          Create a user
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
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
          <Select
            value={formData.role}
            onChange={(event) =>
              setFormData((current) => ({ ...current, role: event.target.value }))
            }
            fullWidth
            size="small"
            aria-label="New user's role"
          >
            {ASSIGNABLE_ROLES.map((role) => (
              <MenuItem key={role.value} value={role.value}>
                {role.label}
              </MenuItem>
            ))}
          </Select>
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
              "Create User"
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
                <TableCell align="right">Role action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : (usersQuery.data || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                usersQuery.data.map((user) => (
                  <TableRow key={user._id || user.id} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleLabel(user.role)}</TableCell>
                    <TableCell>{user.isActive === false ? "Inactive" : "Active"}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <Select
                          size="small"
                          value={
                            selectedRoles[user._id || user.id] ||
                            user.role
                          }
                          onChange={(event) =>
                            setSelectedRoles((current) => ({
                              ...current,
                              [user._id || user.id]: event.target.value,
                            }))
                          }
                          aria-label={`Role for ${user.name}`}
                          sx={{ minWidth: 150, textAlign: "left" }}
                        >
                          {ROLES.map((role) => (
                            <MenuItem key={role.value} value={role.value}>
                              {role.label}
                            </MenuItem>
                          ))}
                        </Select>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={updateRoleMutation.isPending}
                          onClick={() =>
                            updateRoleMutation.mutate({
                              userId: user._id || user.id,
                              role:
                                selectedRoles[user._id || user.id] ||
                                user.role,
                            })
                          }
                          sx={{ textTransform: "none" }}
                        >
                          Assign
                        </Button>
                      </Box>
                    </TableCell>
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
