import {
  GymProfile,
  UserAccount,
  GymPackage,
  MemberProfile,
  AttendanceRecord,
  CommunityPost,
  GeneralDashboardStats,
  AdminAnalyticsStats,
  UserRole,
  MemberRole,
} from "./types";

export const DEFAULT_GYMS: GymProfile[] = [
  {
    id: "gym-bandra-01",
    name: "IronPulse Elite Fitness",
    code: "IP-BAN",
    branch: "Bandra West, Mumbai",
    address: "Plot 42, Linking Road, Bandra West, Mumbai 400050",
    phone: "+91 98201 12345",
    email: "contact@ironpulse.in",
    adminUsername: "admin_bandra",
    adminPassword: "password123",
    createdAt: "2024-01-15",
    maxCapacity: 150,
  },
  {
    id: "gym-indira-02",
    name: "Crush Lifestyle Studio",
    code: "CLS-IND",
    branch: "Indiranagar, Bengaluru",
    address: "100ft Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038",
    phone: "+91 98450 67890",
    email: "hello@crushlifestyle.in",
    adminUsername: "admin_indiranagar",
    adminPassword: "password123",
    createdAt: "2024-03-20",
    maxCapacity: 120,
  },
];

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: "usr-admin-01",
    gymId: "gym-bandra-01",
    username: "admin@gymflow.com",
    email: "admin@gymflow.com",
    password: "admin123",
    name: "Devendra Patel",
    role: "admin",
  },
  {
    id: "usr-normal-01",
    gymId: "gym-bandra-01",
    username: "trainer.vikram@gymflow.com",
    email: "trainer.vikram@gymflow.com",
    password: "trainer123",
    name: "Coach Vikram Rathi",
    role: "normal_user",
  },
  {
    id: "usr-member-01",
    gymId: "gym-bandra-01",
    username: "member.riya@gymflow.com",
    email: "member.riya@gymflow.com",
    password: "member123",
    name: "Riya Mukherjee",
    role: "normal_user",
  },
  // Users for gym 2
  {
    id: "usr-admin-02",
    gymId: "gym-indira-02",
    username: "admin.bengaluru@gymflow.com",
    email: "admin.bengaluru@gymflow.com",
    password: "admin123",
    name: "Priyanshu Routh",
    role: "admin",
  },
];

export const DEFAULT_PACKAGES: Record<string, GymPackage[]> = {
  "gym-bandra-01": [
    {
      id: "pkg-1",
      gymId: "gym-bandra-01",
      name: "Monthly Flex",
      durationDays: 30,
      price: 2499,
      description: "Full access to gym floor, locker facility, and steam room.",
      maxFreezeDays: 3,
      isActive: true,
      popular: false,
      features: ["Gym floor access", "Locker room", "Free fitness assessment"],
    },
    {
      id: "pkg-2",
      gymId: "gym-bandra-01",
      name: "Quarterly Transformation",
      durationDays: 90,
      price: 6499,
      description: "Most popular choice for steady muscle gain and endurance.",
      maxFreezeDays: 10,
      isActive: true,
      popular: true,
      features: ["All floor & cardio zones", "1 Dietician consultation", "10 days freeze pass"],
    },
    {
      id: "pkg-3",
      gymId: "gym-bandra-01",
      name: "Half-Yearly Endurance",
      durationDays: 180,
      price: 11999,
      description: "Ideal for intermediate lifters with complimentary sauna sessions.",
      maxFreezeDays: 20,
      isActive: true,
      popular: false,
      features: ["Unlimited floor access", "Sauna & recovery zone", "2 Personal trainer sessions"],
    },
    {
      id: "pkg-4",
      gymId: "gym-bandra-01",
      name: "Annual Elite Pro",
      durationDays: 365,
      price: 19999,
      description: "Complete premium membership with guest passes and nutritionist support.",
      maxFreezeDays: 45,
      isActive: true,
      popular: false,
      features: ["VIP Locker", "Nutritionist roadmaps", "Unlimited freeze (up to 45d)", "5 Guest passes"],
    },
  ],
  "gym-indira-02": [
    {
      id: "pkg-ind-1",
      gymId: "gym-indira-02",
      name: "Studio Monthly Pass",
      durationDays: 30,
      price: 2200,
      description: "Complete studio gym access with morning & evening batches.",
      maxFreezeDays: 2,
      isActive: true,
      popular: false,
      features: ["Functional zone", "Cardio arena", "Locker facility"],
    },
    {
      id: "pkg-ind-2",
      gymId: "gym-indira-02",
      name: "Studio Quarterly",
      durationDays: 90,
      price: 5800,
      description: "High impact conditioning and HIIT studio classes included.",
      maxFreezeDays: 8,
      isActive: true,
      popular: true,
      features: ["HIIT & Cross-training", "Weekly body composition", "Trainer support"],
    },
    {
      id: "pkg-ind-3",
      gymId: "gym-indira-02",
      name: "Annual Lifestyle VIP",
      durationDays: 365,
      price: 17500,
      description: "Full year VIP membership with dedicated nutrition tracking.",
      maxFreezeDays: 40,
      isActive: true,
      popular: false,
      features: ["All studio classes", "Nutrition meal plan", "30 days freeze quota"],
    },
  ],
};

function formatDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export const DEFAULT_MEMBERS: Record<string, MemberProfile[]> = {
  "gym-bandra-01": [
    {
      member_id: "MEM-101",
      gymId: "gym-bandra-01",
      name: "Aarav Sharma",
      phone: "9876543210",
      email: "aarav.sharma@example.com",
      role: "member",
      gender: "Male",
      date_of_birth: "1996-05-14",
      address: "Bandra West, Mumbai",
      emergency_contact_name: "Sunita Sharma",
      emergency_contact_phone: "9876500001",
      has_subscription: true,
      plan_id: "pkg-2",
      plan_name: "Quarterly Transformation",
      fee: 6499,
      start_date: formatDateOffset(-30),
      expiry_date: formatDateOffset(60),
      payment_status: "Paid",
      member_status: "Active",
      fitness_goal: "Hypertrophy & Fat Loss",
      batch_slot: "Morning 7:00 AM",
      assigned_trainer: "Coach Vikram Rathi",
      notes: "Consistent lifter, working on squat depth.",
      current_streak: 8,
      total_checkins: 42,
      last_checkin_date: formatDateOffset(0),
      created_at: formatDateOffset(-30),
    },
    {
      member_id: "TRN-201",
      gymId: "gym-bandra-01",
      name: "Coach Vikram Rathi",
      phone: "9820411223",
      email: "vikram.rathi@gymflow.com",
      role: "trainer",
      gender: "Male",
      date_of_birth: "1992-08-20",
      address: "Khar West, Mumbai",
      emergency_contact_name: "Rajesh Rathi",
      emergency_contact_phone: "9820400002",
      has_subscription: true, // Trainer with subscription
      plan_id: "pkg-4",
      plan_name: "Annual Elite Pro",
      fee: 19999,
      start_date: formatDateOffset(-120),
      expiry_date: formatDateOffset(245),
      payment_status: "Paid",
      member_status: "Active",
      fitness_goal: "Strength & Conditioning Lead",
      batch_slot: "Morning & Evening",
      assigned_trainer: "Self",
      notes: "Senior Head Trainer. CSCS Certified.",
      current_streak: 24,
      total_checkins: 110,
      last_checkin_date: formatDateOffset(0),
      created_at: formatDateOffset(-120),
    },
    {
      member_id: "TRN-202",
      gymId: "gym-bandra-01",
      name: "Coach Ananya Deshmukh",
      phone: "9833099881",
      email: "ananya.d@gymflow.com",
      role: "trainer",
      gender: "Female",
      date_of_birth: "1995-11-04",
      address: "Santacruz, Mumbai",
      emergency_contact_name: "Pradeep Deshmukh",
      emergency_contact_phone: "9833000003",
      has_subscription: false, // Trainer WITHOUT subscription
      payment_status: "Waived",
      member_status: "Active",
      fitness_goal: "Functional Mobility & Calisthenics",
      batch_slot: "Evening 5:00 PM",
      assigned_trainer: "Self",
      notes: "Yoga & mobility trainer on staff. No paid subscription needed.",
      current_streak: 12,
      total_checkins: 64,
      last_checkin_date: formatDateOffset(0),
      created_at: formatDateOffset(-90),
    },
    {
      member_id: "MEM-102",
      gymId: "gym-bandra-01",
      name: "Riya Mukherjee",
      phone: "9831022145",
      email: "riya.m@example.com",
      role: "member",
      gender: "Female",
      date_of_birth: "1999-02-18",
      address: "Pali Hill, Bandra West",
      emergency_contact_name: "Kunal Mukherjee",
      emergency_contact_phone: "9831000004",
      has_subscription: true,
      plan_id: "pkg-1",
      plan_name: "Monthly Flex",
      fee: 2499,
      start_date: formatDateOffset(-35),
      expiry_date: formatDateOffset(-5), // EXPIRED!
      payment_status: "Pending",
      member_status: "Expired",
      fitness_goal: "Cardio Conditioning & Core",
      batch_slot: "Evening 6:30 PM",
      assigned_trainer: "Coach Ananya Deshmukh",
      notes: "Plan expired 5 days ago. Needs reminder to renew.",
      current_streak: 0,
      total_checkins: 22,
      last_checkin_date: formatDateOffset(-6),
      created_at: formatDateOffset(-35),
    },
    {
      member_id: "MEM-103",
      gymId: "gym-bandra-01",
      name: "Sayan Das",
      phone: "9903011882",
      email: "sayan.das@example.com",
      role: "member",
      gender: "Male",
      date_of_birth: "1994-09-12",
      address: "Juhu Lane, Andheri West",
      emergency_contact_name: "Mitali Das",
      emergency_contact_phone: "9903000005",
      has_subscription: true,
      plan_id: "pkg-3",
      plan_name: "Half-Yearly Endurance",
      fee: 11999,
      start_date: formatDateOffset(-178),
      expiry_date: formatDateOffset(2), // EXPIRING IN 2 DAYS!
      payment_status: "Paid",
      member_status: "Active",
      fitness_goal: "Powerlifting Preparation",
      batch_slot: "Morning 8:00 AM",
      assigned_trainer: "Coach Vikram Rathi",
      notes: "Approaching expiry within 48 hours.",
      current_streak: 5,
      total_checkins: 78,
      last_checkin_date: formatDateOffset(0),
      created_at: formatDateOffset(-178),
    },
    {
      member_id: "MEM-104",
      gymId: "gym-bandra-01",
      name: "Kabir Bose",
      phone: "9830155442",
      email: "kabir.b@example.com",
      role: "member",
      gender: "Male",
      date_of_birth: "1998-07-25",
      address: "Versova, Mumbai",
      emergency_contact_name: "Tanvi Bose",
      emergency_contact_phone: "9830100006",
      has_subscription: true,
      plan_id: "pkg-1",
      plan_name: "Monthly Flex",
      fee: 2499,
      start_date: formatDateOffset(-10),
      expiry_date: formatDateOffset(20),
      payment_status: "Pending",
      member_status: "Pending",
      fitness_goal: "Weight Loss",
      batch_slot: "Evening 7:30 PM",
      assigned_trainer: "Coach Ananya Deshmukh",
      notes: "Fee payment pending via UPI.",
      current_streak: 2,
      total_checkins: 6,
      last_checkin_date: formatDateOffset(-1),
      created_at: formatDateOffset(-10),
    },
  ],
  "gym-indira-02": [
    {
      member_id: "MEM-IND-01",
      gymId: "gym-indira-02",
      name: "Sneha Reddy",
      phone: "9844011223",
      email: "sneha.reddy@example.com",
      role: "member",
      gender: "Female",
      date_of_birth: "1995-03-10",
      address: "Indiranagar 12th Main, Bengaluru",
      emergency_contact_name: "Karthik Reddy",
      emergency_contact_phone: "9844000001",
      has_subscription: true,
      plan_id: "pkg-ind-2",
      plan_name: "Studio Quarterly",
      fee: 5800,
      start_date: formatDateOffset(-15),
      expiry_date: formatDateOffset(75),
      payment_status: "Paid",
      member_status: "Active",
      fitness_goal: "HIIT & Athletic Toning",
      batch_slot: "Morning 7:00 AM",
      assigned_trainer: "Coach Arjun Nair",
      notes: "Excellent attendance record.",
      current_streak: 9,
      total_checkins: 32,
      last_checkin_date: formatDateOffset(0),
      created_at: formatDateOffset(-15),
    },
    {
      member_id: "TRN-IND-01",
      gymId: "gym-indira-02",
      name: "Coach Arjun Nair",
      phone: "9845012345",
      email: "arjun.nair@gymflow.com",
      role: "trainer",
      gender: "Male",
      date_of_birth: "1991-12-14",
      address: "Domlur, Bengaluru",
      emergency_contact_name: "Deepa Nair",
      emergency_contact_phone: "9845000002",
      has_subscription: false,
      payment_status: "Waived",
      member_status: "Active",
      fitness_goal: "Strength & Crossfit Coach",
      batch_slot: "Morning Batches",
      assigned_trainer: "Self",
      notes: "Head coach at Indiranagar studio.",
      current_streak: 18,
      total_checkins: 89,
      last_checkin_date: formatDateOffset(0),
      created_at: formatDateOffset(-80),
    },
  ],
};

