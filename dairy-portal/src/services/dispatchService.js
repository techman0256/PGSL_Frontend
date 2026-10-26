import api from "../api/axios";
import endpoints from "../api/endpoints";

const formatDispatchDateTime = (dispatch) => {
  const date = new Date(dispatch.dispatchDate || dispatch.createdAt);

  if (Number.isNaN(date.getTime())) {
    return dispatch.dateTime || "";
  }

  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = dispatch.dispatchTime
    ? new Date(`2000-01-01T${dispatch.dispatchTime}`).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

  return `${formattedDate} · ${formattedTime}`;
};

const normalizeDispatch = (dispatch) => ({
  ...dispatch,
  id: dispatch._id || dispatch.id,
  dateTime: formatDispatchDateTime(dispatch),
});

export const getDispatches = async () => {
  const response = await api.get(endpoints.dispatches);
  const data = response.data?.data ?? response.data;
  const dispatches = data?.dispatches ?? data;

  if (!Array.isArray(dispatches)) {
    throw new Error("The dispatch response did not contain a dispatch list.");
  }

  return {
    data: dispatches.map(normalizeDispatch),
    backendPersisted: true,
  };
};

export const getAvailableProductsForDispatch = async () => {
  const response = await api.get(`${endpoints.dispatches}/available-products`);
  const data = response.data?.data ?? response.data;
  return data?.products ?? data;
};

export const createDispatch = async (dispatchData) => {
  const dispatchDate = new Date(dispatchData.dispatchDateTime);

  if (Number.isNaN(dispatchDate.getTime())) {
    throw new Error("Enter a valid dispatch date and time.");
  }

  const response = await api.post(endpoints.dispatches, {
    product: dispatchData.product,
    processingBatchId: dispatchData.processingBatchId,
    quantity: Number(dispatchData.quantity),
    unit: dispatchData.unit,
    customer: dispatchData.customer.trim(),
    channel: dispatchData.channel,
    dispatchDate: dispatchDate.toISOString(),
    dispatchTime: dispatchDate.toTimeString().slice(0, 5),
  });
  const data = response.data?.data ?? response.data;

  return {
    data: normalizeDispatch(data?.dispatch ?? data),
    backendPersisted: true,
  };
};

export const deleteDispatch = async (id) => {
  const response = await api.delete(`${endpoints.dispatches}/${encodeURIComponent(id)}`);
  return { data: response.data, backendPersisted: true };
};
