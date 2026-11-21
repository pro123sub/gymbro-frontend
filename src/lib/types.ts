export type UserRole = "admin" | "normal_user";
export type MemberRole = "member" | "trainer";
export type MemberStatus = "Active" | "Expired" | "Pending" | "Frozen" | "Inactive";
export type PaymentStatus = "Paid" | "Pending" | "Waived";

export interface GymProfile {
  id: string;
  name: string;
  code: string;
  branch: string;
  address: string;
  phone: string;
  email: string;
  adminUsername: string;
  adminPassword: string; // Plain demo or hashed
  createdAt: string;
  logoAccent?: string;
  maxCapacity?: number;
}

export interface UserAccount {
  id: string;
  gymId: string;
  username: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface GymPackage {
  id: string;
  gymId: string;
  name: string;
  durationDays: number;
  price: number;
  description: string;
  maxFreezeDays: number;
  popular?: boolean;
  isActive: boolean;
  features?: string[];
}

export interface MemberProfile {
  member_id: string; // Read-only / Immutable once created
  gymId: string;
  name: string;
  phone: string;
  email: string;
  role: MemberRole; // "member" or "trainer"
  gender: "Male" | "Female" | "Other" | "Prefer not to say";
  date_of_birth: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  
  // Membership & Subscription
  has_subscription: boolean; // Optional for trainer, mandatory for member
  plan_id?: string;
  plan_name?: string;
  fee?: number;
  start_date?: string;
  expiry_date?: string;
  payment_status: PaymentStatus;
  member_status: MemberStatus;
  
  // Gym Specific Details
  fitness_goal?: string;
  batch_slot?: string;
  assigned_trainer?: string;
  notes?: string;
  
  // Consistency & Activity
  current_streak: number;
  total_checkins: number;
  last_checkin_date?: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  gymId: string;
  member_id: string;
  member_name: string;
  role: MemberRole;
  checkin_date: string; // YYYY-MM-DD
  checkin_time: string; // HH:mm:ss
  workout_type: string;
  streak_after_checkin: number;
}

export interface CommunityComment {
  id: string;
  author_id: string;
  author_name: string;
  author_role: MemberRole | UserRole;
  text: string;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  gymId: string;
  author_id: string;
  author_name: string;
  author_role: MemberRole | "admin";
  title: string;
  category: "Personal Record" | "Weight Goal" | "Streak Milestone" | "Transformation" | "Community Event";
  content: string;
  metric_badge?: string; // e.g. "140 kg Deadlift", "30 Days Streak", "-7 kg Lost"
  likes: number;
  liked_by_me: boolean;
  comments: CommunityComment[];
  created_at: string;
}

export interface GeneralDashboardStats {
  totalMembers: number;
  activeMembers: number;
  activeTrainers: number;
  todayCheckins: number;
  capacityUtilizationPct: number;
  expiredCount: number;
  pendingDuesCount: number;
  announcements: Array<{ id: string; title: string; date: string; tag: string }>;
}

export interface AdminAnalyticsStats {
  grossRevenue: number;
  netRevenue: number;
  pendingReceivables: number;
  avgRevenuePerMember: number;
  monthlyGrowthPct: number;
  retentionRatePct: number;
  expiringIn3Days: number;
  expiringIn7Days: number;
  attendancePeakHour: string;
  planBreakdown: Array<{ name: string; count: number; sharePct: number; revenue: number }>;
  trainerPerformance: Array<{ name: string; activeClients: number; checkinsAssisted: number; rating: number }>;
  weeklyRevenueHistory: Array<{ month: string; amount: number; isPeak?: boolean }>;
}

