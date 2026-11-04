import { useMemo, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
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

const nodeLabel = {
  milkReception: "Reception",
  qualityTest: "Quality test",
  storage: "Storage",
  processing: "Processing",
  finishedProduct: "Finished product",
  byProduct: "By-product",
  dispatch: "Dispatch",
};

function TraceFlowNode({ data }) {
  const { node } = data;
  const title = node.type === "milkReception"
    ? node.batchId
    : node.type === "qualityTest"
      ? `Fat ${node.fat}% · SNF ${node.snf}%`
      : node.type === "storage"
        ? `${node.siloNumber} · ${formatNumber(node.quantity)} L`
        : node.type === "processing"
          ? node.batchId
          : node.type === "dispatch"
            ? `${node.dispatchId} · ${node.customer}`
            : `${node.product} · ${formatNumber(node.quantity)} ${node.unit}`;
  const detail = node.type === "processing"
    ? `Input ${formatNumber(node.inputQuantity)} L → ${formatNumber(node.outputQuantity)} ${node.unit}`
    : node.type === "dispatch"
      ? `${formatNumber(node.quantity)} ${node.unit} · ${node.channel}`
      : node.type === "milkReception"
        ? `${node.milkType} · ${formatNumber(node.quantity)} ${node.unit}`
        : node.type === "qualityTest"
          ? `${node.temperature}°C`
          : node.type === "storage"
            ? "Raw milk storage"
            : node.status === "depleted"
              ? "No inventory remaining"
              : node.isByProduct
                ? "Child output"
                : "Available inventory";

  return (
    <Card
      variant="outlined"
      sx={{
        width: 220,
        borderLeft: `4px solid ${nodeColor[node.type] || "#64748B"}`,
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: nodeColor[node.type] }} />
      <CardContent sx={{ p: "12px !important" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
          <Typography sx={{ fontSize: 11, color: "#6B7280", fontWeight: 700 }}>
            {nodeLabel[node.type] || node.label}
          </Typography>
          <Chip
            size="small"
            label={node.type === "byProduct" ? "Child" : node.status}
            sx={{ height: 19, fontSize: 10, textTransform: "capitalize" }}
          />
        </Stack>
        <Typography sx={{ mt: 0.8, fontWeight: 700, fontSize: 13 }}>{title}</Typography>
        <Typography sx={{ mt: 0.5, fontSize: 11, color: "#6B7280" }}>{detail}</Typography>
      </CardContent>
      <Handle type="source" position={Position.Right} style={{ background: nodeColor[node.type] }} />
    </Card>
  );
}

const nodeTypes = { traceNode: TraceFlowNode };

function buildFlow(trace) {
  const { nodes, edges } = trace;
  const root = nodes.find((node) => node.type === "milkReception");
  const quality = nodes.find((node) => node.type === "qualityTest");
  const storage = nodes.find((node) => node.type === "storage");
  const processing = nodes.filter((node) => node.type === "processing");
  const flowNodes = [];
  const positions = new Map();

  const addNode = (node, x, y) => {
    if (!node || positions.has(node.id)) return;
    positions.set(node.id, { x, y });
    flowNodes.push({
      id: node.id,
      type: "traceNode",
      position: { x, y },
      data: { node },
    });
  };

  addNode(root, 0, 180);
  addNode(quality, 300, 180);
  addNode(storage, 600, 180);
  processing.forEach((branch, index) => {
    const branchY = 80 + index * 260;
    addNode(branch, 950, branchY);
    nodes
      .filter((node) => edges.some((edge) => edge.from === branch.id && edge.to === node.id))
      .forEach((output, outputIndex) => {
        const outputY = branchY - 100 + outputIndex * 130;
        addNode(output, 1300, outputY);
        nodes
          .filter((node) => edges.some((edge) => edge.from === output.id && edge.to === node.id))
          .forEach((dispatch, dispatchIndex) => addNode(dispatch, 1650, outputY + dispatchIndex * 100));
      });
  });

  const graphEdges = [];
  const addGraphEdge = (from, to, relationship, quantity, index) => {
    if (!positions.has(from) || !positions.has(to)) return;
    graphEdges.push({
      id: `trace-edge-${index}-${from}-${to}`,
      source: from,
      target: to,
      type: "smoothstep",
      animated: relationship === "processed",
      label: quantity ? `${formatNumber(quantity)} L` : undefined,
      markerEnd: { type: MarkerType.ArrowClosed, color: "#94A3B8" },
      style: { stroke: "#94A3B8", strokeWidth: 1.5 },
      labelStyle: { fontSize: 10, fill: "#64748B" },
      labelBgStyle: { fill: "#FFFFFF" },
    });
  };

  const linearStages = [root, quality, storage].filter(Boolean);
  linearStages.forEach((stage, index) => {
    if (index > 0) {
      addGraphEdge(
        linearStages[index - 1].id,
        stage.id,
        "stage-transition",
        undefined,
        `linear-${index}`
      );
    }
  });

  edges
    .filter((edge) =>
      positions.has(edge.from) &&
      positions.has(edge.to) &&
      !(
        linearStages.some((stage, index) =>
          index > 0 &&
          linearStages[index - 1].id === edge.from &&
          stage.id === edge.to
        )
      ) &&
      !(root && storage && edge.from === root.id && edge.to === storage.id)
    )
    .forEach((edge, index) => addGraphEdge(
      edge.from,
      edge.to,
      edge.relationship,
      edge.quantity,
      `data-${index}`
    ));

  const flowEdges = graphEdges;

  return { nodes: flowNodes, edges: flowEdges };
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
  const flow = useMemo(() => (trace ? buildFlow(trace) : null), [trace]);

  const stageRows = useMemo(() => (
    trace?.nodes?.map((node) => ({
      stage: nodeLabel[node.type] || node.label,
      record: node.batchId || node.dispatchId || node.product || node.label,
      quantity: node.quantity != null
        ? `${formatNumber(node.quantity)} ${node.unit || "L"}`
        : node.inputQuantity != null
          ? `${formatNumber(node.inputQuantity)} L input`
          : "—",
      status: node.status,
    })) || []
  ), [trace]);

  const handleSearch = (event) => {
    event.preventDefault();
    const normalized = input.trim().toUpperCase();
    if (normalized) setBatchId(normalized);
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>Batch Traceability</Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13, color: "#6B7280" }}>
            Follow a reception batch across every processing branch and child output.
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

      {trace && flow && (
        <Stack gap={2.5}>
          {trace.warnings?.map((warning) => <Alert key={warning.code} severity="warning">{warning.message}</Alert>)}

          <Paper sx={{ p: 2.5, border: "1px solid #DDE7E0", boxShadow: "none", bgcolor: "#F5FAF6" }}>
            <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Tracing reception batch</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#2D5A43" }}>{trace.rootBatch.id}</Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {[
                ["Received", `${formatNumber(trace.rootBatch.quantity)} ${trace.rootBatch.unit}`],
                ["Processed", `${formatNumber(trace.summary.inputQuantity)} L`],
                ["Outputs", `${trace.summary.finishedProductCount} products`],
                ["Dispatched", `${formatNumber(trace.summary.dispatchedQuantity)} total`],
              ].map(([label, value]) => (
                <Grid item xs={6} md={3} key={label}>
                  <Typography sx={{ fontSize: 11, color: "#6B7280" }}>{label}</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{value}</Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Paper sx={{ p: { xs: 1, md: 2 }, border: "1px solid #E5E7EB", boxShadow: "none" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1, pb: 1.5 }}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>Interactive lineage graph</Typography>
                <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                  Drag, zoom, and pan to inspect each processing split.
                </Typography>
              </Box>
              <Typography sx={{ display: { xs: "none", md: "block" }, fontSize: 11, color: "#6B7280" }}>
                {flow.nodes.length} nodes · {flow.edges.length} connections
              </Typography>
            </Stack>
            <Box sx={{ height: { xs: 620, md: 680 }, borderRadius: 1, overflow: "hidden", bgcolor: "#F8FAFC" }}>
              <ReactFlow
                nodes={flow.nodes}
                edges={flow.edges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2, minZoom: 0.45 }}
                minZoom={0.25}
                maxZoom={1.5}
                nodesDraggable
                nodesConnectable={false}
                elementsSelectable
              >
                <MiniMap nodeColor={(node) => nodeColor[node.data?.node?.type] || "#94A3B8"} />
                <Controls position="top-left" />
                <Background gap={20} size={1} color="#E2E8F0" />
              </ReactFlow>
            </Box>
          </Paper>

          <Paper sx={{ border: "1px solid #E5E7EB", boxShadow: "none" }}>
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>Stage details</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Stage</TableCell>
                    <TableCell>Record</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stageRows.map((row, index) => (
                    <TableRow key={`${row.stage}-${row.record}-${index}`}>
                      <TableCell>{row.stage}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.record}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell><Chip size="small" label={row.status} sx={{ textTransform: "capitalize" }} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      )}
    </Box>
  );
}
