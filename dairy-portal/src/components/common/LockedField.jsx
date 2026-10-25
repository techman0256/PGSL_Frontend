import { Box, Typography, TextField, InputAdornment } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function LockedField({
  label,
  value,
  placeholder = "Auto Generated",
  topSubtitle,
  bottomNote,
  fullWidth = true,
}) {
  return (
    <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.5 }}>
        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>
          {label}
        </Typography>
        {topSubtitle && (
          <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
            {topSubtitle}
          </Typography>
        )}
      </Box>

      <TextField
        fullWidth
        size="small"
        value={value || ""}
        placeholder={placeholder}
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <LockOutlinedIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "#F9FAFB",
            borderRadius: "6px",
            color: "#4B5563",
            "& fieldset": {
              borderColor: "#E5E7EB",
            },
            "&:hover fieldset": {
              borderColor: "#D1D5DB",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#D1D5DB",
            },
          },
          "& .MuiInputBase-input": {
            fontSize: "13px",
            cursor: "not-allowed",
          },
        }}
      />

      {bottomNote && (
        <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.5 }}>
          {bottomNote}
        </Typography>
      )}
    </Box>
  );
}

