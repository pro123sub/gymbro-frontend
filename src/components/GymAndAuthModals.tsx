"use client";

import React, { useState } from "react";
import {
  X,
  Building2,
  Lock,
  User,
  Shield,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import { GymProfile, UserAccount, UserRole } from "@/lib/types";
import { gymDataManager } from "@/lib/gymData";

/* =========================================================================
   1. ADD NEW GYM PROFILE MODAL (ADMIN ONLY)
   ========================================================================= */

interface AddGymModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newGym: GymProfile) => void;
}

export function AddGymModal({ open, onClose, onSuccess }: AddGymModalProps) {
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("150");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !branch.trim()) {
      setError("Please fill in the Gym Name and Branch location.");
      return;
    }
    if (!adminUsername.trim() || !adminPassword.trim()) {
      setError("Please set an admin username and password for this gym profile.");
      return;
    }

    try {
      const created = gymDataManager.addGym({
        name: name.trim(),
        branch: branch.trim(),
        code: code.trim() || `GYM-${Math.floor(10 + Math.random() * 90)}`,
        address: address.trim(),
        phone: phone.trim() || "+91 98000 00000",
        email: email.trim() || `${adminUsername.trim()}@gymflow.com`,
        adminUsername: adminUsername.trim(),
        adminPassword: adminPassword.trim(),
        maxCapacity: Number(maxCapacity) || 120,
      });

      onSuccess(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create gym profile.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">Add New Gym Profile</h3>
              <p className="text-xs text-slate-500">
                Setup a new gym location with dedicated login credentials &amp; member registry.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Gym / Studio Name *</label>
              <input
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!code) {
                    setCode(e.target.value.slice(0, 3).toUpperCase() + "-" + Math.floor(10 + Math.random() * 89));
                  }
                }}
                placeholder="e.g. IronCore Crossfit"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Branch Location *</label>
              <input
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Juhu, Mumbai"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Branch Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. IC-JUH"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-mono text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 104 Beach Haven, Juhu Tara Road"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 11223"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Max Member Capacity</label>
              <input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Admin Credentials Block */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-700" />
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Gym Admin Credentials (Login &amp; Password)
              </p>
            </div>
            <p className="text-[11px] text-slate-500">
              Every gym profile has its own secure administrative credentials for tenant isolation.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Admin Username / Email *</label>
                <input
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin_juhu"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Admin Password *</label>
                <input
                  required
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
            >
              + Create Gym Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================================
   2. AUTH & PROFILE SWITCHER MODAL
   ========================================================================= */

interface AuthModalProps {
  open: boolean;
  currentGymId: string;
  currentUser: UserAccount;
  gyms: GymProfile[];
  users: UserAccount[];
  onClose: () => void;
  onUserSelected: (user: UserAccount, targetGymId?: string) => void;
}

export function AuthModal({
  open,
  currentGymId,
  currentUser,
  gyms,
  users,
  onClose,
  onUserSelected,
}: AuthModalProps) {
  const [selectedGymId, setSelectedGymId] = useState(currentGymId);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const found = users.find(
      (u) =>
        (u.username.toLowerCase() === usernameInput.toLowerCase().trim() ||
          u.email.toLowerCase() === usernameInput.toLowerCase().trim()) &&
        u.password === passwordInput.trim()
    );

    if (found) {
      onUserSelected(found, found.gymId || selectedGymId);
      onClose();
    } else {
      setError("Invalid username or password. You can also pick from demo accounts below.");
    }
  };

  const handleQuickSwitch = (targetRole: UserRole) => {
    // Find a user matching this role in this gym (or any gym)
    const matched = users.find((u) => u.gymId === selectedGymId && u.role === targetRole) ||
      users.find((u) => u.role === targetRole);
    if (matched) {
      onUserSelected(matched, selectedGymId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Sign In &amp; Profile Access</h3>
              <p className="text-xs text-slate-500">Authenticate as Gym Admin or Normal User.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Identity Banner */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              {currentUser.role === "admin" ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
              <p className="text-[11px] text-slate-500">
                {currentUser.role === "admin" ? "Admin Profile (Full Access)" : "Normal User Profile (Restricted)"}
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
              currentUser.role === "admin" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
            }`}
          >
            {currentUser.role === "admin" ? "Admin" : "Normal User"}
          </span>
        </div>

        {/* Quick 1-Click Role Switcher (For immediate client testing of Admin vs Normal User views) */}
        <div className="mt-4 space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Fast Profile Switcher (1-Click Test)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSwitch("admin")}
              className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition ${
                currentUser.role === "admin"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              Admin Profile
            </button>

            <button
              type="button"
              onClick={() => handleQuickSwitch("normal_user")}
              className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition ${
                currentUser.role === "normal_user"
                  ? "border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Normal User Profile
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="mt-5 space-y-3.5 border-t border-slate-100 pt-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Sign In with Username &amp; Password
          </p>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Select Gym Profile</label>
            <select
              value={selectedGymId}
              onChange={(e) => setSelectedGymId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
            >
              {gyms.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.branch})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Username or Email</label>
            <input
              required
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="e.g. admin@gymflow.com"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Password</label>
            <input
              required
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 p-2.5 text-xs text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="submit"
              className="rounded-full bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

