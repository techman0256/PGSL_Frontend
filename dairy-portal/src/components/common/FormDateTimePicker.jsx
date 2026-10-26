import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Controller } from "react-hook-form";

export default function FormDateTimePicker({ control, name, rules }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <DateTimePicker
            ampm={false}
            value={field.value ? dayjs(field.value) : null}
            onChange={(value) => field.onChange(value?.isValid() ? value.format("YYYY-MM-DDTHH:mm") : "")}
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
                  "& .MuiPickersDay-root.Mui-selected": {
                    bgcolor: "#2D5A43 !important",
                    "&:hover": { bgcolor: "#234735 !important" },
                  },
                  "& .MuiPickersDay-root:not(.Mui-selected):hover": {
                    bgcolor: "#E8F0EB",
                  },
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
              day: {
                sx: {
                  "&.Mui-selected, &.Mui-selected:hover": {
                    bgcolor: "#2D5A43 !important",
                    color: "#FFF",
                    "&:hover": { bgcolor: "#234735 !important" },
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
