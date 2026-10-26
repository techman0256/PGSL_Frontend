import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Controller } from "react-hook-form";

export default function FormTimePicker({ control, name, rules }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <TimePicker
            ampm={false}
            value={field.value ? dayjs(`2000-01-01T${field.value}`) : null}
            onChange={(value) => field.onChange(value?.isValid() ? value.format("HH:mm") : "")}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                error: Boolean(fieldState.error),
                helperText: fieldState.error?.message,
                sx: {
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                    bgcolor: "#FFF",
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2D5A43",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#2D5A43" },
                },
              },
              desktopPaper: {
                sx: {
                  border: "1px solid #D1D5DB",
                  borderRadius: "10px",
                  "& .MuiClock-pin, & .MuiClockPointer-root": { bgcolor: "#2D5A43 !important" },
                  "& .MuiClockPointer-thumb": { borderColor: "#2D5A43 !important" },
                  "& .MuiClockNumber-root.Mui-selected": {
                    color: "#FFF !important",
                    bgcolor: "#2D5A43 !important",
                  },
                  "& .MuiClockNumber-root:not(.Mui-selected):hover": {
                    bgcolor: "#E8F0EB",
                  },
                },
              },
              clockNumber: {
                sx: {
                  "&.Mui-selected": {
                    color: "#FFF !important",
                    bgcolor: "#2D5A43 !important",
                  },
                  "&:hover": { bgcolor: "#E8F0EB" },
                },
              },
              actionBar: {
                sx: {
                  "& .MuiButton-root": {
                    color: "#2D5A43",
                    fontWeight: 700,
                    borderRadius: "6px",
                    "&:hover": { bgcolor: "#E8F0EB" },
                  },
                },
              },
            }}
          />
        )}
      />
    </LocalizationProvider>
  );
}
