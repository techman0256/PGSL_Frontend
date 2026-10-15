import { useState, useMemo } from "react";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
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
  Stack,
  Chip,
} from "@mui/material";

import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";

import SegmentedToggle from "../components/common/SegmentedToggle";
import LockedField from "../components/common/LockedField";
import ContractNotice from "../components/common/ContractNotice";
import RecordDetailsDialog from "../components/common/RecordDetailsDialog";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";

import {
  getProcessingBatches,
  createProcessingBatch,
  deleteProcessingBatch,
} from "../services/processingService";
import { getStorageRecords } from "../services/storageService";

const DEFAULT_PRODUCTS = [
  "Liquid Milk",
  "Curd",
  "Butter",
  "Ghee",
  "Paneer",
  "Goat Cheese",
];

const RAW_MATERIAL_OPTIONS = [
  "Citric Acid",
  "Starter Culture",
  "Salt",
  "Stabilizer",
  "Packaging Materials",
];

const BY_PRODUCT_OPTIONS = ["Cream", "Whey", "Buttermilk", "Skimmed Milk"];

const fallbackStorageRecords = [
  { batchId: "MR-20261007-004", milkType: "Cow Milk", quantity: 1250 },
  { batchId: "MR-20261007-003", milkType: "Buffalo Milk", quantity: 800 },
  { batchId: "MR-20261006-002", milkType: "Goat Milk", quantity: 250 },
  { batchId: "MR-20261006-001", milkType: "Sahiwal Milk", quantity: 600 },
];