export const DEFAULT_ATTENDANCE: Record<string, AttendanceRecord[]> = {
  "gym-bandra-01": [
    {
      id: "att-1",
      gymId: "gym-bandra-01",
      member_id: "MEM-101",
      member_name: "Aarav Sharma",
      role: "member",
      checkin_date: formatDateOffset(0),
      checkin_time: "07:14:22",
      workout_type: "Strength & Hypertrophy",
      streak_after_checkin: 8,
    },
    {
      id: "att-2",
      gymId: "gym-bandra-01",
      member_id: "TRN-201",
      member_name: "Coach Vikram Rathi",
      role: "trainer",
      checkin_date: formatDateOffset(0),
      checkin_time: "06:30:10",
      workout_type: "Floor Training Supervision",
      streak_after_checkin: 24,
    },
    {
      id: "att-3",
      gymId: "gym-bandra-01",
      member_id: "TRN-202",
      member_name: "Coach Ananya Deshmukh",
      role: "trainer",
      checkin_date: formatDateOffset(0),
      checkin_time: "07:05:00",
      workout_type: "Mobility Warmups",
      streak_after_checkin: 12,
    },
    {
      id: "att-4",
      gymId: "gym-bandra-01",
      member_id: "MEM-103",
      member_name: "Sayan Das",
      role: "member",
      checkin_date: formatDateOffset(0),
      checkin_time: "08:10:45",
      workout_type: "Powerlifting Heavy Day",
      streak_after_checkin: 5,
    },
  ],
  "gym-indira-02": [
    {
      id: "att-ind-1",
      gymId: "gym-indira-02",
      member_id: "MEM-IND-01",
      member_name: "Sneha Reddy",
      role: "member",
      checkin_date: formatDateOffset(0),
      checkin_time: "07:02:18",
      workout_type: "Functional HIIT",
      streak_after_checkin: 9,
    },
    {
      id: "att-ind-2",
      gymId: "gym-indira-02",
      member_id: "TRN-IND-01",
      member_name: "Coach Arjun Nair",
      role: "trainer",
      checkin_date: formatDateOffset(0),
      checkin_time: "06:45:00",
      workout_type: "Crossfit Floor Lead",
      streak_after_checkin: 18,
    },
  ],
};

