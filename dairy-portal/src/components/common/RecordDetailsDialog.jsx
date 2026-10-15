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

export default function RecordDetailsDialog({ open, onClose, title = "Record Details", data }) {
  if (!data) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, color: "#111827", pb: 1 }}>
        {title}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ py: 2 }}>
        <Grid container spacing={2}>
          {Object.entries(data).map(([key, val]) => {
            if (key === "id" || val === undefined || val === null) return null;
            if (typeof val === "object" && !Array.isArray(val)) return null;

            const formatLabel = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());

            const displayVal = Array.isArray(val)
              ? val.length === 0
                ? "None"
                : val.map((v) => (typeof v === "object" ? JSON.stringify(v) : v)).join(", ")
              : String(val);

            return (
              <Grid size={{ xs: 6 }} key={key}>
                <Box>
                  <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>
                    {formatLabel}
                  </Typography>
                  <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#1F2937", mt: 0.25 }}>
                    {displayVal}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
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