export default function MilkProcessing() {
  const queryClient = useQueryClient();

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [productTabs, setProductTabs] = useState(DEFAULT_PRODUCTS);
  const [activeTab, setActiveTab] = useState("Liquid Milk");

  const {
    data: processingQueryData,
    isLoading,
  } = useQuery({
    queryKey: ["processing-batches"],
    queryFn: getProcessingBatches,
  });

  const { data: storageQueryData } = useQuery({
    queryKey: ["storage-records"],
    queryFn: getStorageRecords,
  });

  const batches = processingQueryData?.data || [];
  const backendPersisted = processingQueryData?.backendPersisted ?? false;
  const contractNotice = processingQueryData?.contractNotice;

  const storageRecords = useMemo(() => {
    return storageQueryData?.data || fallbackStorageRecords;
  }, [storageQueryData?.data]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      inputMilkBatch: "MR-20261007-004",
      inputQuantity: "300",
      processingDate: "07 Oct 2026",
      processingTime: "10:30 AM",
      outputQuantity: "294",
      unit: "L",
      remarks: "Record final output after processing.",
      materialType: "",
      materialQty: "",
      byProductType: "Cream",
      byProductQty: "6",
      byProductUnit: "L",
      addedMaterials: [],
      addedByProducts: [{ byProduct: "Cream", quantity: 6, unit: "L" }],
    },
  });

  const { fields: materialFields, append: appendMaterial, remove: removeMaterial } =
    useFieldArray({ control, name: "addedMaterials" });

  const { fields: byProductFields, append: appendByProduct, remove: removeByProduct } =
    useFieldArray({ control, name: "addedByProducts" });

  const watchedBatchId = useWatch({ control, name: "inputMilkBatch", defaultValue: "MR-20261007-004" });
  const watchedUnit = useWatch({ control, name: "unit", defaultValue: "L" });
  const watchedByProductUnit = useWatch({ control, name: "byProductUnit", defaultValue: "L" });
  const watchedMaterialType = useWatch({ control, name: "materialType", defaultValue: "" });
  const watchedMaterialQty = useWatch({ control, name: "materialQty", defaultValue: "" });
  const watchedByProductType = useWatch({ control, name: "byProductType", defaultValue: "Cream" });
  const watchedByProductQty = useWatch({ control, name: "byProductQty", defaultValue: "6" });

  // Determine milk type from selected storage batch
  const selectedMilkType = useMemo(() => {
    const found = storageRecords.find((s) => s.batchId === watchedBatchId);
    if (found?.milkType) {
      return found.milkType.replace(" Milk", "");
    }
    return "Cow";
  }, [watchedBatchId, storageRecords]);

  const handleAddTab = () => {
    const newName = prompt("Enter new product type name:");
    if (newName && !productTabs.includes(newName.trim())) {
      setProductTabs([...productTabs, newName.trim()]);
      setActiveTab(newName.trim());
    }
  };

  const handleAddMaterialItem = () => {
    if (!watchedMaterialType || !watchedMaterialQty) return;
    appendMaterial({
      material: watchedMaterialType,
      quantity: Number(watchedMaterialQty),
      unit: watchedMaterialType === "Starter Culture" ? "g" : "Kg",
    });
    setValue("materialType", "");
    setValue("materialQty", "");
  };

  const handleAddByProductItem = () => {
    if (!watchedByProductType || !watchedByProductQty) return;
    appendByProduct({
      byProduct: watchedByProductType,
      quantity: Number(watchedByProductQty),
      unit: watchedByProductUnit || "L",
    });
    setValue("byProductQty", "");
  };

  const createMutation = useMutation({
    mutationFn: createProcessingBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processing-batches"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      setSnackbar({
        open: true,
        message: "Processing batch recorded successfully!",
        severity: "success",
      });
      reset({
        inputMilkBatch: storageRecords[0]?.batchId || "",
        inputQuantity: "",
        processingDate: "07 Oct 2026",
        processingTime: "10:30 AM",
        outputQuantity: "",
        unit: "L",
        remarks: "",
        materialType: "",
        materialQty: "",
        byProductType: "Cream",
        byProductQty: "",
        byProductUnit: "L",
        addedMaterials: [],
        addedByProducts: [],
      });
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message: err.message || "Failed to record processing batch",
        severity: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProcessingBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processing-batches"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setDeleteTargetId(null);
      setSnackbar({
        open: true,
        message: "Processing batch deleted.",
        severity: "info",
      });
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message: err.message || "Failed to delete processing batch",
        severity: "error",
      });
    },
  });

  const onSubmit = (formData) => {
    createMutation.mutate({
      ...formData,
      productType: activeTab,
      milkType: selectedMilkType,
      materialsUsed: formData.addedMaterials,
      byProducts: formData.addedByProducts,
    });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1160, mx: "auto", p: { xs: 1, md: 2 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", mb: 0.5 }}>
          Milk Processing
        </Typography>
        <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
          Process stored milk into liquid milk and dairy products.
        </Typography>
      </Box>

      {/* Contract / Endpoint Transparency Notice */}
      <ContractNotice notice={contractNotice} backendPersisted={backendPersisted} />

      {/* Form Card: Create Processing Batch */}
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
          Create Processing Batch
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2.5}>
            {/* Row 1: processing_id, Input Milk Batch, Input Quantity */}
            <Grid size={{ xs: 12, md: 4 }}>
              <LockedField
                label="processing_id"
                placeholder="—"
                value="—"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Input Milk Batch
              </Typography>
              <Controller
                name="inputMilkBatch"
                control={control}
                rules={{ required: "Input Milk Batch is required" }}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={Boolean(errors.inputMilkBatch)}>
                    <Select {...field} sx={{ borderRadius: "6px", fontSize: "13px" }}>
                      {storageRecords.map((s) => (
                        <MenuItem key={s.batchId} value={s.batchId} sx={{ fontSize: "13px" }}>
                          {s.batchId} ({s.milkType || "Milk"})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Input Quantity (Litres)
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder="300"
                {...register("inputQuantity", {
                  required: "Input quantity is required",
                  min: { value: 1, message: "Must be greater than 0" },
                })}
                error={Boolean(errors.inputQuantity)}
                helperText={errors.inputQuantity?.message}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">L</InputAdornment>,
                  },
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                Only quality-tested milk batches available in Raw Milk Storage are listed. Enter the quantity to use from the selected batch.
              </Typography>
            </Grid>

            {/* Row 2: Processing Date & Processing Time */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Processing Date
              </Typography>
              <TextField
                fullWidth
                size="small"
                {...register("processingDate", { required: "Date is required" })}
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

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                Processing Time
              </Typography>
              <TextField
                fullWidth
                size="small"
                {...register("processingTime", { required: "Time is required" })}
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

            {/* Product Type Tabs / Pills */}
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                {productTabs.map((p) => {
                  const isSelected = activeTab === p;
                  return (
                    <Button
                      key={p}
                      size="small"
                      onClick={() => {
                        setActiveTab(p);
                        setValue("unit", p === "Liquid Milk" ? "L" : "Kg");
                      }}
                      sx={{
                        textTransform: "none",
                        fontSize: "12px",
                        fontWeight: isSelected ? 600 : 400,
                        bgcolor: isSelected ? "#EBF3ED" : "#FFFFFF",
                        color: isSelected ? "#2D5A43" : "#374151",
                        border: isSelected ? "1px solid #2D5A43" : "1px solid #D1D5DB",
                        borderRadius: "6px",
                        px: 1.8,
                        py: 0.5,
                        "&:hover": {
                          bgcolor: isSelected ? "#EBF3ED" : "#F9FAFB",
                        },
                      }}
                    >
                      {p}
                    </Button>
                  );
                })}
                <Button
                  size="small"
                  onClick={handleAddTab}
                  startIcon={<AddIcon fontSize="small" />}
                  sx={{
                    textTransform: "none",
                    fontSize: "12px",
                    color: "#4B5563",
                    border: "1px dashed #9CA3AF",
                    borderRadius: "6px",
                    px: 1.5,
                    py: 0.5,
                    "&:hover": { bgcolor: "#F9FAFB" },
                  }}
                >
                  Add tab
                </Button>
              </Stack>
            </Grid>

            {/* Section: Raw Materials Used */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ p: 2, bgcolor: "#F9FAFB", borderRadius: "6px", border: "1px solid #E5E7EB" }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 650, color: "#111827", mb: 0.5 }}>
                  Raw Materials Used
                </Typography>
                <Typography sx={{ fontSize: "11px", color: "#6B7280", mb: 1.5 }}>
                  Select materials from Inventory only when required. Examples: Citric Acid, Starter Culture, Salt or other required materials.
                </Typography>

                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                      Material
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={watchedMaterialType || ""}
                        onChange={(e) => setValue("materialType", e.target.value)}
                        displayEmpty
                        sx={{ borderRadius: "6px", fontSize: "13px", bgcolor: "#FFF" }}
                      >
                        <MenuItem value="" sx={{ fontSize: "13px" }}>
                          <em>Select material (optional)</em>
                        </MenuItem>
                        {RAW_MATERIAL_OPTIONS.map((m) => (
                          <MenuItem key={m} value={m} sx={{ fontSize: "13px" }}>
                            {m}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                      Quantity Used
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="—"
                      type="number"
                      value={watchedMaterialQty || ""}
                      onChange={(e) => setValue("materialQty", e.target.value)}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              {watchedMaterialType === "Starter Culture" ? "g" : "Kg"}
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "#FFF" } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }} sx={{ pt: { md: 2.8 } }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleAddMaterialItem}
                      disabled={!watchedMaterialType || !watchedMaterialQty}
                      sx={{
                        textTransform: "none",
                        fontSize: "12px",
                        color: "#374151",
                        borderColor: "#D1D5DB",
                        bgcolor: "#FFF",
                        borderRadius: "6px",
                        height: 38,
                        width: "100%",
                      }}
                    >
                      Add material
                    </Button>
                  </Grid>
                </Grid>

                {materialFields.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap">
                    {materialFields.map((f, idx) => (
                      <Chip
                        key={f.id}
                        label={`${f.material}: ${f.quantity} ${f.unit}`}
                        onDelete={() => removeMaterial(idx)}
                        size="small"
                        sx={{ bgcolor: "#FFF", border: "1px solid #E5E7EB", fontSize: "12px" }}
                      />
                    ))}
                  </Stack>
                )}

                <Typography sx={{ fontSize: "11px", color: "#6B7280", mt: 1 }}>
                  Use the material's inventory unit: Citric Acid / Salt in g or Kg · Starter Culture in g.
                </Typography>
              </Box>
            </Grid>

            {/* Section: Processed Product & By-product Outputs */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 650, color: "#111827", mb: 1.5 }}>
                Processed Product
              </Typography>

              <Box sx={{ mb: 2 }}>
                <LockedField
                  label="Product Type"
                  value={activeTab}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 7 }}>
                  <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                    Output Quantity
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="294"
                    {...register("outputQuantity", {
                      required: "Output quantity is required",
                      min: { value: 1, message: "Must be greater than 0" },
                    })}
                    error={Boolean(errors.outputQuantity)}
                    helperText={errors.outputQuantity?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Grid>

                <Grid size={{ xs: 5 }}>
                  <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                    Unit (L / Kg)
                  </Typography>
                  <SegmentedToggle
                    options={["L", "Kg"]}
                    value={watchedUnit || "L"}
                    onChange={(val) => setValue("unit", val)}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                  Remarks
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Record final output after processing."
                  {...register("remarks")}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 650, color: "#111827", mb: 0.5 }}>
                By-product Outputs
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#6B7280", mb: 1.5 }}>
                Record additional outputs, such as separated cream.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 5 }}>
                  <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                    By-product
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={watchedByProductType || "Cream"}
                      onChange={(e) => setValue("byProductType", e.target.value)}
                      sx={{ borderRadius: "6px", fontSize: "13px" }}
                    >
                      {BY_PRODUCT_OPTIONS.map((bp) => (
                        <MenuItem key={bp} value={bp} sx={{ fontSize: "13px" }}>
                          {bp}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 3.5 }}>
                  <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                    Quantity
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="6"
                    value={watchedByProductQty || ""}
                    onChange={(e) => setValue("byProductQty", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Grid>

                <Grid size={{ xs: 3.5 }}>
                  <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
                    Unit (L / Kg)
                  </Typography>
                  <SegmentedToggle
                    options={["L", "Kg"]}
                    value={watchedByProductUnit || "L"}
                    onChange={(val) => setValue("byProductUnit", val)}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 1.5 }}>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddByProductItem}
                  disabled={!watchedByProductQty}
                  sx={{
                    textTransform: "none",
                    fontSize: "12px",
                    color: "#2D5A43",
                    fontWeight: 600,
                  }}
                >
                  + Add by-product
                </Button>
              </Box>

              {byProductFields.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                  {byProductFields.map((f, idx) => (
                    <Chip
                      key={f.id}
                      label={`${f.byProduct}: ${f.quantity} ${f.unit}`}
                      onDelete={() => removeByProduct(idx)}
                      size="small"
                      sx={{ bgcolor: "#EBF3ED", color: "#2D5A43", fontSize: "12px" }}
                    />
                  ))}
                </Stack>
              )}
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
              Processing Batch ID will be assigned when saved.
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
                "Save Processing Batch"
              )}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Table Card: Recent Processing Batches */}
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
            Recent Processing Batches
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
            Latest {batches.length} batches
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
                  processing_id
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Milk Type
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Input Quantity
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Product
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Output Quantity
                </TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
                  Unit
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
              ) : batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: "#9CA3AF" }}>
                    No processing batches recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((row) => (
                  <TableRow
                    key={row.id || row.processingId}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell sx={{ fontSize: "13px", color: "#1F2937" }}>
                      {row.date}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", fontWeight: 500, color: "#1F2937" }}>
                      {row.processingId}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", color: "#4B5563" }}>
                      {row.milkType}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", color: "#1F2937" }}>
                      {row.inputQuantity} L
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#1F2937" }}>
                      {row.product}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#1F2937" }}>
                      {row.outputQuantity}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", color: "#4B5563" }}>
                      {row.unit}
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
                          onClick={() => setDeleteTargetId(row.id || row.processingId)}
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
            Input milk in litres · Liquid Milk output in L · Dairy product output in Kg.
          </Typography>
        </Box>
      </Paper>

      {/* Details Modal */}
      <RecordDetailsDialog
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title="Processing Batch Details"
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

