import api from "../api/axios";
import { createBatch, getBatches, updateBatch } from "./batchApi";

const formatDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const normalizeMilkBatch = (batch) => ({
  ...batch,
  id: batch._id || batch.id,
  batchId: batch.milkBatchId || batch.batchId,
  milkType: (batch.milkType || "").toLowerCase().replace(/^./, (letter) => letter.toUpperCase()),
  quantity: Number(batch.quantity),
  date: formatDate(batch.receivedAt || batch.date),
  time: batch.receivedAt
    ? new Date(batch.receivedAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : batch.time,
  shift: (batch.shift || "").toLowerCase().replace(/^./, (letter) => letter.toUpperCase()),
});

export const getReceptions = async () => ({
  data: (await getBatches()).map(normalizeMilkBatch),
  backendPersisted: true,
});

export const createReception = async (receptionData) => {
  const receivedAt = new Date(`${receptionData.date}T${receptionData.time}`);

  if (Number.isNaN(receivedAt.getTime())) {
    throw new Error("Enter a valid reception date and time.");
  }

  const batch = await createBatch({
    milkBatchId: receptionData.milkBatchId.trim(),
    milkType: receptionData.milkType.toUpperCase(),
    quantity: Number(receptionData.quantity),
    receivedAt: receivedAt.toISOString(),
    date: receptionData.date,
    time: receptionData.time,
    shift: receptionData.shift.toUpperCase(),
  });

  return {
    data: normalizeMilkBatch(batch),
    backendPersisted: true,
  };
};

export const updateReception = async ({ id, ...receptionData }) => {
  const batch = await updateBatch(id, {
    milkType: receptionData.milkType.toUpperCase(),
    quantity: Number(receptionData.quantity),
    date: receptionData.date,
    time: receptionData.time,
    shift: receptionData.shift.toUpperCase(),
  });

  return {
    data: normalizeMilkBatch(batch),
    backendPersisted: true,
  };
};

export const deleteReception = async (id) => {
  const response = await api.delete(`/milk-batches/${encodeURIComponent(id)}`);

  return {
    data: response.data,
    backendPersisted: true,
  };
};
