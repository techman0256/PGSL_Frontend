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
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import ContractNotice from "../components/common/ContractNotice";
import RecordDetailsDialog from "../components/common/RecordDetailsDialog";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import FormDatePicker from "../components/common/FormDatePicker";
import FormTimePicker from "../components/common/FormTimePicker";

import {
  getQualityTests,
  getAvailableBatchesForTesting,
  createQualityTest,
  deleteQualityTest,
} from "../services/qualityService";
import useAuth from "../context/useAuth";
import { canDeleteOperationalRecords } from "../auth/roleAccess";
import { getLocalDate, getLocalTime } from "../utils/dateTime";

export default function QualityTesting() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canDeleteTests = canDeleteOperationalRecords(user?.role);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const {
    data: testsQueryData,
    isLoading,
  } = useQuery({
    queryKey: ["quality-tests"],
    queryFn: getQualityTests,
  });

  const {
    data: availableBatches = [],
    isError: availableBatchesError,
    error: availableBatchesErrorDetails,
  } = useQuery({
    queryKey: ["quality-test-available-batches"],
    queryFn: getAvailableBatchesForTesting,
  });

  const tests = testsQueryData?.data || [];
  const backendPersisted = testsQueryData?.backendPersisted ?? false;
  const contractNotice = testsQueryData?.contractNotice;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      batchId: "",
      fat: "3.80",
      snf: "8.50",
      temperature: "6.0",
      testDate: getLocalDate(),
      testTime: getLocalTime(),
      remarks: "Quality measurements recorded for the received milk sample.",
    },
  });

  const createMutation = useMutation({
    mutationFn: createQualityTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quality-tests"] });
      queryClient.invalidateQueries({ queryKey: ["quality-test-available-batches"] });
      queryClient.invalidateQueries({ queryKey: ["storage-available-batches"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      setSnackbar({
        open: true,
        message: "Quality test recorded successfully!",
        severity: "success",
      });
      reset({
        batchId: "",
        fat: "",
        snf: "",
        temperature: "",
        testDate: getLocalDate(),
        testTime: getLocalTime(),
        remarks: "",
      });
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message: err.message || "Failed to record quality test",
        severity: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQualityTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quality-tests"] });
      setDeleteTargetId(null);
      setSnackbar({
        open: true,
        message: "Quality test record deleted.",
        severity: "info",
      });
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message: err.message || "Failed to delete quality test record",
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
          Quality Testing
        </Typography>
        <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
          Record quality parameters for received milk batches.
        </Typography>
      </Box>

      {/* Contract / Endpoint Transparency Notice */}
      <ContractNotice notice={contractNotice} backendPersisted={backendPersisted} />
      {availableBatchesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {availableBatchesErrorDetails.response?.data?.message ||
            availableBatchesErrorDetails.message ||
            "Could not load batches ready for quality testing."}
        </Alert>
      )}

      {/* Form Card: Milk Quality Test */}
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
          Milk Quality Test
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2.5}>
            {/* Row 1: Milk Batch ID Dropdown */}
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Milk Batch ID
              </Typography>
              <Controller
                name="batchId"
                control={control}
                rules={{ required: "Milk Batch ID is required" }}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={Boolean(errors.batchId)}>
                    <Select
                      {...field}
                      sx={{
                        borderRadius: "6px",
                        fontSize: "13px",
                      }}
                    >
                      <MenuItem value="" disabled sx={{ fontSize: "13px" }}>
                        Select an available batch
                      </MenuItem>
                      {availableBatches.map((batch) => (
                        <MenuItem key={batch.batchId} value={batch.batchId} sx={{ fontSize: "13px" }}>
                          {batch.batchId}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Row 2: Fat (%), SNF (%), Temperature (°C) */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Fat (%)
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                slotProps={{ htmlInput: { step: "0.01" } }}
                placeholder="e.g. 3.80"
                {...register("fat", {
                  required: "Fat percentage is required",
                  min: { value: 0.1, message: "Min fat is 0.1%" },
                  max: { value: 15, message: "Max fat is 15%" },
                })}
                error={Boolean(errors.fat)}
                helperText={errors.fat?.message}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                SNF (%)
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                slotProps={{ htmlInput: { step: "0.01" } }}
                placeholder="e.g. 8.50"
                {...register("snf", {
                  required: "SNF percentage is required",
                  min: { value: 5, message: "Min SNF is 5%" },
                  max: { value: 15, message: "Max SNF is 15%" },
                })}
                error={Boolean(errors.snf)}
                helperText={errors.snf?.message}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Temperature (°C)
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                slotProps={{ htmlInput: { step: "0.1" } }}
                placeholder="e.g. 6.0"
                {...register("temperature", {
                  required: "Temperature is required",
                  min: { value: 0, message: "Min temperature is 0°C" },
                  max: { value: 30, message: "Max temperature is 30°C" },
                })}
                error={Boolean(errors.temperature)}
                helperText={errors.temperature?.message}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />
            </Grid>

            {/* Row 3: Test Date & Test Time */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Test Date
              </Typography>
              <FormDatePicker
                control={control}
                name="testDate"
                rules={{ required: "Test Date is required" }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Test Time
              </Typography>
              <FormTimePicker
                control={control}
                name="testTime"
                rules={{ required: "Test Time is required" }}
              />
            </Grid>

            {/* Row 4: Remarks */}
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Remarks
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Quality measurements recorded for the received milk sample."
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
            <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
              Select a Milk Batch ID from received batches.
            </Typography>

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
                "Save Test Result"
              )}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Table Card: Recent Quality Test Records */}
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
            Recent Quality Test Records
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
            Latest {tests.length} tests
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
                  Fat %
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  SNF %
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Temperature
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
              ) : tests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: "#9CA3AF" }}>
                    No quality tests recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                tests.map((row) => (
                  <TableRow
                    key={row.id || row.batchId}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell sx={{ fontSize: "13px", color: "#1F2937" }}>
                      {row.testDate}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", fontWeight: 500, color: "#1F2937" }}>
                      {row.batchId}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", color: "#1F2937" }}>
                      {Number(row.fat).toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", color: "#1F2937" }}>
                      {Number(row.snf).toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", color: "#1F2937" }}>
                      {Number(row.temperature).toFixed(1)} °C
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
                      {canDeleteTests && (
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
            Fat and SNF in % · Temperature is measured during the quality test.
          </Typography>
        </Box>
      </Paper>

      {/* Details Modal */}
      <RecordDetailsDialog
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title="Quality Test Record Details"
        data={selectedRecord}
      />

      {/* Delete Confirmation */}
      {canDeleteTests && (
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
  );
}
