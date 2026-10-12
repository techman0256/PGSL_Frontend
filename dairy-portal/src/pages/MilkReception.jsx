import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";

import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import SegmentedToggle from "../components/common/SegmentedToggle";
import LockedField from "../components/common/LockedField";
import ContractNotice from "../components/common/ContractNotice";
import RecordDetailsDialog from "../components/common/RecordDetailsDialog";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";

import {
  getReceptions,
  createReception,
  deleteReception,
} from "../services/receptionService";

const MILK_TYPES = ["Cow", "Buffalo", "Goat", "Sahiwal"];
const SHIFTS = ["Morning", "Evening"];

export default function MilkReception() {
  const queryClient = useQueryClient();

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const {
    data: receptionQueryData,
    isLoading,
  } = useQuery({
    queryKey: ["receptions"],
    queryFn: getReceptions,
  });

  const receptions = receptionQueryData?.data || [];
  const backendPersisted = receptionQueryData?.backendPersisted ?? false;
  const contractNotice = receptionQueryData?.contractNotice;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      milkType: "Cow",
      quantity: "1250",
      date: "07 Oct 2026",
      shift: "Morning",
      time: "08:30 AM",
      remarks: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createReception,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receptions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      setSnackbar({
        open: true,
        message: "Milk reception batch recorded successfully!",
        severity: "success",
      });
      reset({
        milkType: "Cow",
        quantity: "",
        date: "07 Oct 2026",
        shift: "Morning",
        time: "08:30 AM",
        remarks: "",
      });
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message: err.message || "Failed to record milk reception",
        severity: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReception,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receptions"] });
      setDeleteTargetId(null);
      setSnackbar({
        open: true,
        message: "Reception record deleted successfully.",
        severity: "info",
      });
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message: err.message || "Failed to delete reception record",
        severity: "error",
      });
    },
  });

  const onSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1160, mx: "auto", p: { xs: 1, md: 2 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", mb: 0.5 }}>
          Milk Reception
        </Typography>
        <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
          Record incoming milk and create a milk batch.
        </Typography>
      </Box>

      {/* Contract / Endpoint Transparency Notice */}
      <ContractNotice notice={contractNotice} backendPersisted={backendPersisted} />

      {/* Form Card: New Milk Reception */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          bgcolor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "8px",
        }}
      >
        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", mb: 2.5 }}>
          New Milk Reception
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2.5}>
            {/* Row 1: Milk Batch ID & Milk Type */}
            <Grid size={{ xs: 12, md: 6 }}>
              <LockedField
                label="Milk Batch ID"
                placeholder="Auto Generated"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Milk Type
              </Typography>
              <Controller
                name="milkType"
                control={control}
                render={({ field }) => (
                  <SegmentedToggle
                    options={MILK_TYPES}
                    value={field.value}
                    onChange={field.onChange}
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Row 2: Quantity (Litres) */}
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Quantity (Litres)
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. 1,250"
                type="number"
                {...register("quantity", {
                  required: "Quantity is required",
                  min: { value: 1, message: "Quantity must be greater than 0" },
                  max: { value: 50000, message: "Quantity exceeds max allowable single intake" },
                })}
                error={Boolean(errors.quantity)}
                helperText={errors.quantity?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                  },
                }}
              />
            </Grid>

            {/* Row 3: Date & Shift */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Date
              </Typography>
              <TextField
                fullWidth
                size="small"
                {...register("date", { required: "Date is required" })}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Shift
              </Typography>
              <Controller
                name="shift"
                control={control}
                render={({ field }) => (
                  <SegmentedToggle
                    options={SHIFTS}
                    value={field.value}
                    onChange={field.onChange}
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Row 4: Time & Batch info */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Time
              </Typography>
              <TextField
                fullWidth
                size="small"
                {...register("time", { required: "Time is required" })}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: { md: 2.5 } }}>
                Batch ID will be assigned when the reception is saved.
              </Typography>
            </Grid>
          </Grid>

          {/* Form Actions */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, pt: 2, borderTop: "1px solid #F3F4F6" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending}
              sx={{
                bgcolor: "#2D5A43",
                "&:hover": { bgcolor: "#244835" },
                color: "#FFFFFF",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "13px",
                px: 3,
                py: 1,
                borderRadius: "6px",
                boxShadow: "none",
              }}
            >
              {createMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Save Reception"
              )}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Table Card: Recent Milk Reception */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #F3F4F6",
          }}
        >
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
            Recent Milk Reception
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
            Latest {receptions.length} receptions
          </Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#FAFAFA" }}>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", py: 1.5 }}>
                  Date
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Batch ID
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Milk Type
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Quantity
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Shift
                </TableCell>
                <TableCell align="right" sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : receptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: "#9CA3AF" }}>
                    No milk receptions recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                receptions.map((row) => (
                  <TableRow
                    key={row.id || row.batchId}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell sx={{ fontSize: "13px", color: "#1F2937" }}>
                      {row.date}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", fontWeight: 500, color: "#1F2937" }}>
                      {row.batchId}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", color: "#4B5563" }}>
                      {row.milkType}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#1F2937" }}>
                      {row.quantity?.toLocaleString()} L
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", color: "#4B5563" }}>
                      {row.shift}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => setSelectedRecord(row)}
                          sx={{ color: "#6B7280", "&:hover": { color: "#2D5A43" } }}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => setDeleteTargetId(row.id || row.batchId)}
                          sx={{ color: "#9CA3AF", "&:hover": { color: "#DC2626" } }}
                        >
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ px: 3, py: 1.5, borderTop: "1px solid #F3F4F6" }}>
          <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
            Quantity in litres · All amounts in INR · Total cost = quantity × price per litre.
          </Typography>
        </Box>
      </Paper>

      {/* Details Modal */}
      <RecordDetailsDialog
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title="Milk Reception Batch Details"
        data={selectedRecord}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => deleteMutation.mutate(deleteTargetId)}
        loading={deleteMutation.isPending}
      />

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: "6px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

