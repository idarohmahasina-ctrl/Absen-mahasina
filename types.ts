
export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Terlambat' | 'Alpa';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  type: 'In' | 'Out';
  status: AttendanceStatus;
  location?: LocationData;
  photo?: string;
  note?: string;
  activityCategory?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  unit: string;
}
