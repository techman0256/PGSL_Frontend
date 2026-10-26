import api from "../api/axios";
import endpoints from "../api/endpoints";

export const getUsers = async () => {
  const response = await api.get(endpoints.users);
  const data = response.data?.data ?? response.data;
  const users = data?.users ?? data;

  if (!Array.isArray(users)) {
    throw new Error("The users response did not contain a user list.");
  }

  return users;
};

export const createUser = async (userData) => {
  const response = await api.post(endpoints.users, userData);
  const data = response.data?.data ?? response.data;
  return data?.user ?? data;
};

export const updateUserRole = async ({ userId, role }) => {
  const response = await api.put(`${endpoints.users}/${encodeURIComponent(userId)}/role`, {
    role,
  });
  const data = response.data?.data ?? response.data;
  return data?.user ?? data;
};
