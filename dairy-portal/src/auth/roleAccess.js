export const ROLES = [
  { value: "MANAGER", label: "Manager" },
  { value: "OPERATOR", label: "Operator" },
  { value: "QUALITY_STAFF", label: "Quality Staff" },
];

export const ASSIGNABLE_ROLES = [
  { value: "ADMIN", label: "Admin" },
  ...ROLES,
];

const allModules = [
  "dashboard",
  "milk-reception",
  "quality-testing",
  "raw-milk-storage",
  "processing",
  "inventory",
  "dispatch",
  "users",
];

const moduleAccess = {
  ADMIN: allModules,
  MANAGER: allModules.filter((module) => module !== "users"),
  OPERATOR: ["dashboard", "milk-reception"],
  QUALITY_STAFF: ["dashboard", "quality-testing"],
};

export const canAccessModule = (role, module) =>
  Boolean(moduleAccess[role?.toUpperCase()]?.includes(module));

export const canDeleteOperationalRecords = (role) =>
  ["ADMIN", "MANAGER"].includes(role?.toUpperCase());

export const getRoleLabel = (role) =>
  ROLES.find((item) => item.value === role?.toUpperCase())?.label || "Operator";
