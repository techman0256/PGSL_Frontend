export function getErrorMessage(error, fallback) {
  const responseData = error?.response?.data;
  const apiMessage =
    responseData?.message ||
    responseData?.error ||
    (Array.isArray(responseData?.errors)
      ? responseData.errors.find((item) => item?.message)?.message
      : null);

  if (typeof apiMessage === "string" && apiMessage.trim()) {
    return apiMessage;
  }

  if (error?.code === "ECONNABORTED") {
    return "The request timed out. Please try again.";
  }

  if (!error?.response && error?.message === "Network Error") {
    return "Unable to connect to the server. Please check your connection.";
  }

  return error?.message || fallback;
}
