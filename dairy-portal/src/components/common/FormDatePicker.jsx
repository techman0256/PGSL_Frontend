import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Controller } from "react-hook-form";

export default function FormDatePicker({ control, name, rules }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <DatePicker
            value={field.value ? dayjs(field.value) : null}
            onChange={(value) => field.onChange(value?.isValid() ? value.format("YYYY-MM-DD") : "")}
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
                  "& .MuiPickersCalendarHeader-label": {
                    color: "#111827",
                    fontWeight: 700,
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
