import { Box, ButtonBase } from "@mui/material";

export default function SegmentedToggle({ options, value, onChange, fullWidth = false, size = "medium" }) {
  const py = size === "small" ? 0.5 : 0.8;
  const px = size === "small" ? 1.5 : 2.5;
  const fontSize = size === "small" ? "12px" : "13px";

  return (
    <Box
      sx={{
        display: "inline-flex",
        width: fullWidth ? "100%" : "auto",
        border: "1px solid #D1D5DB",
        borderRadius: "6px",
        overflow: "hidden",
        bgcolor: "#FFFFFF",
      }}
    >
      {options.map((option) => {
        const optionVal = typeof option === "object" ? option.value : option;
        const optionLabel = typeof option === "object" ? option.label : option;
        const isSelected = value === optionVal;

        return (
          <ButtonBase
            key={optionVal}
            onClick={() => onChange(optionVal)}
            sx={{
              flex: fullWidth ? 1 : "initial",
              py,
              px,
              fontSize,
              fontWeight: isSelected ? 600 : 400,
              color: isSelected ? "#2D5A43" : "#4B5563",
              bgcolor: isSelected ? "#EBF3ED" : "#FFFFFF",
              borderRight: "1px solid #E5E7EB",
              transition: "all 0.15s ease",
              "&:last-child": {
                borderRight: "none",
              },
              "&:hover": {
                bgcolor: isSelected ? "#EBF3ED" : "#F9FAFB",
              },
            }}
          >
            {optionLabel}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

