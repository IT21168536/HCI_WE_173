export type VehicleType = 'bicycle' | 'motorcycle' | 'scooter' | 'car' | 'van';

export type RiderProfile = {
  id: number;
  userId: number;
  vehicleType: VehicleType;
  vehicleNumber?: string | null;
  licenseNumber?: string | null;
  emergencyContact?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

export type RiderProfileInput = {
  vehicleType: VehicleType;
  vehicleNumber?: string | null;
  licenseNumber?: string | null;
  emergencyContact?: string | null;
};

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  bicycle: 'Bicycle',
  motorcycle: 'Motorcycle',
  scooter: 'Scooter',
  car: 'Car',
  van: 'Van',
};
