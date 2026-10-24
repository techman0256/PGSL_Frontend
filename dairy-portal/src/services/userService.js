import api from "../api/axios";

export const getUsers = async () => {
  const response = await api.get("/users");
  const data = response.data?.data ?? response.data;
  const users = data?.users ?? data;

  if (!Array.isArray(users)) {
    throw new Error("The users response did not contain a user list.");
  }

  return users;
};

export const createUser = async (userData) => {
  const response = await api.post("/users", userData);
  const data = response.data?.data ?? response.data;
  return data?.user ?? data;
};
