import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Grid,
} from "@mui/material";

// Set of field names that are strictly backend metadata / database-internal
const BACKEND_KEYS = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "created_at",
  "updated_at",
  "createdDateTime",
  "updatedDateTime",
  "deletedAt",
  "deleted_at",
  "isDeleted",
  "is_deleted",
  "backendPersisted",
  "contractNotice",
  "__version",
  "inventory",
]);

// Map to provide clean user-facing labels
const CUSTOM_LABELS = {
  batchId: "Batch ID",
  storageRecordId: "Storage Record ID",
  processingId: "Processing ID",
  dispatchId: "Dispatch ID",
  inputBatchId: "Input Batch ID",
  inputQuantity: "Input Quantity",
  outputQuantity: "Output Quantity",
  dateTime: "Date & Time",
  testDate: "Test Date",
  milkType: "Milk Type",
  siloNumber: "Silo Number",
  temperature: "Temperature (°C)",
  storageTemperature: "Temperature (°C)",
  fat: "Fat (%)",
  snf: "SNF (%)",
  stockLevel: "Stock Level",
  minLevel: "Minimum Level",
  lastUpdated: "Last Updated",
  isByProduct: "By-Product",
  costPerUnit: "Cost Per Unit",
  pricePerLitre: "Price Per Litre",
  totalCost: "Total Cost",
  materialsUsed: "Materials Used",
  byProducts: "By-Products",
  testedBy: "Tested By",
};

const isObjectId = (val) =>
  typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val.trim());

const getFieldLabel = (key) => {
  if (CUSTOM_LABELS[key]) return CUSTOM_LABELS[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/\bId\b/g, "ID");
};

const formatArrayItem = (item) => {
  if (item == null) return "";
  if (typeof item !== "object") return String(item);

  // Material item: { material, quantityUsed / quantity, unit }
  if (item.material && (item.quantityUsed != null || item.quantity != null)) {
    const qty = item.quantityUsed ?? item.quantity;
    const formattedQty = typeof qty === "number" ? qty.toLocaleString() : qty;
    const unit = item.unit ? ` ${item.unit}` : "";
    return `${item.material} (${formattedQty}${unit})`;
  }

  // By-product item: { byProduct, quantity, unit }
  if (item.byProduct && item.quantity != null) {
    const formattedQty =
      typeof item.quantity === "number" ? item.quantity.toLocaleString() : item.quantity;
    const unit = item.unit ? ` ${item.unit}` : "";
    return `${item.byProduct} (${formattedQty}${unit})`;
  }

  // General item with name / product
  const name = item.name || item.product || item.title;
  if (name && item.quantity != null) {
    const formattedQty =
      typeof item.quantity === "number" ? item.quantity.toLocaleString() : item.quantity;
    const unit = item.unit ? ` ${item.unit}` : "";
    return `${name} (${formattedQty}${unit})`;
  }

  // Fallback: strip backend fields and display key-values
  const validEntries = Object.entries(item).filter(([k, v]) => {
    if (k.startsWith("_") || k.startsWith("$") || k === "id") return false;
    if (isObjectId(v)) return false;
    return v !== null && v !== undefined && v !== "";
  });

  if (validEntries.length === 0) return "";
  return validEntries.map(([k, v]) => `${getFieldLabel(k)}: ${v}`).join(", ");
};

const formatValue = (key, val) => {
  if (typeof val === "boolean") {
    return val ? "Yes" : "No";
  }

  if (Array.isArray(val)) {
    if (val.length === 0) return "None";
    const formatted = val
      .map(formatArrayItem)
      .filter(Boolean)
      .join(", ");
    return formatted || "None";
  }

  if (typeof val === "number") {
    return Number.isFinite(val) ? val.toLocaleString() : String(val);
  }

  return String(val);
};

const shouldShowField = (key, val, data) => {
  // Hide empty, null, or undefined values
  if (val === undefined || val === null || val === "") return false;

  // Hide internal properties starting with "_" or "$" (e.g., _id, __v, _doc, $__)
  if (key.startsWith("_") || key.startsWith("$")) return false;

  // Hide known backend metadata / timestamp / technical keys
  if (BACKEND_KEYS.has(key)) return false;

  // Hide values that are 24-character hexadecimal MongoDB ObjectIds
  if (isObjectId(val)) return false;

  // Hide non-array objects (nested Mongoose documents, populated refs, etc.)
  if (typeof val === "object" && !Array.isArray(val)) return false;

  // Hide redundant backend schema fields when friendly/normalized frontend counterparts exist
  if (key === "milkBatchId" && data.batchId) return false;
  if (key === "recordId" && data.storageRecordId) return false;
  if (key === "storageTemperature" && data.temperature !== undefined) return false;
  if (key === "storageDate" && data.date) return false;
  if (key === "storageTime" && data.time) return false;
  if (key === "processingDate" && data.date) return false;
  if (key === "processingTime" && data.time) return false;
  if (key === "productType" && data.product) return false;
  if (key === "outputUnit" && data.unit) return false;
  if (key === "inputMilkBatch" && data.inputBatchId) return false;
  if (key === "rawMaterialsUsed" && data.materialsUsed) return false;
  if (key === "dispatchDate" && (data.dateTime || data.date)) return false;
  if (key === "dispatchTime" && (data.dateTime || data.time)) return false;
  if (key === "receivedAt" && (data.dateTime || (data.date && data.time))) return false;
  if (key === "date" && data.testDate) return false;

  return true;
};

export default function RecordDetailsDialog({ open, onClose, title = "Record Details", data }) {
  if (!data) return null;

  const visibleEntries = Object.entries(data).filter(([key, val]) =>
    shouldShowField(key, val, data)
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, color: "#111827", pb: 1 }}>
        {title}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ py: 2 }}>
        {visibleEntries.length === 0 ? (
          <Typography sx={{ fontSize: "13px", color: "#6B7280", py: 2, textAlign: "center" }}>
            No details to display.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {visibleEntries.map(([key, val]) => {
              const isWide =
                Array.isArray(val) || (typeof val === "string" && val.length > 40);

              return (
                <Grid size={{ xs: isWide ? 12 : 6 }} key={key}>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#6B7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {getFieldLabel(key)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#1F2937",
                        mt: 0.25,
                        wordBreak: "break-word",
                      }}
                    >
                      {formatValue(key, val)}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: "#2D5A43",
            "&:hover": { bgcolor: "#244835" },
            textTransform: "none",
            fontSize: "13px",
            borderRadius: "6px",
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
