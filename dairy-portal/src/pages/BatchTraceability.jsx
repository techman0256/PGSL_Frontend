import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useQuery } from "@tanstack/react-query";
import { getBatchTraceability } from "../services/traceabilityService";

const formatNumber = (value) => Number(value || 0).toLocaleString();

const nodeColor = {
  milkReception: "#2D5A43",
  qualityTest: "#2563EB",
  storage: "#7C3AED",
  processing: "#B45309",
  finishedProduct: "#0F766E",
  byProduct: "#9333EA",
  dispatch: "#C2410C",
};

const nodeTitle = (node) => {
  if (node.type === "milkReception") return node.batchId;
  if (node.type === "qualityTest") return `Fat ${node.fat}% · SNF ${node.snf}%`;
  if (node.type === "storage") return `${node.siloNumber} · ${formatNumber(node.quantity)} L`;
  if (node.type === "processing") return `${node.batchId} · ${node.product}`;
  if (node.type === "dispatch") return `${node.dispatchId} · ${node.customer}`;
  return `${node.product} · ${formatNumber(node.quantity)} ${node.unit}`;
};

const nodeDetails = (node) => {
  if (node.type === "milkReception") {
    return `${node.milkType} · ${formatNumber(node.quantity)} ${node.unit} · ${node.shift}`;
  }
  if (node.type === "qualityTest") {
    return `${node.temperature}°C · ${node.testDate ? new Date(node.testDate).toLocaleDateString() : ""}`;
  }
  if (node.type === "processing") {
    return `Input ${formatNumber(node.inputQuantity)} L → Output ${formatNumber(node.outputQuantity)} ${node.unit}`;
  }
  if (node.type === "dispatch") {
    return `${formatNumber(node.quantity)} ${node.unit} · ${node.channel}`;
  }
  return node.isByProduct ? "Child output" : node.status === "depleted" ? "No inventory remaining" : "Available inventory";
};

function TraceNode({ node }) {
  return (
    <Card
      variant="outlined"
      sx={{
        width: { xs: "100%", md: 360 },
        borderLeft: `5px solid ${nodeColor[node.type] || "#64748B"}`,
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
      }}
    >
      <CardContent sx={{ p: "16px !important" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{node.label}</Typography>
          <Chip
            size="small"
            label={node.type === "byProduct" ? "By-product" : node.status}
            sx={{ fontSize: 11, textTransform: "capitalize" }}
          />
        </Stack>
        <Typography sx={{ mt: 1, fontWeight: 600, fontSize: 14, color: "#1F2937" }}>
          {nodeTitle(node)}
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 12, color: "#6B7280" }}>
          {nodeDetails(node)}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function BatchTraceability() {
  const [input, setInput] = useState("");
  const [batchId, setBatchId] = useState("");
  const traceQuery = useQuery({
    queryKey: ["batch-traceability", batchId],
    queryFn: () => getBatchTraceability(batchId),
    enabled: Boolean(batchId),
    retry: false,
  });
  const trace = traceQuery.data;
  const mainNodes = trace?.nodes?.filter((node) =>
    ["milkReception", "qualityTest", "storage", "processing"].includes(node.type)
  ) || [];
  const outputNodes = trace?.nodes?.filter((node) =>
    ["finishedProduct", "byProduct", "dispatch"].includes(node.type)
  ) || [];

  const handleSearch = (event) => {
    event.preventDefault();
    const normalized = input.trim().toUpperCase();
    if (normalized) setBatchId(normalized);
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
            Batch Traceability
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13, color: "#6B7280" }}>
            Follow a milk reception batch through testing, storage, processing, outputs and dispatch.
          </Typography>
        </Box>
        <AccountTreeOutlinedIcon sx={{ fontSize: 36, color: "#2D5A43" }} />
      </Stack>

      <Paper component="form" onSubmit={handleSearch} sx={{ p: 2, mb: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
        <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
          <TextField
            fullWidth
            size="small"
            label="Milk Reception Batch ID"
            placeholder="MR-20261007-004"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <Button type="submit" variant="contained" startIcon={<SearchIcon />} sx={{ minWidth: 130, bgcolor: "#2D5A43" }}>
            Trace batch
          </Button>
        </Stack>
      </Paper>

      {traceQuery.isLoading && <Box sx={{ display: "grid", placeItems: "center", py: 8 }}><CircularProgress /></Box>}
      {traceQuery.isError && <Alert severity="error">{traceQuery.error.response?.data?.message || traceQuery.error.message}</Alert>}

      {trace && (
        <Stack gap={2.5}>
          {trace.warnings?.map((warning) => <Alert key={warning.code} severity="warning">{warning.message}</Alert>)}

          <Paper sx={{ p: 2.5, border: "1px solid #DDE7E0", boxShadow: "none", bgcolor: "#F5FAF6" }}>
            <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Tracing reception batch</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#2D5A43" }}>{trace.rootBatch.id}</Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {[
                ["Received", `${formatNumber(trace.rootBatch.quantity)} ${trace.rootBatch.unit}`],
                ["Processed", `${formatNumber(trace.summary.inputQuantity)} L`],
                ["Produced", `${formatNumber(trace.summary.outputQuantity)} total`],
                ["Dispatched", `${formatNumber(trace.summary.dispatchedQuantity)} total`],
              ].map(([label, value]) => (
                <Grid item xs={6} md={3} key={label}>
                  <Typography sx={{ fontSize: 11, color: "#6B7280" }}>{label}</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{value}</Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Paper sx={{ p: { xs: 2, md: 3 }, border: "1px solid #E5E7EB", boxShadow: "none" }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Process chain</Typography>
            <Stack alignItems="center" gap={1}>
              {mainNodes.map((node, index) => (
                <Box key={node.id} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                  <TraceNode node={node} />
                  {index < mainNodes.length - 1 && <ArrowDownwardIcon sx={{ color: "#9CA3AF" }} />}
                </Box>
              ))}
              {mainNodes.length === 0 && <Typography color="text.secondary">No linked stages found.</Typography>}
            </Stack>
          </Paper>

          <Paper sx={{ p: { xs: 2, md: 3 }, border: "1px solid #E5E7EB", boxShadow: "none" }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Outputs and dispatches</Typography>
            {outputNodes.length === 0 ? (
              <Typography color="text.secondary">No finished products or dispatches are linked yet.</Typography>
            ) : (
              <Grid container spacing={2}>
                {outputNodes.map((node) => <Grid item xs={12} md={6} lg={4} key={node.id}><TraceNode node={node} /></Grid>)}
              </Grid>
            )}
          </Paper>
        </Stack>
      )}
    </Box>
  );
}
