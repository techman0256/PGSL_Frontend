<<<<<<< HEAD

import { useEffect, useState } from "react";
import "./MilkReception.css";

const STORAGE_KEY = "gadvasu_milk_receptions";

const initialRecords = [
  {
    id: "MR-20261007-004",
    date: "2026-10-07",
    milkType: "Cow",
    quantity: 1250,
    shift: "Morning",
    time: "08:30",
  },
  {
    id: "MR-20261007-003",
    date: "2026-10-07",
    milkType: "Buffalo",
    quantity: 800,
    shift: "Morning",
    time: "09:00",
  },
  {
    id: "MR-20261006-002",
    date: "2026-10-06",
    milkType: "Goat",
    quantity: 250,
    shift: "Evening",
    time: "17:00",
  },
  {
    id: "MR-20261006-001",
    date: "2026-10-06",
    milkType: "Sahiwal",
    quantity: 600,
    shift: "Evening",
    time: "17:30",
  },
];

const emptyForm = {
  milkType: "Cow",
  quantity: "1250",
  date: "2026-10-07",
  shift: "Morning",
  time: "08:30",
};

function formatDate(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatQuantity(quantity) {
  return Number(quantity).toLocaleString("en-IN");
}

function formatTime(timeString) {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${String(displayHours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")} ${suffix}`;
}

function getNextBatchId(date, records) {
  const datePart = date.replaceAll("-", "");
  const prefix = `MR-${datePart}-`;

  const highestNumber = records.reduce((highest, record) => {
    if (!record.id.startsWith(prefix)) return highest;

    const number = Number(record.id.slice(prefix.length));
    return Number.isFinite(number) ? Math.max(highest, number) : highest;
  }, 0);

  return `${prefix}${String(highestNumber + 1).padStart(3, "0")}`;
}

function readSavedRecords() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.error("Could not load milk reception records:", error);
  }

  return initialRecords;
}

export default function MilkReception() {
  const [records, setRecords] = useState(readSavedRecords);
  const [form, setForm] = useState({ ...emptyForm });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error("Could not save milk reception records:", error);
      setMessage("Could not save records in this browser.");
      setMessageType("error");
    }
  }, [records]);

  function updateField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setMessage("");
    setMessageType("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const quantity = Number(form.quantity);

    if (!form.date || !form.time || !form.milkType || !form.shift) {
      setMessage("Please complete all required fields.");
      setMessageType("error");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setMessage("Quantity must be a number greater than zero.");
      setMessageType("error");
      return;
    }

    const newRecord = {
      id: getNextBatchId(form.date, records),
      date: form.date,
      milkType: form.milkType,
      quantity,
      shift: form.shift,
      time: form.time,
    };

    setRecords((previous) => [newRecord, ...previous]);
    setForm({ ...emptyForm });
    setMessage(`Milk reception saved successfully. Batch ID: ${newRecord.id}`);
    setMessageType("success");
  }

  const recentRecords = [...records]
    .sort((a, b) => {
      const dateComparison = b.date.localeCompare(a.date);
      if (dateComparison !== 0) return dateComparison;
      return b.time.localeCompare(a.time);
    })
    .slice(0, 4);

  return (
    <div className="reception-page">
      <div className="reception-heading">
        <h1>Milk Reception</h1>
        <p>Record incoming milk and create a milk batch.</p>
      </div>

      <form className="reception-card" onSubmit={handleSubmit}>
        <div className="reception-card-title">New Milk Reception</div>

        <div className="reception-form-body">
          <div className="reception-grid">
            <div className="reception-field">
              <label htmlFor="batch-id">Milk Batch ID</label>
              <div className="input-with-icon">
                <input
                  id="batch-id"
                  value="Auto Generated"
                  readOnly
                  className="readonly-input"
                />
                <span className="field-icon" aria-hidden="true">♙</span>
              </div>
            </div>

            <fieldset className="reception-field segmented-field">
              <legend>Milk Type</legend>
              <div className="segment-control">
                {["Cow", "Buffalo", "Goat", "Sahiwal"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={form.milkType === type ? "segment active" : "segment"}
                    onClick={() => updateField("milkType", type)}
                    aria-pressed={form.milkType === type}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="reception-field full-width">
              <label htmlFor="quantity">Quantity (Litres)</label>
              <input
                id="quantity"
                type="number"
                min="0.01"
                step="any"
                value={form.quantity}
                onChange={(event) => updateField("quantity", event.target.value)}
                placeholder="Enter quantity in litres"
                required
              />
            </div>

            <div className="reception-field">
              <label htmlFor="reception-date">Date</label>
              <input
                id="reception-date"
                type="date"
                value={form.date}
                onChange={(event) => updateField("date", event.target.value)}
                required
              />
            </div>

            <fieldset className="reception-field segmented-field">
              <legend>Shift</legend>
              <div className="segment-control shift-control">
                {["Morning", "Evening"].map((shift) => (
                  <button
                    key={shift}
                    type="button"
                    className={form.shift === shift ? "segment active" : "segment"}
                    onClick={() => updateField("shift", shift)}
                    aria-pressed={form.shift === shift}
                  >
                    {shift}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="reception-field">
              <label htmlFor="reception-time">Time</label>
              <input
                id="reception-time"
                type="time"
                value={form.time}
                onChange={(event) => updateField("time", event.target.value)}
                required
              />
            </div>

            <div className="batch-note">
              Batch ID will be assigned when the reception is saved.
            </div>
          </div>

          {message && (
            <div
              className={`reception-message ${messageType}`}
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          )}
        </div>

        <div className="reception-form-footer">
          <button type="submit" className="save-reception-button">
            Save Reception
          </button>
        </div>
      </form>

      <section className="reception-card recent-receptions">
        <div className="recent-receptions-heading">
          <h2>Recent Milk Reception</h2>
          <span>Latest {Math.min(4, records.length)} receptions</span>
        </div>

        <div className="reception-table-wrapper">
          <table className="reception-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Batch ID</th>
                <th>Milk Type</th>
                <th className="quantity-column">Quantity</th>
                <th>Shift</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((record) => (
                <tr key={record.id}>
                  <td>{formatDate(record.date)}</td>
                  <td>{record.id}</td>
                  <td>{record.milkType}</td>
                  <td className="quantity-column">
                    {formatQuantity(record.quantity)} L
                  </td>
                  <td>{record.shift}</td>
                </tr>
              ))}

              {recentRecords.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-records">
                    No milk reception records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
=======
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
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";

import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import ContractNotice from "../components/common/ContractNotice";
import RecordDetailsDialog from "../components/common/RecordDetailsDialog";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";

import {
  getReceptions,
  createReception,
  updateReception,
  deleteReception,
  normalizeMilkBatch,
} from "../services/receptionService";
import { getBatchById } from "../services/batchApi";
import useAuth from "../context/useAuth";
import { canDeleteOperationalRecords } from "../auth/roleAccess";

const MILK_TYPES = ["Cow", "Buffalo", "Goat", "Sahiwal"];
const SHIFTS = ["Morning", "Evening"];

const getLocalDate = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const getLocalTime = () =>
  new Date().toTimeString().slice(0, 5);

export default function MilkReception() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canDeleteBatches = canDeleteOperationalRecords(user?.role);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const {
    data: receptionQueryData,
    isLoading,
    isError: receptionQueryFailed,
    error: receptionQueryError,
  } = useQuery({
    queryKey: ["receptions"],
    queryFn: getReceptions,
  });

  const selectedBatchId = selectedRecord?.id;
  const selectedBatchQuery = useQuery({
    queryKey: ["milk-batch", selectedBatchId],
    queryFn: () => getBatchById(selectedBatchId),
    enabled: Boolean(selectedBatchId),
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
      milkBatchId: "",
      milkType: "Cow",
      quantity: "1250",
      date: getLocalDate(),
      shift: "Morning",
      time: getLocalTime(),
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
        milkBatchId: "",
        milkType: "Cow",
        quantity: "",
        date: getLocalDate(),
        shift: "Morning",
        time: getLocalTime(),
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

  const updateMutation = useMutation({
    mutationFn: updateReception,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receptions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      setEditingBatchId(null);
      setSnackbar({
        open: true,
        message: "Milk batch updated successfully.",
        severity: "success",
      });
      reset({
        milkBatchId: "",
        milkType: "Cow",
        quantity: "",
        date: getLocalDate(),
        shift: "Morning",
        time: getLocalTime(),
        remarks: "",
      });
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to update milk batch.",
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
    if (editingBatchId) {
      updateMutation.mutate({ id: editingBatchId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const startEditing = (batch) => {
    const receivedAt = new Date(batch.receivedAt);
    const date = Number.isNaN(receivedAt.getTime())
      ? getLocalDate()
      : `${receivedAt.getFullYear()}-${String(receivedAt.getMonth() + 1).padStart(2, "0")}-${String(receivedAt.getDate()).padStart(2, "0")}`;
    const time = Number.isNaN(receivedAt.getTime())
      ? getLocalTime()
      : `${String(receivedAt.getHours()).padStart(2, "0")}:${String(receivedAt.getMinutes()).padStart(2, "0")}`;

    setEditingBatchId(batch.id);
    reset({
      milkBatchId: batch.batchId,
      milkType: batch.milkType,
      quantity: String(batch.quantity),
      date,
      shift: batch.shift,
      time,
      remarks: batch.remarks || "",
    });
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
      {receptionQueryFailed && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {receptionQueryError.response?.data?.message ||
            receptionQueryError.message ||
            "Could not load milk batches."}
        </Alert>
      )}
      {selectedBatchQuery.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {selectedBatchQuery.error.response?.data?.message ||
            selectedBatchQuery.error.message ||
            "Could not load the selected milk batch."}
        </Alert>
      )}

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
          {editingBatchId ? "Update Milk Batch" : "New Milk Reception"}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2.5}>
            {/* Row 1: Milk Batch ID & Milk Type */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Milk Batch ID
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. MB-2026-000001"
                disabled={Boolean(editingBatchId)}
                {...register("milkBatchId", {
                  required: "Milk batch ID is required",
                  maxLength: { value: 64, message: "Milk batch ID is too long" },
                })}
                error={Boolean(errors.milkBatchId)}
                helperText={errors.milkBatchId?.message}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Milk Type
              </Typography>
              <Controller
                name="milkType"
                control={control}
                rules={{ required: "Milk type is required" }}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={Boolean(errors.milkType)}>
                    <Select
                      {...field}
                      sx={{ borderRadius: "6px", fontSize: "13px" }}
                    >
                      {MILK_TYPES.map((milkType) => (
                        <MenuItem key={milkType} value={milkType} sx={{ fontSize: "13px" }}>
                          {milkType}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
                type="date"
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
                  <FormControl fullWidth size="small">
                    <Select
                      {...field}
                      sx={{ borderRadius: "6px", fontSize: "13px" }}
                    >
                      {SHIFTS.map((shift) => (
                        <MenuItem key={shift} value={shift} sx={{ fontSize: "13px" }}>
                          {shift}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
                type="time"
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
              disabled={createMutation.isPending || updateMutation.isPending}
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
              {createMutation.isPending || updateMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                editingBatchId ? "Save Changes" : "Save Reception"
              )}
            </Button>
            {editingBatchId && (
              <Button
                type="button"
                onClick={() => {
                  setEditingBatchId(null);
                  reset();
                }}
                sx={{ ml: 1, textTransform: "none" }}
              >
                Cancel
              </Button>
            )}
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
                      {user?.role?.toUpperCase() !== "QUALITY_STAFF" && (
                        <Tooltip title="Edit Batch">
                          <IconButton
                            size="small"
                            onClick={() => startEditing(row)}
                            sx={{ color: "#6B7280", "&:hover": { color: "#2D5A43" } }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDeleteBatches && (
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTargetId(row.id || row.batchId)}
                            sx={{ color: "#9CA3AF", "&:hover": { color: "#DC2626" } }}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
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
        data={
          selectedBatchQuery.data
            ? normalizeMilkBatch(selectedBatchQuery.data)
            : selectedRecord
        }
      />

      {/* Delete Confirmation */}
      {canDeleteBatches && (
        <DeleteConfirmDialog
          open={Boolean(deleteTargetId)}
          onClose={() => setDeleteTargetId(null)}
          onConfirm={() => deleteMutation.mutate(deleteTargetId)}
          loading={deleteMutation.isPending}
        />
      )}

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
>>>>>>> ed849be193010d54e07d0856bcc3faa2e234b9b4
  );
}
