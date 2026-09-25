export const ROUTES = {
  dashboard: "/",
  profile: "/profile",
  users: "/users",
  organizations: "/organizations",
  organizationDetail: (id: string) => `/organizations/${id}`,
  properties: "/properties",
  propertyRooms: (id: string) => `/properties/${id}`,
  createRoom: (propertyId: string) => `/properties/${propertyId}/rooms/new`,
  roomDetail: (propertyId: string, roomId: string) =>
    `/properties/${propertyId}/rooms/${roomId}`,
  editRoom: (propertyId: string, roomId: string) =>
    `/properties/${propertyId}/rooms/${roomId}/edit`,
  signIn: "/signin",
  signUp: "/signup",
};
