import { getDatabase } from '@/core/database/database';
import type { RiderProfile, RiderProfileInput, VehicleType } from '@/shared/types/RiderProfile';
import type { RiderSchedule, RiderScheduleInput } from '@/shared/types/RiderSchedule';

type RiderProfileRow = {
  id: number;
  user_id: number;
  vehicle_type: VehicleType;
  vehicle_number: string | null;
  license_number: string | null;
  emergency_contact: string | null;
  created_at: string;
  updated_at: string | null;
};

type RiderScheduleRow = {
  id: number;
  rider_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: number;
  created_at: string;
  updated_at: string | null;
};

function mapRiderProfile(row: RiderProfileRow): RiderProfile {
  return {
    id: row.id,
    userId: row.user_id,
    vehicleType: row.vehicle_type,
    vehicleNumber: row.vehicle_number,
    licenseNumber: row.license_number,
    emergencyContact: row.emergency_contact,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRiderSchedule(row: RiderScheduleRow): RiderSchedule {
  return {
    id: row.id,
    riderId: row.rider_id,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    endTime: row.end_time,
    isAvailable: row.is_available === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getRiderProfile(riderId: number): Promise<RiderProfile | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<RiderProfileRow>('SELECT * FROM rider_profiles WHERE user_id = ?', [riderId]);
  return row ? mapRiderProfile(row) : null;
}

export async function upsertRiderProfile(riderId: number, input: RiderProfileInput): Promise<RiderProfile> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO rider_profiles
      (user_id, vehicle_type, vehicle_number, license_number, emergency_contact, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       vehicle_type = excluded.vehicle_type,
       vehicle_number = excluded.vehicle_number,
       license_number = excluded.license_number,
       emergency_contact = excluded.emergency_contact,
       updated_at = excluded.updated_at`,
    [
      riderId,
      input.vehicleType,
      input.vehicleNumber?.trim().toUpperCase() || null,
      input.licenseNumber?.trim().toUpperCase() || null,
      input.emergencyContact?.trim() || null,
      now,
      now,
    ],
  );
  const profile = await getRiderProfile(riderId);
  if (!profile) throw new Error('Could not save rider profile.');
  return profile;
}

export async function listRiderSchedules(riderId: number): Promise<RiderSchedule[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RiderScheduleRow>(
    `SELECT * FROM rider_schedules WHERE rider_id = ?
     ORDER BY CASE WHEN day_of_week = 0 THEN 7 ELSE day_of_week END, start_time`,
    [riderId],
  );
  return rows.map(mapRiderSchedule);
}

export async function getRiderSchedule(id: number, riderId: number): Promise<RiderSchedule | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<RiderScheduleRow>('SELECT * FROM rider_schedules WHERE id = ? AND rider_id = ?', [id, riderId]);
  return row ? mapRiderSchedule(row) : null;
}

export async function createRiderSchedule(riderId: number, input: RiderScheduleInput): Promise<RiderSchedule> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO rider_schedules (rider_id, day_of_week, start_time, end_time, is_available, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [riderId, input.dayOfWeek, input.startTime, input.endTime, input.isAvailable ? 1 : 0, now, now],
  );
  const schedule = await getRiderSchedule(result.lastInsertRowId, riderId);
  if (!schedule) throw new Error('Could not create schedule.');
  return schedule;
}

export async function updateRiderSchedule(id: number, riderId: number, input: RiderScheduleInput): Promise<RiderSchedule> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `UPDATE rider_schedules SET day_of_week = ?, start_time = ?, end_time = ?, is_available = ?, updated_at = ?
     WHERE id = ? AND rider_id = ?`,
    [input.dayOfWeek, input.startTime, input.endTime, input.isAvailable ? 1 : 0, new Date().toISOString(), id, riderId],
  );
  if (result.changes === 0) throw new Error('Schedule not found.');
  const schedule = await getRiderSchedule(id, riderId);
  if (!schedule) throw new Error('Could not load updated schedule.');
  return schedule;
}

export async function deleteRiderSchedule(id: number, riderId: number): Promise<void> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM rider_schedules WHERE id = ? AND rider_id = ?', [id, riderId]);
  if (result.changes === 0) throw new Error('Schedule not found.');
}
