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
  MenuItem,
  Select,
  FormControl,
  Chip,
} from "@mui/material";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import SegmentedToggle from "../components/common/SegmentedToggle";
import LockedField from "../components/common/LockedField";
import ContractNotice from "../components/common/ContractNotice";
import RecordDetailsDialog from "../components/common/RecordDetailsDialog";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import FormDateTimePicker from "../components/common/FormDateTimePicker";

import {
  getDispatches,
  getAvailableProductsForDispatch,
  createDispatch,
  deleteDispatch,
} from "../services/dispatchService";
import {
  getLocalDateTime,
  formatDisplayDateTime,
} from "../utils/dateTime";

const CHANNEL_OPTIONS = ["Retail", "Wholesale", "Distributor"];
const UNIT_OPTIONS = ["L", "Kg", "Units"];


export default function DispatchManagement() {
  const queryClient = useQueryClient();

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const {
    data: dispatchesQueryData,
    isLoading,
  } = useQuery({
    queryKey: ["dispatches"],
    queryFn: getDispatches,
  });

  const { data: availableProducts = [] } = useQuery({
    queryKey: ["dispatch-available-products"],
    queryFn: getAvailableProductsForDispatch,
  });

  const dispatches = dispatchesQueryData?.data || [];
  const backendPersisted = dispatchesQueryData?.backendPersisted ?? false;
  const contractNotice = dispatchesQueryData?.contractNotice;

  const finishedProducts = useMemo(() => availableProducts, [availableProducts]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      product: "Liquid Milk",
      quantity: "100",
      unit: "L",
      customer: "FreshMart Stores",
      channel: "Retail",
      dispatchDateTime: getLocalDateTime(),
    },
  });

  const watchedProduct = useWatch({ control, name: "product", defaultValue: "Liquid Milk" });
  const watchedUnit = useWatch({ control, name: "unit", defaultValue: "L" });

  const selectedProductInfo = useMemo(() => {
    return (
      finishedProducts.find((p) => p.product === watchedProduct) || {
        product: "Liquid Milk",
        quantity: 588,
        unit: "L",
        processingBatch: "MP-20261007-006",
      }
    );
  }, [watchedProduct, finishedProducts]);

  const createMutation = useMutation({
    mutationFn: createDispatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-available-products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      setSnackbar({
        open: true,
        message: "Dispatch order created successfully!",
        severity: "success",
      });
      reset({
        product: finishedProducts[0]?.product || "Liquid Milk",
        quantity: "",
        unit: "L",
        customer: "",
        channel: "Retail",
        dispatchDateTime: getLocalDateTime(),
      });
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to create dispatch",
        severity: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDispatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-available-products"] });
      setDeleteTargetId(null);
      setSnackbar({
        open: true,
        message: "Dispatch record deleted.",
        severity: "info",
      });
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to delete dispatch",
        severity: "error",
      });
    },
  });

  const onSubmit = (formData) => {
    createMutation.mutate({
      ...formData,
      processingBatchId: selectedProductInfo.processingBatch,
    });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1160, mx: "auto", p: { xs: 1, md: 2 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", mb: 0.5 }}>
            Dispatch Management
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
            Manage finished product dispatches and record sales revenue.
          </Typography>
        </Box>

        <Chip
          label="Stage 6 · Final stage"
          size="small"
          sx={{
            bgcolor: "#EBF3ED",
            color: "#2D5A43",
            fontWeight: 600,
            fontSize: "12px",
            borderRadius: "6px",
          }}
        />
      </Box>

      {/* Contract Notice */}
      <ContractNotice notice={contractNotice} backendPersisted={backendPersisted} />

      {/* Form Card: Create Dispatch */}
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 2.5 }}>
          <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
            Create Dispatch
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
            New dispatch
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2.5}>
            {/* Row 1: Dispatch ID, Product, Quantity, Unit */}
            <Grid size={{ xs: 12, md: 3 }}>
              <LockedField
                label="Dispatch ID"
                placeholder="Auto Generated"
                bottomNote="Assigned automatically on creation"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Product
              </Typography>
              <Controller
                name="product"
                control={control}
                rules={{ required: "Product is required" }}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <Select
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        const p = finishedProducts.find((it) => it.product === e.target.value);
                        if (p?.unit) setValue("unit", p.unit);
                      }}
                      sx={{ borderRadius: "6px", fontSize: "13px" }}
                    >
                      {finishedProducts.map((p) => (
                        <MenuItem key={p.product} value={p.product} sx={{ fontSize: "13px" }}>
                          {p.product}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
              <Typography sx={{ fontSize: "11px", color: "#6B7280", mt: 0.5 }}>
                {selectedProductInfo.quantity} {selectedProductInfo.unit} in snapshot · 468 {selectedProductInfo.unit} available
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Quantity
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                slotProps={{ htmlInput: { step: "any" } }}
                placeholder="100"
                {...register("quantity", {
                  required: "Quantity is required",
                  min: { value: 1, message: "Must be greater than 0" },
                })}
                error={Boolean(errors.quantity)}
                helperText={errors.quantity?.message}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />
              <Typography sx={{ fontSize: "11px", color: "#6B7280", mt: 0.5 }}>
                Quantity to dispatch from Inventory
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Unit
              </Typography>
              <SegmentedToggle
                options={UNIT_OPTIONS}
                value={watchedUnit || "L"}
                onChange={(val) => setValue("unit", val)}
                fullWidth
              />
              <Typography sx={{ fontSize: "11px", color: "#6B7280", mt: 0.5 }}>
                Use the selected product's inventory unit
              </Typography>
            </Grid>

            {/* Row 2: Processing Batch ID, Customer / Buyer, Channel */}
            <Grid size={{ xs: 12, md: 4 }}>
              <LockedField
                label="Processing Batch ID"
                value={selectedProductInfo.processingBatch}
                bottomNote="Auto-linked from the selected product"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Customer / Buyer
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="FreshMart Stores"
                {...register("customer", { required: "Customer name is required" })}
                error={Boolean(errors.customer)}
                helperText={errors.customer?.message}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Channel
              </Typography>
              <Controller
                name="channel"
                control={control}
                rules={{ required: "Channel is required" }}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <Select {...field} sx={{ borderRadius: "6px", fontSize: "13px" }}>
                      {CHANNEL_OPTIONS.map((ch) => (
                        <MenuItem key={ch} value={ch} sx={{ fontSize: "13px" }}>
                          {ch}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
              <Typography sx={{ fontSize: "11px", color: "#6B7280", mt: 0.5 }}>
                Retail / Wholesale / Distributor
              </Typography>
            </Grid>

            {/* Row 3: Dispatch Date & Time */}
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Dispatch Date & Time
              </Typography>
              <FormDateTimePicker
                control={control}
                name="dispatchDateTime"
                rules={{ required: "Date & Time is required" }}
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16, color: "#6B7280" }} />
              <Typography sx={{ fontSize: "11.5px", color: "#6B7280" }}>
                Creating a dispatch automatically deducts stock from Finished Goods Inventory and retains the Processing Batch ID for traceability.
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
                "Create Dispatch"
              )}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Table Card: Recent Dispatches */}
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
            Recent Dispatches
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
            07 Oct 2026 · All {dispatches.length} recorded dispatches
          </Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#FAFAFA" }}>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", py: 1.5 }}>
                  Date & Time
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Dispatch ID
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Product
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Quantity
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Unit
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Channel
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Customer
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
              ) : dispatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: "#9CA3AF" }}>
                    No dispatches recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                dispatches.map((row) => (
                  <TableRow
                    key={row.id || row.dispatchId}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell sx={{ fontSize: "13px", color: "#1F2937" }}>
                      {formatDisplayDateTime(row.dateTime)}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", fontWeight: 500, color: "#1F2937" }}>
                      {row.dispatchId}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", fontWeight: 500, color: "#1F2937" }}>
                      {row.product}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#1F2937" }}>
                      {row.quantity?.toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", color: "#4B5563" }}>
                      {row.unit}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", color: "#1F2937" }}>
                      {row.channel}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", color: "#4B5563" }}>
                      {row.customer}
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
                          onClick={() => setDeleteTargetId(row.id || row.dispatchId)}
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
            Revenue in INR · Quantities use each product's inventory unit · New dispatch above is not included.
          </Typography>
        </Box>
      </Paper>

      {/* Details Modal */}
      <RecordDetailsDialog
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title="Dispatch Order Details"
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
