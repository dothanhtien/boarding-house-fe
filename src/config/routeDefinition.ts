export const ROUTES = {
  dashboard: "/",
  profile: "/profile",
  users: "/users",
  organizations: "/organizations",
  organizationDetail: (id: string) => `/organizations/${id}`,
  signIn: "/signin",
  signUp: "/signup",
};
