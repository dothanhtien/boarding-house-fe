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
  leases: "/leases",
  createLease: (roomId?: string) =>
    roomId ? `/leases/new?roomId=${encodeURIComponent(roomId)}` : "/leases/new",
  leaseDetail: (id: string, origin?: string) =>
    `/leases/${id}${origin ? `?origin=${encodeURIComponent(origin)}` : ""}`,
  editLease: (id: string, origin?: string) =>
    `/leases/${id}/edit${origin ? `?origin=${encodeURIComponent(origin)}` : ""}`,
  signIn: "/signin",
  signUp: "/signup",
};