export const DEFAULT_COMMUNITY_POSTS: Record<string, CommunityPost[]> = {
  "gym-bandra-01": [
    {
      id: "post-1",
      gymId: "gym-bandra-01",
      author_id: "MEM-101",
      author_name: "Aarav Sharma",
      author_role: "member",
      title: "Hit 140kg Deadlift PR today! 🏋️‍♂️",
      category: "Personal Record",
      content:
        "Been training for this with Coach Vikram for the past 6 weeks. Form felt locked in, grip was solid. Massive thanks to the morning crew for the cheers!",
      metric_badge: "140 kg Deadlift",
      likes: 18,
      liked_by_me: false,
      comments: [
        {
          id: "c-1",
          author_id: "TRN-201",
          author_name: "Coach Vikram Rathi",
          author_role: "trainer",
          text: "Phenomenal discipline Aarav! Form was crisp. 150kg is next!",
          created_at: "2 hours ago",
        },
        {
          id: "c-2",
          author_id: "MEM-103",
          author_name: "Sayan Das",
          author_role: "member",
          text: "Huge lift brother! That bar speed was clean.",
          created_at: "1 hour ago",
        },
      ],
      created_at: "3 hours ago",
    },
    {
      id: "post-2",
      gymId: "gym-bandra-01",
      author_id: "MEM-103",
      author_name: "Sayan Das",
      author_role: "member",
      title: "30-Day Unbroken Workout Streak 🔥",
      category: "Streak Milestone",
      content:
        "Never thought I would stick to a gym routine through a busy work quarter. Just 50 minutes every morning makes the rest of the day so much easier.",
      metric_badge: "30-Day Streak",
      likes: 24,
      liked_by_me: true,
      comments: [
        {
          id: "c-3",
          author_id: "TRN-202",
          author_name: "Coach Ananya Deshmukh",
          author_role: "trainer",
          text: "Consistency is everything Sayan! Proud of the habit you've built.",
          created_at: "4 hours ago",
        },
      ],
      created_at: "Yesterday",
    },
    {
      id: "post-3",
      gymId: "gym-bandra-01",
      author_id: "TRN-202",
      author_name: "Coach Ananya Deshmukh",
      author_role: "trainer",
      title: "Hip & Ankle Mobility Workshop this Saturday 🧘‍♀️",
      category: "Community Event",
      content:
        "We are hosting a free 45-minute mobility clinic on Saturday at 10:00 AM. Learn pre-squat openers and thoracic spine drills. Open to all members & trainers!",
      metric_badge: "Free Workshop",
      likes: 31,
      liked_by_me: false,
      comments: [],
      created_at: "2 days ago",
    },
  ],
  "gym-indira-02": [
    {
      id: "post-ind-1",
      gymId: "gym-indira-02",
      author_id: "MEM-IND-01",
      author_name: "Sneha Reddy",
      author_role: "member",
      title: "Completed my first 5k row in under 22 mins! 🚣‍♀️",
      category: "Personal Record",
      content: "Pushed through the mental barrier around the 3.5km mark. Feeling pumped for next month's studio challenge!",
      metric_badge: "5km Row · 21:40",
      likes: 14,
      liked_by_me: true,
      comments: [],
      created_at: "Yesterday",
    },
  ],
};

