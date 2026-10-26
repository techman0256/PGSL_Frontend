export const ROLES = [
  { value: "OPERATOR", label: "Operator" },
  { value: "ADMIN", label: "Admin" },
];

// export const ASSIGNABLE_ROLES = [
//   { value: "ADMIN", label: "Admin" },
//   ...ROLES,
// ];

const allModules = [
  "dashboard",
  "milk-reception",
  "quality-testing",
  "raw-milk-storage",
  "processing",
  "inventory",
  "dispatch",
];

const moduleAccess = {
  ADMIN: [...allModules, "users"],
  OPERATOR: allModules,
};

export const canAccessModule = (role, module) =>
  Boolean(moduleAccess[role?.toUpperCase()]?.includes(module));

export const canDeleteOperationalRecords = (role) =>
  ["ADMIN"].includes(role?.toUpperCase());

export const getRoleLabel = (role) =>
  ROLES.find((item) => item.value === role?.toUpperCase())?.label || "Operator";
