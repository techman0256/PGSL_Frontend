import { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AddIcon from "@mui/icons-material/Add";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import SegmentedToggle from "../components/common/SegmentedToggle";
import ContractNotice from "../components/common/ContractNotice";
import RecordDetailsDialog from "../components/common/RecordDetailsDialog";

import {
  getInventory,
  addRawMaterial,
  addFinishedProduct,
} from "../services/inventoryService";
import { getErrorMessage } from "../utils/errorMessage";
import { formatDisplayDateTime } from "../utils/dateTime";

const TAB_OPTIONS = [
  { value: "finished", label: "Finished Products" },
  { value: "raw", label: "Raw Materials" },
];

export default function InventoryManagement() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("finished");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const {
    data: inventoryQueryData,
    isLoading,
  } = useQuery({
    queryKey: ["inventory"],
    queryFn: getInventory,
  });

  const inventoryData = inventoryQueryData?.data || {
    finishedProducts: [],
    rawMaterials: [],
    summary: { totalFinishedProducts: 7, totalRawMaterials: 4, lowStockCount: 2 },
  };

  const backendPersisted = inventoryQueryData?.backendPersisted ?? false;
  const contractNotice = inventoryQueryData?.contractNotice;

  const finishedProducts = inventoryData.finishedProducts || [];
  const rawMaterials = inventoryData.rawMaterials || [];
  const summary = inventoryData.summary || {
    totalFinishedProducts: finishedProducts.length,
    totalRawMaterials: rawMaterials.length,
    lowStockCount: rawMaterials.filter((m) => m.stockLevel === "Low Stock").length,
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      material: "",
      materialId: "",
      mode: "restock",
      product: "",
      quantity: "",
      unit: "Kg",
      minThreshold: "5",
    },
  });

  const watchedMaterialMode = useWatch({ control, name: "mode", defaultValue: "restock" });
  const selectedMaterialId = useWatch({ control, name: "materialId", defaultValue: "" });
  const selectedMaterial = rawMaterials.find((material) => material._id === selectedMaterialId);

  const addMaterialMutation = useMutation({
    mutationFn: addRawMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setAddModalOpen(false);
      reset();
      setSnackbar({
        open: true,
        message: "Raw material added / restocked successfully!",
        severity: "success",
      });
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message: getErrorMessage(err, "Failed to add raw material"),
        severity: "error",
      });
    },
  });

  const addProductMutation = useMutation({
    mutationFn: addFinishedProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setAddModalOpen(false);
      reset();
      setSnackbar({
        open: true,
        message: "Finished product added successfully!",
        severity: "success",
      });
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message: getErrorMessage(err, "Failed to add finished product"),
        severity: "error",
      });
    },
  });

  const openAddDialog = () => {
    reset({
      material: "",
      materialId: "",
      mode: activeTab === "raw" ? "restock" : "new",
      product: "",
      quantity: "",
      unit: "Kg",
      minThreshold: "5",
    });
    setAddModalOpen(true);
  };

  const onAddSubmit = (formData) => {
    if (activeTab === "finished") {
      addProductMutation.mutate(formData);
      return;
    }

    addMaterialMutation.mutate({
      ...formData,
      mode: watchedMaterialMode,
      material: watchedMaterialMode === "restock" ? selectedMaterial?.material : formData.material,
      materialId: selectedMaterialId,
    });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1160, mx: "auto", p: { xs: 1, md: 2 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", mb: 0.5 }}>
          Inventory Management
        </Typography>
        <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
          Automatically track finished products and raw materials used in processing.
        </Typography>
      </Box>

      {/* Contract Notice */}
      <ContractNotice notice={contractNotice} backendPersisted={backendPersisted} />

      {/* Top 3 KPI Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Card 1: Total Finished Products */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              height: "100%",
              boxSizing: "border-box",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
              <Typography sx={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>
                Total Finished Products
              </Typography>
              <Inventory2OutlinedIcon sx={{ fontSize: 18, color: "#6B7280" }} />
            </Box>
            <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              {summary.totalFinishedProducts}{" "}
              <Typography component="span" sx={{ fontSize: "13px", fontWeight: 400, color: "#6B7280" }}>
                product types
              </Typography>
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "#6B7280", mt: 0.5 }}>
              {/* {summary.mainProductCount ?? 0} main products + {summary.byProductCount ?? 0} by-products */}
            </Typography>
          </Paper>
        </Grid>

        {/* Card 2: Total Raw Materials */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              height: "100%",
              boxSizing: "border-box",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
              <Typography sx={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>
                Total Raw Materials
              </Typography>
              <LayersOutlinedIcon sx={{ fontSize: 18, color: "#6B7280" }} />
            </Box>
            <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              {summary.totalRawMaterials}{" "}
              <Typography component="span" sx={{ fontSize: "13px", fontWeight: 400, color: "#6B7280" }}>
                material types
              </Typography>
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "#6B7280", mt: 0.5 }}>
              Ingredients and packaging in inventory
            </Typography>
          </Paper>
        </Grid>

        {/* Card 3: Low Stock Items */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              height: "100%",
              boxSizing: "border-box",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
              <Typography sx={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>
                Low Stock Items
              </Typography>
              <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: "#D97706" }} />
            </Box>
            <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              {summary.lowStockCount}{" "}
              <Typography component="span" sx={{ fontSize: "13px", fontWeight: 400, color: "#6B7280" }}>
                materials
              </Typography>
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "#6B7280", mt: 0.5 }}>
              {summary.lowStockItems?.join(" and ") || "None"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Table Paper: Current Inventory */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {/* Section Top Bar */}
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
          <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
            Current Inventory
          </Typography>

          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={openAddDialog}
            sx={{
              textTransform: "none",
              fontSize: "12px",
              fontWeight: 600,
              color: "#374151",
              borderColor: "#D1D5DB",
              borderRadius: "6px",
              px: 1.8,
              py: 0.6,
              "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" },
            }}
          >
            {activeTab === "finished" ? "Add Finished Product" : "Add Raw Material"}
          </Button>
        </Box>

        {/* Tab Controls & Counters */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #F3F4F6",
          }}
        >
          <SegmentedToggle
            options={TAB_OPTIONS}
            value={activeTab}
            onChange={(val) => setActiveTab(val)}
            size="small"
          />

          <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
            {activeTab === "finished"
              ? `${finishedProducts.length} product types · including by-products`
              : `${rawMaterials.length} material types`}
          </Typography>
        </Box>

        {/* Information Notice Alert Box */}
        <Box sx={{ px: 3, pt: 1.5, pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              py: 0.8,
              px: 1.5,
              bgcolor: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: "6px",
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 16, color: "#6B7280" }} />
            <Typography sx={{ fontSize: "12px", color: "#4B5563" }}>
              {activeTab === "finished"
                ? "Finished products and by-products are automatically added when a processing batch is completed."
                : "Raw materials used during processing are automatically deducted from raw-material inventory."}
            </Typography>
          </Box>
        </Box>

        {/* Table View */}
        <TableContainer>
          {activeTab === "finished" ? (
            /* Finished Products Table */
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#FAFAFA" }}>
                  <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", py: 1.5 }}>
                    Product
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                    Quantity
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                    Unit
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                    Last Updated
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : (
                  finishedProducts.map((row) => (
                    <TableRow
                      key={row._id || row.id || `${row.product}-${row.unit}`}
                      hover
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell sx={{ fontSize: "13px", fontWeight: 500, color: "#1F2937" }}>
                        {row.product}
                        {row.isByProduct && (
                          <Chip
                            label="By-product"
                            size="small"
                            sx={{
                              ml: 1,
                              height: 18,
                              fontSize: "10px",
                              bgcolor: "#F3F4F6",
                              color: "#4B5563",
                              borderRadius: "4px",
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#1F2937" }}>
                        {row.quantity?.toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ fontSize: "13px", color: "#4B5563" }}>
                        {row.unit}
                      </TableCell>
                      <TableCell sx={{ fontSize: "13px", color: "#4B5563" }}>
                        {formatDisplayDateTime(row.lastUpdated)}
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            /* Raw Materials Table */
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#FAFAFA" }}>
                  <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", py: 1.5 }}>
                    Material
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                    Available Quantity
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                    Unit
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                    Last Used
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                    Stock Level
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
                ) : (
                  rawMaterials.map((row) => (
                    <TableRow
                      key={row._id || row.id || row.material}
                      hover
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell sx={{ fontSize: "13px", fontWeight: 500, color: "#1F2937" }}>
                        {row.material}
                      </TableCell>
                      <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#1F2937" }}>
                        {row.availableQuantity?.toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ fontSize: "13px", color: "#4B5563" }}>
                        {row.unit}
                      </TableCell>
                      <TableCell sx={{ fontSize: "13px", color: "#4B5563" }}>
                        {formatDisplayDateTime(row.lastUsed)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.stockLevel}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "11px",
                            fontWeight: 600,
                            bgcolor: row.stockLevel === "Low Stock" ? "#FEF3C7" : "#DCFCE7",
                            color: row.stockLevel === "Low Stock" ? "#92400E" : "#166534",
                            borderRadius: "4px",
                          }}
                        />
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        <Box sx={{ px: 3, py: 1.5, borderTop: "1px solid #F3F4F6" }}>
          <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
            {activeTab === "finished"
              ?               "Finished products are combined by product and unit after processing."
              : "Low Stock indicates materials below their minimum stock level · Packaging counted in pieces."}
          </Typography>
        </Box>
      </Paper>

      {/* Inventory item modal */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
          {activeTab === "finished" ? "Add Finished Product" : "Add / Restock Raw Material"}
        </DialogTitle>
        <form onSubmit={handleSubmit(onAddSubmit)}>
          <DialogContent sx={{ py: 1.5 }}>
            {activeTab === "finished" ? (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                    Product Name
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. Flavoured Milk"
                    {...register("product", { required: "Product name is required" })}
                    error={Boolean(errors.product)}
                    helperText={errors.product?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Box>
                <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                  Unit
                </Typography>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} fullWidth size="small" sx={{ borderRadius: "6px", fontSize: "13px" }}>
                      <MenuItem value="L">L</MenuItem>
                      <MenuItem value="Kg">Kg</MenuItem>
                      <MenuItem value="Units">Units</MenuItem>
                    </Select>
                  )}
                />
              </>
            ) : (
              <>
                <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                  Action
                </Typography>
                <Controller
                  name="mode"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      fullWidth
                      size="small"
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                      sx={{ borderRadius: "6px", fontSize: "13px", mb: 2 }}
                    >
                      <MenuItem value="restock">Re-stock existing material</MenuItem>
                      <MenuItem value="new">Add new material</MenuItem>
                    </Select>
                  )}
                />
                {watchedMaterialMode === "restock" ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                      Material
                    </Typography>
                    <Controller
                      name="materialId"
                      control={control}
                      rules={{ required: "Material is required" }}
                      render={({ field }) => (
                        <Select {...field} fullWidth size="small" displayEmpty error={Boolean(errors.materialId)} sx={{ borderRadius: "6px", fontSize: "13px" }}>
                          <MenuItem value=""><em>Select material</em></MenuItem>
                          {rawMaterials.map((material) => (
                            <MenuItem key={material._id} value={material._id}>
                              {material.material} ({material.unit})
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.materialId && <Typography sx={{ fontSize: "11px", color: "#D32F2F", mt: 0.5 }}>{errors.materialId.message}</Typography>}
                  </Box>
                ) : (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                        Material Name
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g. Citric Acid"
                        {...register("material", { required: "Material name is required" })}
                        error={Boolean(errors.material)}
                        helperText={errors.material?.message}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                      />
                    </Box>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid size={{ xs: 7 }}>
                        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>Unit</Typography>
                        <Controller
                          name="unit"
                          control={control}
                          render={({ field }) => (
                            <Select {...field} fullWidth size="small" sx={{ borderRadius: "6px", fontSize: "13px" }}>
                              <MenuItem value="Kg">Kg</MenuItem>
                              <MenuItem value="g">g</MenuItem>
                              <MenuItem value="L">L</MenuItem>
                              <MenuItem value="pcs">pcs</MenuItem>
                            </Select>
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 5 }}>
                        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>Low-stock alert</Typography>
                        <TextField fullWidth size="small" type="number" {...register("minThreshold", { required: "Threshold is required", min: { value: 0, message: "Threshold cannot be negative" } })} error={Boolean(errors.minThreshold)} helperText={errors.minThreshold?.message} />
                      </Grid>
                    </Grid>
                  </>
                )}
              </>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                {activeTab === "finished" ? "Starting Quantity" : watchedMaterialMode === "restock" ? "Quantity to add" : "Starting Quantity"}
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Citric Acid"
                type="number"
                slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
                {...register("quantity", { required: "Quantity is required", min: { value: 0, message: "Quantity cannot be negative" } })}
                error={Boolean(errors.quantity)}
                helperText={errors.quantity?.message}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={() => setAddModalOpen(false)}
              sx={{ textTransform: "none", color: "#6B7280", fontSize: "13px" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={addMaterialMutation.isPending || addProductMutation.isPending}
              sx={{
                bgcolor: "#2D5A43",
                "&:hover": { bgcolor: "#244835" },
                textTransform: "none",
                fontSize: "13px",
                borderRadius: "6px",
              }}
            >
              {addMaterialMutation.isPending || addProductMutation.isPending ? "Adding..." : activeTab === "finished" ? "Add Product" : watchedMaterialMode === "restock" ? "Re-stock Material" : "Add Material"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Details Modal */}
      <RecordDetailsDialog
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title="Inventory Item Details"
        data={selectedRecord}
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
