export const ROUTES = {
  dashboard: "/",
  profile: "/profile",
  users: "/users",
  organizations: "/organizations",
  organizationDetail: (id: string) => `/organizations/${id}`,
  properties: "/properties",
  propertyRooms: (id: string) => `/properties/${id}`,
  signIn: "/signin",
  signUp: "/signup",
};
