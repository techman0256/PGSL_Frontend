
import { useMemo, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
"dashboards"

import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

const summary = [
  {
    title: "Milk Received",
    value: "2,900 L",
    note: "06–07 Oct 2026",
  },
  {
    title: "Milk Tested",
    value: "2,900 L",
    note: "4 quality records",
  },
  {
    title: "Raw Milk Stored",
    value: "2,900 L",
    note: "4 storage entries",
  },
  {
    title: "Products Processed",
    value: "6 products",
    note: "7 batches · 06–07 Oct",
  },
];

const processing = [
  { name: "Liquid Milk", quantity: "588 L" },
  { name: "Curd", quantity: "300 Kg" },
  { name: "Butter", quantity: "32 Kg" },
  { name: "Ghee", quantity: "13 Kg" },
  { name: "Paneer", quantity: "60 Kg" },
  { name: "Goat Cheese", quantity: "32 Kg" },
  { name: "Separated Cream", quantity: "12 L" },
];

const inventory = [
  { name: "Liquid Milk", quantity: "468 L" },
  { name: "Curd", quantity: "240 Kg" },
  { name: "Butter", quantity: "24 Kg" },
  { name: "Ghee", quantity: "10 Kg" },
  { name: "Paneer", quantity: "45 Kg" },
  { name: "Goat Cheese", quantity: "24 Kg" },
  { name: "Separated Cream", quantity: "12 L" },
];

const dispatch = [
  { name: "Liquid Milk", quantity: "120 L" },
  { name: "Curd", quantity: "60 Kg" },
  { name: "Butter", quantity: "8 Kg" },
  { name: "Ghee", quantity: "3 Kg" },
  { name: "Paneer", quantity: "15 Kg" },
  { name: "Goat Cheese", quantity: "8 Kg" },
];

const materials = [
  { name: "Citric Acid", quantity: "1.5 Kg · Low", low: true },
  { name: "Starter Culture", quantity: "250 g · Low", low: true },
  { name: "Salt", quantity: "25 Kg" },
  { name: "Packaging", quantity: "8,400 pcs" },
];

const activities = [
  {
    date: "07 Oct 2026",
    stage: "Milk Reception",
    record: "MR-20261007-004 · Cow milk",
    quantity: "1,250 L",
    status: "Received",
  },
  {
    date: "07 Oct 2026",
    stage: "Quality Testing",
    record: "Quality record · Cow milk",
    quantity: "1,250 L",
    status: "Recorded",
  },
  {
    date: "07 Oct 2026",
    stage: "Raw Milk Storage",
    record: "ST-20261007-004 · Cow milk",
    quantity: "1,250 L",
    status: "Stored",
  },
  {
    date: "07 Oct 2026",
    stage: "Processing",
    record: "MP-20261007-006 · Liquid Milk",
    quantity: "588 L",
    status: "Processed",
  },
  {
    date: "07 Oct 2026",
    stage: "Processing",
    record: "MP-20261007-005 · Curd",
    quantity: "300 Kg",
    status: "Processed",
  },
  {
    date: "07 Oct 2026",
    stage: "Dispatch",
    record: "DS-20261007-006 · Liquid Milk",
    quantity: "120 L",
    status: "Dispatched",
  },
];

const cardSx = {
  p: 1.4,
  border: "1px solid #dfe3e8",
  borderRadius: "5px",
  boxShadow: "none",
  height: "100%",
  boxSizing: "border-box",
  bgcolor: "#fff",
};

const sectionTitleSx = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#202733",
};

const rowTextSx = {
  fontSize: "11px",
  lineHeight: 1.4,
  color: "#303746",
};

function SummaryCard({ title, value, note }) {
  return (
    <Paper sx={cardSx}>
      <Typography sx={{ fontSize: "10px", color: "#727d8e", mb: 0.45 }}>
        {title}
      </Typography>

      <Typography
        sx={{
          fontSize: "17px",
          lineHeight: 1.25,
          fontWeight: 650,
          color: "#182235",
          mb: 0.6,
        }}
      >
        {value}
      </Typography>

      <Typography sx={{ fontSize: "9px", color: "#727d8e" }}>
        {note}
      </Typography>
    </Paper>
  );
}

