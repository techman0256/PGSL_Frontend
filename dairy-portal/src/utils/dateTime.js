export const getLocalDate = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

export const getLocalTime = () => new Date().toTimeString().slice(0, 5);

export const getLocalDateTime = () => `${getLocalDate()}T${getLocalTime()}`;
