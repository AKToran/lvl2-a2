export const UserRole = {
  maintainer: "maintainer",
  contributor: "contributor"
} as const;

export type Roles = "maintainer" | "contributor";