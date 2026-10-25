import { Alert, Box, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function ContractNotice({ notice, backendPersisted }) {
  if (backendPersisted) return null;
  if (!notice) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon sx={{ fontSize: 18 }} />}
        sx={{
          py: 0.5,
          px: 1.5,
          fontSize: "12px",
          bgcolor: "#F0FDF4",
          color: "#166534",
          border: "1px solid #BBF7D0",
          borderRadius: "6px",
          "& .MuiAlert-icon": {
            color: "#16A34A",
            mr: 1,
          },
        }}
      >
        <Typography sx={{ fontSize: "12px", fontWeight: 500 }}>
          {notice}
        </Typography>
      </Alert>
    </Box>
  );
}