/* ----------------- Storage & State Helper Class ----------------- */

class GymDataManager {
  private getStored<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const val = window.localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  }

  private setStored<T>(key: string, val: T): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(val));
    } catch {
      // Storage quota or private mode fallback
    }
  }

  // Active Gym
  getActiveGymId(): string {
    return this.getStored("gymflow_active_gym_id", "gym-bandra-01");
  }

  setActiveGymId(gymId: string): void {
    this.setStored("gymflow_active_gym_id", gymId);
  }

  // Active User Profile
  getActiveUser(): UserAccount {
    const defaultUser = DEFAULT_USERS[0];
    return this.getStored("gymflow_active_user", defaultUser);
  }

  setActiveUser(user: UserAccount): void {
    this.setStored("gymflow_active_user", user);
  }

  // Gym Profiles
  getGyms(): GymProfile[] {
    return this.getStored("gymflow_gyms", DEFAULT_GYMS);
  }

  addGym(gym: Omit<GymProfile, "id" | "createdAt">): GymProfile {
    const gyms = this.getGyms();
    const newGym: GymProfile = {
      ...gym,
      id: `gym-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString().split("T")[0],
      maxCapacity: gym.maxCapacity || 120,
    };
    gyms.push(newGym);
    this.setStored("gymflow_gyms", gyms);

    // Also create admin user account for this new gym
    const users = this.getUsers();
    users.push({
      id: `usr-admin-${Date.now().toString(36)}`,
      gymId: newGym.id,
      username: gym.adminUsername,
      email: gym.email,
      password: gym.adminPassword,
      name: `${gym.name} Admin`,
      role: "admin",
    });
    this.setStored("gymflow_users", users);

    // Pre-seed standard packages for this new gym
    const packagesMap = this.getAllPackages();
    packagesMap[newGym.id] = [
      {
        id: `pkg-${newGym.id}-1`,
        gymId: newGym.id,
        name: "Monthly Membership",
        durationDays: 30,
        price: 2500,
        description: "Full gym floor access with lockers.",
        maxFreezeDays: 3,
        isActive: true,
        popular: false,
        features: ["Floor access", "Locker room"],
      },
      {
        id: `pkg-${newGym.id}-2`,
        gymId: newGym.id,
        name: "Quarterly Pro",
        durationDays: 90,
        price: 6500,
        description: "3 months standard training plan.",
        maxFreezeDays: 10,
        isActive: true,
        popular: true,
        features: ["Floor & cardio", "Free assessment", "10 days freeze"],
      },
      {
        id: `pkg-${newGym.id}-3`,
        gymId: newGym.id,
        name: "Annual All-Access",
        durationDays: 365,
        price: 18999,
        description: "Yearly VIP gym membership.",
        maxFreezeDays: 45,
        isActive: true,
        popular: false,
        features: ["All access pass", "Sauna & recovery", "Trainer guidance"],
      },
    ];
    this.setStored("gymflow_packages", packagesMap);

    return newGym;
  }

  // Users
  getUsers(): UserAccount[] {
    return this.getStored("gymflow_users", DEFAULT_USERS);
  }

  addUser(user: Omit<UserAccount, "id">): UserAccount {
    const users = this.getUsers();
    const newUser: UserAccount = {
      ...user,
      id: `usr-${Date.now().toString(36)}`,
    };
    users.push(newUser);
    this.setStored("gymflow_users", users);
    return newUser;
  }

  // Packages per Gym
  private getAllPackages(): Record<string, GymPackage[]> {
    return this.getStored("gymflow_packages", DEFAULT_PACKAGES);
  }

  getPackages(gymId: string): GymPackage[] {
    const all = this.getAllPackages();
    return all[gymId] || [];
  }

  savePackage(gymId: string, pkgData: Partial<GymPackage> & { name: string; price: number; durationDays: number }): GymPackage {
    const all = this.getAllPackages();
    const list = all[gymId] ? [...all[gymId]] : [];

    if (pkgData.id) {
      const idx = list.findIndex((p) => p.id === pkgData.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...pkgData };
        all[gymId] = list;
        this.setStored("gymflow_packages", all);
        return list[idx];
      }
    }

    const newPkg: GymPackage = {
      id: `pkg-${Date.now().toString(36)}`,
      gymId,
      name: pkgData.name,
      durationDays: Number(pkgData.durationDays),
      price: Number(pkgData.price),
      description: pkgData.description || "",
      maxFreezeDays: Number(pkgData.maxFreezeDays || 0),
      isActive: pkgData.isActive ?? true,
      popular: pkgData.popular ?? false,
      features: pkgData.features || ["Floor access", "Locker facility"],
    };
    list.push(newPkg);
    all[gymId] = list;
    this.setStored("gymflow_packages", all);
    return newPkg;
  }

  deletePackage(gymId: string, pkgId: string): void {
    const all = this.getAllPackages();
    if (all[gymId]) {
      all[gymId] = all[gymId].filter((p) => p.id !== pkgId);
      this.setStored("gymflow_packages", all);
    }
  }

  // Members per Gym
  private getAllMembers(): Record<string, MemberProfile[]> {
    return this.getStored("gymflow_members", DEFAULT_MEMBERS);
  }

  getMembers(gymId: string): MemberProfile[] {
    const all = this.getAllMembers();
    const list = all[gymId] || [];

    // Automatically check and evaluate expiration status based on expiry_date
    const today = new Date().toISOString().split("T")[0];
    let modified = false;

    const evaluated = list.map((m) => {
      if (m.has_subscription && m.expiry_date) {
        if (m.expiry_date < today && m.member_status === "Active") {
          modified = true;
          return { ...m, member_status: "Expired" as const };
        }
      }
      return m;
    });

    if (modified) {
      all[gymId] = evaluated;
      this.setStored("gymflow_members", all);
    }

    return evaluated;
  }

  createMember(gymId: string, memberData: Omit<MemberProfile, "member_id" | "gymId" | "created_at" | "current_streak" | "total_checkins">): MemberProfile {
    const all = this.getAllMembers();
    const list = all[gymId] ? [...all[gymId]] : [];

    // Generate unique ID based on role
    const prefix = memberData.role === "trainer" ? "TRN" : "MEM";
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const member_id = `${prefix}-${randomSuffix}`;

    const newMember: MemberProfile = {
      ...memberData,
      member_id,
      gymId,
      current_streak: 0,
      total_checkins: 0,
      created_at: new Date().toISOString().split("T")[0],
    };

    list.unshift(newMember);
    all[gymId] = list;
    this.setStored("gymflow_members", all);
    return newMember;
  }

  updateMember(gymId: string, memberId: string, updates: Partial<MemberProfile>): MemberProfile {
    const all = this.getAllMembers();
    const list = all[gymId] ? [...all[gymId]] : [];
    const idx = list.findIndex((m) => m.member_id === memberId);
    if (idx === -1) throw new Error(`Member with ID ${memberId} not found.`);

    // ENSURE member_id is never changed!
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { member_id, ...safeUpdates } = updates;

    // Check expiry date vs today
    let finalStatus = safeUpdates.member_status || list[idx].member_status;
    const targetExpiry = safeUpdates.expiry_date !== undefined ? safeUpdates.expiry_date : list[idx].expiry_date;
    const today = new Date().toISOString().split("T")[0];

    if (targetExpiry && targetExpiry < today && finalStatus === "Active") {
      finalStatus = "Expired";
    }

    list[idx] = {
      ...list[idx],
      ...safeUpdates,
      member_status: finalStatus,
    };

    all[gymId] = list;
    this.setStored("gymflow_members", all);
    return list[idx];
  }

  deleteMember(gymId: string, memberId: string): void {
    const all = this.getAllMembers();
    if (all[gymId]) {
      all[gymId] = all[gymId].filter((m) => m.member_id !== memberId);
      this.setStored("gymflow_members", all);
    }
  }

  // Attendance per Gym
  private getAllAttendance(): Record<string, AttendanceRecord[]> {
    return this.getStored("gymflow_attendance", DEFAULT_ATTENDANCE);
  }

  getTodayAttendance(gymId: string): AttendanceRecord[] {
    const all = this.getAllAttendance();
    const list = all[gymId] || [];
    const today = new Date().toISOString().split("T")[0];
    return list.filter((a) => a.checkin_date === today);
  }

  recordCheckin(gymId: string, memberId: string, workoutType = "Gym Floor"): { attendance: AttendanceRecord; member: MemberProfile } {
    const allMembers = this.getAllMembers();
    const gymMembers = allMembers[gymId] || [];
    const memberIndex = gymMembers.findIndex((m) => m.member_id === memberId);
    if (memberIndex === -1) throw new Error("Member or Trainer not found.");

    const member = gymMembers[memberIndex];
    const today = new Date().toISOString().split("T")[0];
    const nowTime = new Date().toTimeString().split(" ")[0];

    const allAtt = this.getAllAttendance();
    const gymAtt = allAtt[gymId] ? [...allAtt[gymId]] : [];

    // Check if already checked in today
    const existing = gymAtt.find((a) => a.member_id === memberId && a.checkin_date === today);
    if (existing) {
      return { attendance: existing, member };
    }

    const nextStreak = member.current_streak + 1;
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now().toString(36)}`,
      gymId,
      member_id: member.member_id,
      member_name: member.name,
      role: member.role,
      checkin_date: today,
      checkin_time: nowTime,
      workout_type: workoutType,
      streak_after_checkin: nextStreak,
    };

    gymAtt.unshift(newRecord);
    allAtt[gymId] = gymAtt;
    this.setStored("gymflow_attendance", allAtt);

    // Update member's streak and total checkins
    gymMembers[memberIndex] = {
      ...member,
      current_streak: nextStreak,
      total_checkins: member.total_checkins + 1,
      last_checkin_date: today,
    };
    allMembers[gymId] = gymMembers;
    this.setStored("gymflow_members", allMembers);

    return { attendance: newRecord, member: gymMembers[memberIndex] };
  }

  removeCheckin(gymId: string, attendanceId: string): void {
    const allAtt = this.getAllAttendance();
    if (allAtt[gymId]) {
      allAtt[gymId] = allAtt[gymId].filter((a) => a.id !== attendanceId);
      this.setStored("gymflow_attendance", allAtt);
    }
  }

  // Community per Gym
  private getAllCommunityPosts(): Record<string, CommunityPost[]> {
    return this.getStored("gymflow_community", DEFAULT_COMMUNITY_POSTS);
  }

  getCommunityPosts(gymId: string): CommunityPost[] {
    const all = this.getAllCommunityPosts();
    return all[gymId] || [];
  }

  addCommunityPost(
    gymId: string,
    postData: {
      author_id: string;
      author_name: string;
      author_role: "member" | "trainer" | "admin";
      title: string;
      category: CommunityPost["category"];
      content: string;
      metric_badge?: string;
    }
  ): CommunityPost {
    const all = this.getAllCommunityPosts();
    const list = all[gymId] ? [...all[gymId]] : [];

    const newPost: CommunityPost = {
      id: `post-${Date.now().toString(36)}`,
      gymId,
      author_id: postData.author_id,
      author_name: postData.author_name,
      author_role: postData.author_role,
      title: postData.title,
      category: postData.category,
      content: postData.content,
      metric_badge: postData.metric_badge,
      likes: 0,
      liked_by_me: false,
      comments: [],
      created_at: "Just now",
    };

    list.unshift(newPost);
    all[gymId] = list;
    this.setStored("gymflow_community", all);
    return newPost;
  }

  toggleLikePost(gymId: string, postId: string): void {
    const all = this.getAllCommunityPosts();
    const list = all[gymId] || [];
    const post = list.find((p) => p.id === postId);
    if (post) {
      post.liked_by_me = !post.liked_by_me;
      post.likes += post.liked_by_me ? 1 : -1;
      this.setStored("gymflow_community", all);
    }
  }

  addCommentToPost(gymId: string, postId: string, comment: { author_id: string; author_name: string; author_role: MemberRole | UserRole; text: string }): void {
    const all = this.getAllCommunityPosts();
    const list = all[gymId] || [];
    const post = list.find((p) => p.id === postId);
    if (post) {
      post.comments.push({
        id: `c-${Date.now().toString(36)}`,
        author_id: comment.author_id,
        author_name: comment.author_name,
        author_role: comment.author_role,
        text: comment.text,
        created_at: "Just now",
      });
      this.setStored("gymflow_community", all);
    }
  }

  // WhatsApp Reminder Link Generator
  generateWhatsAppReminderUrl(member: MemberProfile, gymName: string): string {
    const cleanPhone = member.phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const isExpired = member.member_status === "Expired";
    const statusNote = isExpired
      ? `your membership expired on ${member.expiry_date}.`
      : `your ${member.plan_name || "membership"} is due for renewal on ${member.expiry_date}.`;

    const message = `Hello ${member.name}! 👋\n\nThis is a friendly reminder from *${gymName}* that ${statusNote}\n\nPlease visit the front desk or renew your package to continue uninterrupted workouts and streak milestones!\n\nStay fit, stay strong! 💪`;

    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
  }

  // General Dashboard Statistics
  getDashboardStats(gymId: string): GeneralDashboardStats {
    const members = this.getMembers(gymId);
    const todayAtt = this.getTodayAttendance(gymId);
    const gym = this.getGyms().find((g) => g.id === gymId) || DEFAULT_GYMS[0];

    const activeMembers = members.filter((m) => m.role === "member" && m.member_status === "Active").length;
    const activeTrainers = members.filter((m) => m.role === "trainer").length;
    const expiredCount = members.filter((m) => m.member_status === "Expired").length;
    const pendingDuesCount = members.filter((m) => m.payment_status === "Pending").length;
    const capacity = gym.maxCapacity || 120;
    const utilization = Math.min(100, Math.round((todayAtt.length / capacity) * 100));

    return {
      totalMembers: members.filter((m) => m.role === "member").length,
      activeMembers,
      activeTrainers,
      todayCheckins: todayAtt.length,
      capacityUtilizationPct: utilization,
      expiredCount,
      pendingDuesCount,
      announcements: [
        {
          id: "ann-1",
          title: "New squat rack and bumper plates installed in Zone B",
          date: "Yesterday",
          tag: "Equipment",
        },
        {
          id: "ann-2",
          title: "Sunday Special: Functional mobility workshop with Coach Ananya",
          date: "Nov 23",
          tag: "Event",
        },
        {
          id: "ann-3",
          title: "Lockers audit scheduled for Thursday 2 PM to 4 PM",
          date: "Nov 25",
          tag: "Notice",
        },
      ],
    };
  }

  // Admin Analytics Statistics (Visible ONLY to Admin)
  getAdminAnalyticsStats(gymId: string): AdminAnalyticsStats {
    const members = this.getMembers(gymId);
    const packages = this.getPackages(gymId);
    const today = new Date().toISOString().split("T")[0];

    const threeDaysOut = formatDateOffset(3);
    const sevenDaysOut = formatDateOffset(7);

    let grossRevenue = 0;
    let pendingReceivables = 0;
    let expiringIn3Days = 0;
    let expiringIn7Days = 0;

    const planCountMap: Record<string, number> = {};

    members.forEach((m) => {
      if (m.has_subscription && m.fee) {
        if (m.payment_status === "Paid") {
          grossRevenue += m.fee;
        } else if (m.payment_status === "Pending") {
          pendingReceivables += m.fee;
        }
      }

      if (m.plan_name) {
        planCountMap[m.plan_name] = (planCountMap[m.plan_name] || 0) + 1;
      }

      if (m.expiry_date && m.member_status === "Active") {
        if (m.expiry_date >= today && m.expiry_date <= threeDaysOut) {
          expiringIn3Days++;
        }
        if (m.expiry_date >= today && m.expiry_date <= sevenDaysOut) {
          expiringIn7Days++;
        }
      }
    });

    const netRevenue = Math.round(grossRevenue * 0.82); // Net ex-18% GST estimate
    const totalMembers = members.filter((m) => m.role === "member").length || 1;
    const avgRevenuePerMember = Math.round(grossRevenue / totalMembers);

    const planBreakdown = packages.map((pkg) => {
      const count = planCountMap[pkg.name] || 0;
      const sharePct = Math.round((count / totalMembers) * 100);
      return {
        name: pkg.name,
        count,
        sharePct,
        revenue: count * pkg.price,
      };
    });

    const trainerPerformance = members
      .filter((m) => m.role === "trainer")
      .map((t) => {
        const clients = members.filter((m) => m.assigned_trainer === t.name).length;
        return {
          name: t.name,
          activeClients: clients,
          checkinsAssisted: t.total_checkins,
          rating: 4.9,
        };
      });

    return {
      grossRevenue,
      netRevenue,
      pendingReceivables,
      avgRevenuePerMember,
      monthlyGrowthPct: 14.2,
      retentionRatePct: 92.5,
      expiringIn3Days,
      expiringIn7Days,
      attendancePeakHour: "07:00 PM – 08:30 PM",
      planBreakdown,
      trainerPerformance,
      weeklyRevenueHistory: [
        { month: "May", amount: 125000 },
        { month: "Jun", amount: 154000 },
        { month: "Jul", amount: 142000 },
        { month: "Aug", amount: 188000 },
        { month: "Sep", amount: 215000 },
        { month: "Oct", amount: 198000 },
        { month: "Nov (Current)", amount: grossRevenue || 235000, isPeak: true },
      ],
    };
  }
}

export const gymDataManager = new GymDataManager();

