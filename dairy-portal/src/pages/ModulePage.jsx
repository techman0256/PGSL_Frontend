import { Typography, Paper } from "@mui/material";

export default function ModulePage({ title }) {
  return (
    <>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {title}
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Manage {title.toLowerCase()} operations.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid #dfe3e8",
          borderRadius: 2
        }}
      >
        <Typography>
          Welcome to the {title} page.
        </Typography>
      </Paper>
    </>
  );
}
