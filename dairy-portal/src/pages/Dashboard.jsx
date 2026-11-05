import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import FormDatePicker from "../components/common/FormDatePicker";
import { getDashboardSummary } from "../services/dashboardService";
import { getErrorMessage } from "../utils/errorMessage";

const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));

const formatQuantity = (value, unit) =>
  `${Number(value || 0).toLocaleString("en-IN")} ${unit || ""}`.trim();

const cardSx = {
  p: 2,
  border: "1px solid #dfe3e8",
  borderRadius: "6px",
  boxShadow: "none",
  height: "100%",
  boxSizing: "border-box",
  bgcolor: "#fff",
};

const sectionTitleSx = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#202733",
  lineHeight: 1.3,
};

const rowTextSx = {
  fontSize: "11px",
  lineHeight: 1.4,
  color: "#303746",
};

function SummaryCard({ title, value, note }) {
  return (
    <Paper sx={cardSx}>
      <Typography sx={{ fontSize: "10px", color: "#727d8e", mb: 0.75 }}>
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: "18px",
          lineHeight: 1.2,
          fontWeight: 650,
          color: "#182235",
          mb: 0.7,
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
      <Typography sx={{ ...sectionTitleSx, mb: 1.2 }}>{title}</Typography>
      <Stack spacing={0.75}>
        {items.length === 0 && (
          <Typography sx={rowTextSx}>No records for this date.</Typography>
        )}
        {items.map((item) => (
          <Stack
            key={`${item.name}-${item.unit}`}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{ minHeight: 18 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{ minWidth: 0 }}
            >
              <Icon sx={{ fontSize: 14, color: "#778293", flexShrink: 0 }} />
              <Typography sx={{ ...rowTextSx, overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.name}
              </Typography>
            </Stack>
            <Typography
              sx={{
                ...rowTextSx,
                color: item.low ? "#9a5b00" : "#727d8e",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {formatQuantity(item.quantity, item.unit)}
              {item.low ? " · Low" : ""}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}

function MilkBreakdown({ items, total }) {
  const milkTypeColors = {
    cow: "#2D5A43",
    buffalo: "#D4A72C",
    goat: "#4F8064",
    sahiwal: "#E8C766",
  };
  const fallbackColors = ["#1F4030", "#8B6F1D", "#37634D"];
  const colorForMilkType = (name, index) =>
    milkTypeColors[name.toLowerCase()] ||
    fallbackColors[index % fallbackColors.length];
  const safeTotal = total || 1;
  const segments = items.reduce(
    (result, item, index) => {
      const start = result.accumulated;
      const accumulated = start + (item.quantity / safeTotal) * 100;
      return {
        accumulated,
        segments: [
          ...result.segments,
          `${colorForMilkType(item.name, index)} ${start}% ${accumulated}%`,
        ],
      };
    },
    { accumulated: 0, segments: [] }
  ).segments;

  return (
    <Paper sx={cardSx}>
      <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
        Milk received by type
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems="center"
        justifyContent="center"
        spacing={{ xs: 2, sm: 3 }}
        sx={{ minHeight: 122 }}
      >
        <Box
          sx={{
            width: 104,
            height: 104,
            borderRadius: "50%",
            background: segments.length
              ? `conic-gradient(${segments.join(", ")})`
              : "#e9edf2",
            flexShrink: 0,
          }}
        />
        <Stack spacing={0.8}>
          {items.map((item, index) => (
            <Stack key={item.name} direction="row" alignItems="center" spacing={0.8}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: colorForMilkType(item.name, index),
                  flexShrink: 0,
                }}
              />
              <Typography sx={rowTextSx}>
                {item.name}: {formatQuantity(item.quantity, "L")}
              </Typography>
            </Stack>
          ))}
          {items.length === 0 && (
            <Typography sx={rowTextSx}>No milk received.</Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function Dashboard() {
  const { control } = useForm({
    defaultValues: { date: today() },
  });
  const selectedDate = useWatch({ control, name: "date" }) || today();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getDashboardSummary(selectedDate)
      .then((data) => {
        if (active) {
          setSummary(data);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            getErrorMessage(requestError, "Unable to load dashboard.")
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedDate]);

  if (loading && !summary) {
    return (
      <Typography sx={{ color: "#727d8e", fontSize: "12px" }}>
        Loading dashboard...
      </Typography>
    );
  }

  if (error && !summary) {
    return (
      <Paper sx={{ ...cardSx, color: "#a33a32" }}>
        Unable to load dashboard: {error}
      </Paper>
    );
  }

  const milk = summary?.milkReceived || { total: 0, byType: [] };
  const processing = summary?.processing?.products || [];
  const dispatch = summary?.dispatch?.products || [];
  const inventory = summary?.inventory?.finishedProducts || [];
  const materials = summary?.inventory?.rawMaterials || [];
  const dispatchCount =
    summary?.activities?.filter((item) => item.stage === "Dispatch").length || 0;
  const threeColumnGridSx = {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, minmax(0, 1fr))",
      lg: "repeat(3, minmax(0, 1fr))",
    },
    gap: 1.5,
    mb: 1.5,
  };
  const twoColumnGridSx = {
    display: "grid",
    gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
    gap: 1.5,
    mb: 1.5,
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: 650,
              color: "#202733",
              lineHeight: 1.3,
            }}
          >
            Dashboard
          </Typography>
          <Typography sx={{ fontSize: "10px", color: "#727d8e", mt: 0.4 }}>
            Daily plant activity and current inventory.
          </Typography>
        </Box>
        <Box
          sx={{
            width: { xs: "100%", sm: 175 },
            "& .MuiInputBase-root": {
              height: 32,
              fontSize: "11px",
            },
          }}
        >
          <FormDatePicker control={control} name="date" />
        </Box>
      </Stack>

      {error && (
        <Typography sx={{ color: "#a33a32", fontSize: "11px", mb: 1.5 }}>
          {error}
        </Typography>
      )}

      <Box sx={threeColumnGridSx}>
        <Box sx={{ minWidth: 0 }}>
          <SummaryCard
            title="Milk Received"
            value={formatQuantity(milk.total, "L")}
            note={`${milk.byType.length} milk type${milk.byType.length === 1 ? "" : "s"} · ${formatDate(selectedDate)}`}
          />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <SummaryCard
            title="Products Processed"
            value={`${processing.length} product${processing.length === 1 ? "" : "s"}`}
            note="Main products only · native units preserved"
          />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <SummaryCard
            title="Products Dispatched"
            value={`${dispatch.length} product${dispatch.length === 1 ? "" : "s"}`}
            note={`${dispatchCount} dispatch record${dispatchCount === 1 ? "" : "s"}`}
          />
        </Box>
      </Box>

      <Box
        sx={{
          ...threeColumnGridSx,
          alignItems: "stretch",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <MilkBreakdown items={milk.byType} total={milk.total} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <ProductSection
            title="Products processed today"
            items={processing}
            icon={SettingsOutlinedIcon}
          />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <ProductSection
            title="Products dispatched today"
            items={dispatch}
            icon={LocalShippingOutlinedIcon}
          />
        </Box>
      </Box>

      <Typography sx={{ ...sectionTitleSx, mb: 1, mt: 0.5 }}>
        Current inventory
      </Typography>
      <Box sx={twoColumnGridSx}>
        <Box sx={{ minWidth: 0 }}>
          <ProductSection
            title="Finished product inventory"
            items={inventory}
            icon={Inventory2OutlinedIcon}
          />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <ProductSection
            title="Raw material inventory"
            items={materials}
            icon={Inventory2OutlinedIcon}
          />
        </Box>
      </Box>

      {/*
        Daily activities table temporarily hidden for review.
        The table implementation will be revisited shortly.
      */}
    </Box>
  );
}
