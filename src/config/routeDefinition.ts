type QueryParams = Record<string, string | number | undefined>;

const toQueryString = (params: QueryParams) => {
  const search = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value]) => [key, String(value)]),
  ).toString();
  return search ? `?${search}` : "";
};

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
  utilityReadings: (params: { propertyId?: string; month?: string } = {}) =>
    `/utility-readings${toQueryString(params)}`,
  invoices: "/invoices",
  invoiceDetail: (id: string) => `/invoices/${id}`,
  createInvoice: "/invoices/new",
  leases: "/leases",
  createLease: (roomId?: string) =>
    roomId ? `/leases/new?roomId=${encodeURIComponent(roomId)}` : "/leases/new",
  leaseDetail: (id: string, origin?: string) =>
    `/leases/${id}${origin ? `?origin=${encodeURIComponent(origin)}` : ""}`,
  editLease: (id: string, origin?: string) =>
    `/leases/${id}/edit${origin ? `?origin=${encodeURIComponent(origin)}` : ""}`,
};