function ProductSection({ title, items, icon: Icon }) {
  return (
    <Paper sx={cardSx}>
      <Typography sx={{ ...sectionTitleSx, mb: 0.8 }}>
        {title}
      </Typography>

      <Stack spacing={0.35}>
        {items.map((item) => (
          <Stack
            key={item.name}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{ minHeight: 18 }}
          >
            <Stack direction="row" alignItems="center" spacing={0.7}>
              <Icon sx={{ fontSize: 14, color: "#778293" }} />
              <Typography sx={rowTextSx}>{item.name}</Typography>
            </Stack>

            <Typography
              sx={{
                ...rowTextSx,
                color: item.low ? "#9a5b00" : "#727d8e",
                whiteSpace: "nowrap",
              }}
            >
              {item.quantity}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");

  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      const matchesSearch = [
        item.date,
        item.stage,
        item.record,
        item.quantity,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "07" && item.date === "07 Oct 2026") ||
        (dateFilter === "06" && item.date === "06 Oct 2026");

      const matchesStage =
        stageFilter === "all" ||
        item.stage === stageFilter;

      return matchesSearch && matchesDate && matchesStage;
    });
  }, [search, dateFilter, stageFilter]);

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", minWidth: 0 }}>
      {/* Dashboard heading and filters */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
        sx={{ mb: 1.5 }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "17px",
              fontWeight: 650,
              color: "#202733",
              lineHeight: 1.4,
            }}
          >
            Dashboard
          </Typography>

          <Typography sx={{ fontSize: "10px", color: "#727d8e" }}>
            Overview of milk reception, quality testing, storage,
            processing, inventory and dispatch.
          </Typography>
        </Box>

        <Typography sx={{ fontSize: "10px", color: "#727d8e" }}>
          06–07 Oct 2026
        </Typography>
      </Stack>

      {/* Summary cards */}
      <Grid container spacing={1.25} sx={{ mb: 1.25 }}>
        {summary.map((item) => (
          <Grid item xs={12} sm={6} lg={3} key={item.title}>
            <SummaryCard {...item} />
          </Grid>
        ))}
      </Grid>

      {/* Processing and inventory */}
      <Grid container spacing={1.25} sx={{ mb: 1.25 }}>
        <Grid item xs={12} md={6}>
          <ProductSection
            title="Processing"
            items={processing}
            icon={SettingsOutlinedIcon}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <ProductSection
            title="Inventory"
            items={inventory}
            icon={Inventory2OutlinedIcon}
          />
        </Grid>
      </Grid>

      {/* Dispatch and materials */}
      <Grid container spacing={1.25} sx={{ mb: 1.25 }}>
        <Grid item xs={12} md={6}>
          <ProductSection
            title="Dispatch"
            items={dispatch}
            icon={LocalShippingOutlinedIcon}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <ProductSection
            title="Materials"
            items={materials}
            icon={Inventory2OutlinedIcon}
          />
        </Grid>
      </Grid>

      {/* Recent activities */}
      <Paper
        sx={{
          ...cardSx,
          p: 0,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 1.4,
            py: 1.1,
            borderBottom: "1px solid #dfe3e8",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Typography sx={sectionTitleSx}>
              Recent Activities
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <TextField
                size="small"
                placeholder="Search records"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  width: 155,
                  "& .MuiInputBase-root": {
                    height: 29,
                    fontSize: "10px",
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 14 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                select
                size="small"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                sx={{
                  width: 135,
                  "& .MuiInputBase-root": {
                    height: 29,
                    fontSize: "10px",
                  },
                }}
                slotProps={{
                  select: { displayEmpty: true },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TuneIcon sx={{ fontSize: 13 }} />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="all">All stages</MenuItem>
                <MenuItem value="Milk Reception">Milk Reception</MenuItem>
                <MenuItem value="Quality Testing">Quality Testing</MenuItem>
                <MenuItem value="Raw Milk Storage">Raw Milk Storage</MenuItem>
                <MenuItem value="Processing">Processing</MenuItem>
                <MenuItem value="Dispatch">Dispatch</MenuItem>
              </TextField>

              <TextField
                select
                size="small"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                sx={{
                  width: 110,
                  "& .MuiInputBase-root": {
                    height: 29,
                    fontSize: "10px",
                  },
                }}
              >
                <MenuItem value="all">All dates</MenuItem>
                <MenuItem value="07">07 Oct 2026</MenuItem>
                <MenuItem value="06">06 Oct 2026</MenuItem>
              </TextField>
            </Stack>
          </Stack>
        </Box>

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table
            size="small"
            sx={{
              minWidth: 650,
              "& .MuiTableCell-root": {
                py: 0.65,
                px: 1.25,
                borderBottom: "1px solid #e0e4e9",
                fontSize: "10px",
                whiteSpace: "nowrap",
              },
              "& .MuiTableHead-root .MuiTableCell-root": {
                bgcolor: "#f7f8fa",
                color: "#687386",
                fontSize: "9px",
                fontWeight: 500,
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Stage</TableCell>
                <TableCell>Record</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredActivities.map((item, index) => (
                <TableRow key={`${item.record}-${index}`} hover>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.stage}</TableCell>
                  <TableCell>{item.record}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        height: 19,
                        fontSize: "9px",
                        borderRadius: "3px",
                        bgcolor: "#f0f2f5",
                        color: "#303746",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}

              {filteredActivities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    No activities match your search or filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ px: 1.4, py: 0.8 }}>
          <Typography sx={{ fontSize: "9px", color: "#727d8e" }}>
            Showing {filteredActivities.length} of {activities.length} activities
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
