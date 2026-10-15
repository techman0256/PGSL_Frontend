import { useState, useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
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

import LockedField from "../components/common/LockedField";
import ContractNotice from "../components/common/ContractNotice";
import RecordDetailsDialog from "../components/common/RecordDetailsDialog";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";

import {
  getStorageRecords,
  createStorageRecord,
  deleteStorageRecord,
  siloCapacities,
} from "../services/storageService";
import { getQualityTests } from "../services/qualityService";
import { getReceptions } from "../services/receptionService";

const SILOS = ["Silo 01", "Silo 02", "Silo 03", "Silo 04"];

export default function RawMilkStorage() {
  const queryClient = useQueryClient();

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const {
    data: storageQueryData,
    isLoading,
  } = useQuery({
    queryKey: ["storage-records"],
    queryFn: getStorageRecords,
  });

  const { data: testsQueryData } = useQuery({
    queryKey: ["quality-tests"],
    queryFn: getQualityTests,
  });

  const { data: receptionsQueryData } = useQuery({
    queryKey: ["receptions"],
    queryFn: getReceptions,
  });

  const records = storageQueryData?.data || [];
  const backendPersisted = storageQueryData?.backendPersisted ?? false;
  const contractNotice = storageQueryData?.contractNotice;

  const testedBatches = testsQueryData?.data || [
    { batchId: "MR-20261007-004" },
    { batchId: "MR-20261007-003" },
    { batchId: "MR-20261006-002" },
    { batchId: "MR-20261006-001" },
  ];

  const receptions = useMemo(() => {
    return receptionsQueryData?.data || [];
  }, [receptionsQueryData?.data]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      batchId: "MR-20261007-004",
      siloNumber: "Silo 01",
      temperature: "4.0",
      storageDate: "07 Oct 2026",
      storageTime: "09:00 AM",
      quantity: "1250",
      remarks: "",
    },
  });

  const watchedBatchId = useWatch({ control, name: "batchId", defaultValue: "MR-20261007-004" });
  const watchedSilo = useWatch({ control, name: "siloNumber", defaultValue: "Silo 01" });

  // Auto determine milk type from receptions
  const autoMilkType = useMemo(() => {
    const found = receptions.find((r) => r.batchId === watchedBatchId);
    if (found) return `${found.milkType} Milk`;
    if (watchedBatchId === "MR-20261007-004") return "Cow Milk";
    if (watchedBatchId === "MR-20261007-003") return "Buffalo Milk";
    if (watchedBatchId === "MR-20261006-002") return "Goat Milk";
    return "Cow Milk";
  }, [watchedBatchId, receptions]);

  const autoCapacity = useMemo(() => {
    return (siloCapacities[watchedSilo] || 5000).toLocaleString();
  }, [watchedSilo]);

  const createMutation = useMutation({
    mutationFn: createStorageRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storage-records"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      setSnackbar({
        open: true,
        message: "Storage record saved successfully!",
        severity: "success",
      });
      reset({
        batchId: testedBatches[0]?.batchId || "",
        siloNumber: "Silo 01",
        temperature: "4.0",
        storageDate: "07 Oct 2026",
        storageTime: "09:00 AM",
        quantity: "",
        remarks: "",
      });
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message: err.message || "Failed to save storage record",
        severity: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStorageRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storage-records"] });
      setDeleteTargetId(null);
      setSnackbar({
        open: true,
        message: "Storage record deleted.",
        severity: "info",
      });
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message: err.message || "Failed to delete storage record",
        severity: "error",
      });
    },
  });

  const onSubmit = (formData) => {
    createMutation.mutate({
      ...formData,
      milkType: autoMilkType,
      date: formData.storageDate,
      time: formData.storageTime,
    });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1160, mx: "auto", p: { xs: 1, md: 2 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", mb: 0.5 }}>
          Raw Milk Storage
        </Typography>
        <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
          Store quality-tested milk batches in silos and monitor storage conditions.
        </Typography>
      </Box>

      {/* Contract / Endpoint Transparency Notice */}
      <ContractNotice notice={contractNotice} backendPersisted={backendPersisted} />

      {/* Form Card: Add Milk to Storage */}
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
          Add Milk to Storage
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2.5}>
            {/* Row 1: Storage Record ID & Silo Capacity */}
            <Grid size={{ xs: 12, md: 6 }}>
              <LockedField
                label="Storage Record ID"
                placeholder="Auto Generated"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <LockedField
                label="Silo Capacity (Litres)"
                topSubtitle="Automatically displayed"
                value={autoCapacity}
              />
            </Grid>

            {/* Row 2: Milk Batch ID & Storage Temperature */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>
                  Milk Batch ID
                </Typography>
                <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                  Select from quality-tested batches
                </Typography>
              </Box>
              <Controller
                name="batchId"
                control={control}
                rules={{ required: "Milk Batch ID is required" }}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={Boolean(errors.batchId)}>
                    <Select {...field} sx={{ borderRadius: "6px", fontSize: "13px" }}>
                      {testedBatches.map((b) => (
                        <MenuItem key={b.batchId} value={b.batchId} sx={{ fontSize: "13px" }}>
                          {b.batchId}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Storage Temperature (°C)
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                step="0.1"
                placeholder="e.g. 4.0"
                {...register("temperature", {
                  required: "Storage temperature is required",
                  min: { value: 0, message: "Min temp is 0°C" },
                  max: { value: 15, message: "Temp must remain under 15°C for cold storage" },
                })}
                error={Boolean(errors.temperature)}
                helperText={errors.temperature?.message}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />
            </Grid>

            {/* Row 3: Milk Type & Storage Date */}
            <Grid size={{ xs: 12, md: 6 }}>
              <LockedField
                label="Milk Type"
                topSubtitle="Automatically displayed"
                value={autoMilkType}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Storage Date
              </Typography>
              <TextField
                fullWidth
                size="small"
                {...register("storageDate", { required: "Storage date is required" })}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />
            </Grid>

            {/* Row 4: Quantity (Litres) & Storage Time */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Quantity (Litres)
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder="e.g. 1,250"
                {...register("quantity", {
                  required: "Quantity is required",
                  min: { value: 1, message: "Must be at least 1 L" },
                })}
                error={Boolean(errors.quantity)}
                helperText={errors.quantity?.message}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Storage Time
              </Typography>
              <TextField
                fullWidth
                size="small"
                {...register("storageTime", { required: "Storage time is required" })}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />
            </Grid>

            {/* Row 5: Silo Number & Remarks */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>
                  Silo Number
                </Typography>
                <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                  Select Silo
                </Typography>
              </Box>
              <Controller
                name="siloNumber"
                control={control}
                rules={{ required: "Silo is required" }}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <Select {...field} sx={{ borderRadius: "6px", fontSize: "13px" }}>
                      {SILOS.map((silo) => (
                        <MenuItem key={silo} value={silo} sx={{ fontSize: "13px" }}>
                          {silo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Remarks
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Optional"
                {...register("remarks")}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />
            </Grid>
          </Grid>

          {/* Form Footer */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 3,
              pt: 2,
              borderTop: "1px solid #F3F4F6",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                Only batches that completed Quality Testing are available for storage.
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                The selected Milk Batch ID stays linked to this storage record.
              </Typography>
            </Box>

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
                "Save Storage Record"
              )}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Table Card: Recent Storage Records */}
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
            Recent Storage Records
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
            Latest {records.length} records
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
                  Storage Record ID
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Milk Batch ID
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Milk Type
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Quantity (L)
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Silo Number
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Temperature (°C)
                </TableCell>
                <TableCell align="right" sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: "#9CA3AF" }}>
                    No storage records found.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((row) => (
                  <TableRow
                    key={row.id || row.storageRecordId}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell sx={{ fontSize: "13px", color: "#1F2937" }}>
                      {row.date}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", fontWeight: 500, color: "#1F2937" }}>
                      {row.storageRecordId}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", color: "#1F2937" }}>
                      {row.batchId}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", color: "#4B5563" }}>
                      {row.milkType}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#1F2937" }}>
                      {row.quantity?.toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", color: "#1F2937" }}>
                      {row.siloNumber}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", color: "#1F2937" }}>
                      {Number(row.temperature).toFixed(1)}
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
                          onClick={() => setDeleteTargetId(row.id || row.storageRecordId)}
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
            Silo capacities: 01 — 5,000 L · 02 — 2,000 L · 03 — 1,000 L · 04 — 2,000 L. Temperature recorded at storage.
          </Typography>
        </Box>
      </Paper>

      {/* Details Modal */}
      <RecordDetailsDialog
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title="Raw Milk Storage Record Details"
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

