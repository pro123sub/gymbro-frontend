"use client";

import React, { useEffect, useState } from "react";
import { X, Snowflake, Sun, RefreshCw, Printer, Trash2, CheckCircle2 } from "lucide-react";
import { GstInvoice, MemberRecord, MembershipPlan, gymApi } from "@/lib/api";

const PLAN_DEFAULT_FEES: Record<string, number> = {
  Monthly: 1500,
  Quarterly: 4000,
  "Half-Yearly": 7500,
  Yearly: 13500,
};

function todayIstIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/* -------------------------- 1. Add Member Modal -------------------------- */

export function AddMemberModal({
  open,
  plans,
  onClose,
  onCreated,
}: {
  open: boolean;
  plans: MembershipPlan[];
  onClose: () => void;
  onCreated: (msg: string) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("Male");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [plan, setPlan] = useState<"Monthly" | "Quarterly" | "Half-Yearly" | "Yearly">("Quarterly");
  const [fee, setFee] = useState("4000");
  const [startDate, setStartDate] = useState(todayIstIso());
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Pending">("Paid");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [fitnessGoal, setFitnessGoal] = useState("Strength & Fat Loss");
  const [batchSlot, setBatchSlot] = useState("Morning 7AM");
  const [assignedTrainer, setAssignedTrainer] = useState("Coach Vikram");
  const [syncToN8n, setSyncToN8n] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handlePlanChange(nextPlan: "Monthly" | "Quarterly" | "Half-Yearly" | "Yearly") {
    setPlan(nextPlan);
    const matched = plans.find((p) => p.plan_name === nextPlan);
    setFee(String(matched ? matched.price : PLAN_DEFAULT_FEES[nextPlan] ?? 1500));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await gymApi.createMember({
        name,
        phone,
        email,
        gender,
        date_of_birth: dateOfBirth,
        address,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        plan,
        fee: Number(fee),
        start_date: startDate,
        payment_status: paymentStatus,
        payment_mode: paymentMode,
        fitness_goal: fitnessGoal,
        batch_slot: batchSlot,
        assigned_trainer: assignedTrainer,
        sync_to_n8n: syncToN8n,
      });
      await onCreated(`Registered ${res.member.name} (${res.member.member_id}) — synced to Google Sheets workbook.`);
      setName("");
      setPhone("");
      setEmail("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register member.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Register New Gym Member</h3>
            <p className="text-xs text-slate-500">
              Validates Indian mobile (91XXXXXXXXXX), generates MEM-XXXXXXXX, computes expiry & saves to Google Sheets.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Full Name *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Sharma" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-forest-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Phone Number *</label>
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-forest-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Email (used for automated reminders)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aarav@example.com" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-forest-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-forest-accent focus:outline-none">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Membership Plan *</label>
            <select
              value={plan}
              onChange={(e) => handlePlanChange(e.target.value as "Monthly" | "Quarterly" | "Half-Yearly" | "Yearly")}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-forest-accent focus:outline-none"
            >
              <option value="Monthly">Monthly (30 days)</option>
              <option value="Quarterly">Quarterly (90 days)</option>
              <option value="Half-Yearly">Half-Yearly (180 days)</option>
              <option value="Yearly">Yearly (365 days)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Membership Fee (₹) *</label>
            <input required type="number" min="0" value={fee} onChange={(e) => setFee(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-forest-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Start Date *</label>
            <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-forest-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Payment Status & Mode *</label>
            <div className="flex gap-2">
              <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as "Paid" | "Pending")} className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-forest-accent focus:outline-none">
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
              <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-forest-accent focus:outline-none">
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Razorpay">Razorpay</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Date of Birth</label>
            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-forest-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Assigned Trainer & Batch</label>
            <div className="flex gap-2">
              <input value={assignedTrainer} onChange={(e) => setAssignedTrainer(e.target.value)} placeholder="Trainer" className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-forest-accent focus:outline-none" />
              <input value={batchSlot} onChange={(e) => setBatchSlot(e.target.value)} placeholder="Batch" className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-forest-accent focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Emergency Contact Name</label>
            <input value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} placeholder="Optional" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-forest-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Emergency Contact Phone</label>
            <input value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} placeholder="Optional" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-forest-accent focus:outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-700">Address & Fitness Goal</label>
            <div className="flex gap-2">
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-forest-accent focus:outline-none" />
              <input value={fitnessGoal} onChange={(e) => setFitnessGoal(e.target.value)} placeholder="Fitness Goal" className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-forest-accent focus:outline-none" />
            </div>
          </div>

          <label className="sm:col-span-2 flex items-center gap-2 text-xs text-slate-600">
            <input type="checkbox" checked={syncToN8n} onChange={(e) => setSyncToN8n(e.target.checked)} className="accent-forest-accent" />
            Also trigger n8n GM-01 sync webhook immediately (if configured in backend .env)
          </label>

          {error && <p className="sm:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

          <div className="sm:col-span-2 mt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-lime-neon px-6 py-2 text-sm font-semibold text-forest hover:brightness-95 disabled:opacity-50"
            >
              {saving ? "Registering..." : "+ Register Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------ 2. Member 360° Drawer ------------------------ */

export function Member360Drawer({
  memberId,
  onClose,
  onUpdated,
}: {
  memberId: string | null;
  onClose: () => void;
  onUpdated: (msg: string) => Promise<void> | void;
}) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof gymApi.getMember360>> | null>(null);
  const [trainer, setTrainer] = useState("");
  const [batchSlot, setBatchSlot] = useState("");
  const [freezeDays, setFreezeDays] = useState("5");
  const [renewAmount, setRenewAmount] = useState("4000");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!memberId) return;
    let active = true;
    setLoading(true);
    setError(null);
    gymApi
      .getMember360(memberId)
      .then((res) => {
        if (!active) return;
        setProfile(res);
        setTrainer(res.member.assigned_trainer);
        setBatchSlot(res.member.batch_slot);
        setRenewAmount(String(res.member.fee || 1500));
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load profile");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [memberId]);

  if (!memberId) return null;

  async function refreshSelf() {
    if (!memberId) return;
    const res = await gymApi.getMember360(memberId);
    setProfile(res);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="font-mono text-xs font-semibold text-forest-accent">{memberId}</span>
            <h3 className="text-lg font-bold text-slate-900">{profile?.member.name || "Member 360° Profile"}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading && <p className="mt-6 text-sm text-slate-500">Loading 360° profile...</p>}
        {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

        {profile && (
          <div className="mt-4 space-y-5">
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[#f4f6f5] p-4 text-xs">
              <div>
                <p className="text-slate-500">Status</p>
                <p className="mt-0.5 font-semibold text-slate-900">{profile.member.member_status}</p>
              </div>
              <div>
                <p className="text-slate-500">Plan & Expiry</p>
                <p className="mt-0.5 font-semibold text-slate-900">
                  {profile.member.plan} · {profile.member.expiry_date} ({profile.member.days_remaining}d left)
                </p>
              </div>
              <div>
                <p className="text-slate-500">Phone & Email</p>
                <p className="mt-0.5 font-semibold text-slate-900">{profile.member.phone}</p>
                <p className="text-slate-500">{profile.member.email || "No email"}</p>
              </div>
              <div>
                <p className="text-slate-500">Workout Streak & Payment</p>
                <p className="mt-0.5 font-semibold text-slate-900">
                  {profile.member.current_streak}d streak · {profile.member.payment_status}
                </p>
              </div>
            </div>

            {/* Quick Lifecycle Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const r = await gymApi.checkInMember({ member_id: profile.member.member_id, workout_type: "Gym Floor" });
                    await refreshSelf();
                    await onUpdated(`Checked in ${r.member_name} (${r.current_streak}d streak)`);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Check-in failed");
                  }
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-lime-neon px-4 py-2 text-xs font-semibold text-forest hover:brightness-95"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Check In Today
              </button>

              {profile.member.member_status === "Frozen" ? (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const r = await gymApi.unfreezeMember(profile.member.member_id);
                      await refreshSelf();
                      await onUpdated(`Unfroze member (reclaimed ${r.reclaimed_freeze_days} unused days). New expiry: ${r.new_expiry}`);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Unfreeze failed");
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-forest-accent"
                >
                  <Sun className="h-3.5 w-3.5" /> Early Unfreeze
                </button>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={freezeDays}
                    onChange={(e) => setFreezeDays(e.target.value)}
                    className="w-16 rounded-full border border-slate-200 px-3 py-1.5 text-center text-xs"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const r = await gymApi.freezeMember(profile.member.member_id, Number(freezeDays), "Admin Freeze");
                        await refreshSelf();
                        await onUpdated(`Frozen until ${r.frozen_until}. Expiry extended to ${r.new_expiry}`);
                      } catch (e) {
                        setError(e instanceof Error ? e.message : "Freeze failed");
                      }
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Snowflake className="h-3.5 w-3.5" /> Freeze Days
                  </button>
                </div>
              )}
            </div>

            {/* Renew & Update Profile */}
            <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Update Trainer / Batch & Quick Renew</p>
              <div className="flex gap-2">
                <input value={trainer} onChange={(e) => setTrainer(e.target.value)} placeholder="Trainer" className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs" />
                <input value={batchSlot} onChange={(e) => setBatchSlot(e.target.value)} placeholder="Batch Slot" className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs" />
                <button
                  type="button"
                  onClick={async () => {
                    await gymApi.updateMember(profile.member.member_id, { assigned_trainer: trainer, batch_slot: batchSlot });
                    await refreshSelf();
                    await onUpdated("Updated trainer & batch slot.");
                  }}
                  className="rounded-full bg-forest px-3.5 py-1.5 text-xs font-semibold text-white"
                >
                  Save
                </button>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input type="number" value={renewAmount} onChange={(e) => setRenewAmount(e.target.value)} className="w-28 rounded-xl border border-slate-200 px-3 py-1.5 text-xs" />
                <button
                  type="button"
                  onClick={async () => {
                    const r = await gymApi.renewMember(profile.member.member_id, {
                      plan: profile.member.plan,
                      amount_paid: Number(renewAmount),
                      payment_mode: "UPI",
                      sync_to_n8n: false,
                    });
                    await refreshSelf();
                    await onUpdated(`Renewed ${r.member.name} until ${r.member.expiry_date}`);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#eef7e6] px-4 py-1.5 text-xs font-semibold text-forest-accent"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Renew / Settle Dues
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await gymApi.deleteMember(profile.member.member_id, false);
                    await onUpdated(`Archived ${profile.member.name} (Cancelled).`);
                    onClose();
                  }}
                  className="ml-auto inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Archive
                </button>
              </div>
            </div>

            {/* 18-column Google Sheets Projection */}
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                18-Column Google Sheets Row Projection
              </p>
              <pre className="max-h-48 overflow-auto rounded-xl bg-slate-950 p-3 text-[11px] text-emerald-300">
                {JSON.stringify(profile.google_sheets_row, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------ 3. Plan Modal ------------------------ */

export function PlanModal({
  open,
  editingPlan,
  onClose,
  onSaved,
}: {
  open: boolean;
  editingPlan: MembershipPlan | null;
  onClose: () => void;
  onSaved: (msg: string) => Promise<void> | void;
}) {
  const [planName, setPlanName] = useState("");
  const [durationDays, setDurationDays] = useState("45");
  const [price, setPrice] = useState("2500");
  const [maxFreezeDays, setMaxFreezeDays] = useState("3");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingPlan) {
      setPlanName(editingPlan.plan_name);
      setDurationDays(String(editingPlan.duration_days));
      setPrice(String(editingPlan.price));
      setMaxFreezeDays(String(editingPlan.max_freeze_days));
      setDescription(editingPlan.description);
    } else {
      setPlanName("");
      setDurationDays("45");
      setPrice("2500");
      setMaxFreezeDays("3");
      setDescription("");
    }
  }, [editingPlan, open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPlan) {
        await gymApi.updatePlan(editingPlan.plan_id, {
          duration_days: Number(durationDays),
          price: Number(price),
          max_freeze_days: Number(maxFreezeDays),
          description,
        });
        await onSaved(`Updated package "${editingPlan.plan_name}".`);
      } else {
        await gymApi.createPlan({
          plan_name: planName,
          duration_days: Number(durationDays),
          price: Number(price),
          max_freeze_days: Number(maxFreezeDays),
          description,
        });
        await onSaved(`Created new package "${planName}".`);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            {editingPlan ? `Edit Package: ${editingPlan.plan_name}` : "Create Membership Package"}
          </h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3">
          {!editingPlan && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Package Name</label>
              <input required value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="Transformation 45" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Price (₹)</label>
              <input required type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Days</label>
              <input required type="number" min="1" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Freeze Cap</label>
              <input required type="number" min="0" value={maxFreezeDays} onChange={(e) => setMaxFreezeDays(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Description</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-full bg-lime-neon px-5 py-2 text-xs font-semibold text-forest">
              {saving ? "Saving..." : editingPlan ? "Save Changes" : "Create Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------ 4. GST Invoice Modal ------------------------ */

export function GstInvoiceModal({ invoice, onClose }: { invoice: GstInvoice | null; onClose: () => void }) {
  if (!invoice) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-forest-accent">Tax Invoice (GST)</p>
            <h3 className="text-lg font-bold text-slate-900">{invoice.studio.name}</h3>
            <p className="text-xs text-slate-500">
              GSTIN: {invoice.studio.gstin} · SAC: {invoice.studio.sac_code} · {invoice.studio.branch}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-slate-500">Billed To</p>
            <p className="font-semibold text-slate-900">{invoice.billed_to.name}</p>
            <p className="text-slate-600">{invoice.billed_to.member_id} · {invoice.billed_to.phone}</p>
            <p className="text-slate-500">{invoice.billed_to.email}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500">Invoice #</p>
            <p className="font-mono font-semibold text-slate-900">{invoice.invoice_number}</p>
            <p className="text-slate-500">Date: {invoice.invoice_date}</p>
            <p className="text-slate-500">Status: {invoice.status}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 p-4 text-xs space-y-2">
          <div className="flex justify-between font-medium text-slate-800">
            <span>{invoice.plan} Membership ({invoice.billing_period.from} → {invoice.billing_period.to})</span>
            <span>₹{invoice.taxable_value.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>CGST ({invoice.cgst_rate_pct}%)</span>
            <span>₹{invoice.cgst_amount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>SGST ({invoice.sgst_rate_pct}%)</span>
            <span>₹{invoice.sgst_amount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
            <span>Total Paid ({invoice.payment_mode})</span>
            <span>₹{invoice.total_amount_paid.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white">
            <Printer className="h-3.5 w-3.5" /> Print Invoice
          </button>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
