export const getLocalDate = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

export const getLocalTime = () => new Date().toTimeString().slice(0, 5);

export const getLocalDateTime = () => `${getLocalDate()}T${getLocalTime()}`;

export const formatDisplayDate = (value) => {
  if (!value) return "-";

  const datePart = String(value).slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return value;

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDisplayTime = (value) => {
  if (!value) return "-";

  const match = /^(\d{2}):(\d{2})/.exec(String(value));
  if (!match) return value;

  const [, hours, minutes] = match;
  return new Date(2000, 0, 1, Number(hours), Number(minutes)).toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
};

export const formatDisplayDateTime = (value) => {
  if (!value) return "-";

  const [date, time] = String(value).split("T");
  if (!time) return formatDisplayDate(value);

  return `${formatDisplayDate(date)}, ${formatDisplayTime(time)}`;
};
