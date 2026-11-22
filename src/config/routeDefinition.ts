export const ROUTES = {
  signIn: "/signin",
  signUp: "/signup",
  dashboard: "/",
  profile: "/profile",
  users: "/users",
  organizations: "/organizations",
  organizationDetail: (id: string) => `/organizations/${id}`,
  properties: "/properties",
  propertyRooms: (id: string) => `/properties/${id}`,
  propertyUtilityServices: (id: string) =>
    `/properties/${id}?tab=utility-services`,
  createRoom: (propertyId: string) => `/properties/${propertyId}/rooms/new`,
  roomDetail: (propertyId: string, roomId: string) =>
    `/properties/${propertyId}/rooms/${roomId}`,
  editRoom: (propertyId: string, roomId: string) =>
    `/properties/${propertyId}/rooms/${roomId}/edit`,
  utilityReadings: (params: { propertyId?: string; month?: string } = {}) => {
    const search = new URLSearchParams(
      Object.entries(params).filter((entry): entry is [string, string] =>
        Boolean(entry[1]),
      ),
    ).toString();
    return `/utility-readings${search ? `?${search}` : ""}`;
  },
  leases: "/leases",
  createLease: (roomId?: string) =>
    roomId ? `/leases/new?roomId=${encodeURIComponent(roomId)}` : "/leases/new",
  leaseDetail: (id: string, origin?: string) =>
    `/leases/${id}${origin ? `?origin=${encodeURIComponent(origin)}` : ""}`,
  editLease: (id: string, origin?: string) =>
    `/leases/${id}/edit${origin ? `?origin=${encodeURIComponent(origin)}` : ""}`,
};
