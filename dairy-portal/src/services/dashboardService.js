import api from "../api/axios";
import endpoints from "../api/endpoints";

export const getDashboardSummary = async (date) => {
  const response = await api.get(endpoints.dashboard.summary, { params: { date } });
  const data = response.data?.data ?? response.data;

  if (!data?.milkReceived || !data?.inventory) {
    throw new Error("The dashboard response did not contain a valid summary.");
  }

  return data;
};
