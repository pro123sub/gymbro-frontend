"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Lock,
  MessageCircle,
  CheckCircle2,
  Save,
  Trash2,
  Flame,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { MemberProfile, GymPackage, MemberRole, MemberStatus, PaymentStatus } from "@/lib/types";
import { gymDataManager } from "@/lib/gymData";

/* =========================================================================
   1. ADD MEMBER / TRAINER MODAL
   ========================================================================= */

interface AddMemberModalProps {
  open: boolean;
  gymId: string;
  packages: GymPackage[];
  onClose: () => void;
  onSuccess: (newMember: MemberProfile) => void;
}

export function AddMemberModal({ open, gymId, packages, onClose, onSuccess }: AddMemberModalProps) {
  const [role, setRole] = useState<MemberRole>("member");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<MemberProfile["gender"]>("Male");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Subscription state
  const [hasSubscription, setHasSubscription] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState(packages[0]?.id || "");
  const [fee, setFee] = useState(String(packages[0]?.price || 2499));
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Paid");

  // Gym details
  const [fitnessGoal, setFitnessGoal] = useState("Strength & Fitness");
  const [batchSlot, setBatchSlot] = useState("Morning 7:00 AM");
  const [assignedTrainer, setAssignedTrainer] = useState("Coach Vikram Rathi");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState<string | null>(null);

  // When role changes, adjust subscription default
  useEffect(() => {
    if (role === "trainer") {
      setHasSubscription(false); // Optional for trainer
      setPaymentStatus("Waived");
    } else {
      setHasSubscription(true); // Mandatory for normal member
      setPaymentStatus("Paid");
    }
  }, [role]);

  // When packages load or change
  useEffect(() => {
    if (packages.length > 0 && !selectedPlanId) {
      setSelectedPlanId(packages[0].id);
      setFee(String(packages[0].price));
    }
  }, [packages, selectedPlanId]);

  if (!open) return null;

  const handlePlanSelect = (pkgId: string) => {
    setSelectedPlanId(pkgId);
    const matched = packages.find((p) => p.id === pkgId);
    if (matched) {
      setFee(String(matched.price));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter the full name.");
      return;
    }
    if (!phone.trim()) {
      setError("Please provide a contact phone number.");
      return;
    }

    // Role check: Normal members MUST have a subscription
    if (role === "member" && !hasSubscription) {
      setError("A normal member must have an active membership subscription to be part of the gym.");
      return;
    }

    let planName = "";
    let expiryDate = "";
    const selectedPkg = packages.find((p) => p.id === selectedPlanId);

    if (hasSubscription && selectedPkg) {
      planName = selectedPkg.name;
      const sDate = new Date(startDate);
      sDate.setDate(sDate.getDate() + selectedPkg.durationDays);
      expiryDate = sDate.toISOString().split("T")[0];
    }

    try {
      const created = gymDataManager.createMember(gymId, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        role,
        gender,
        date_of_birth: dateOfBirth,
        address: address.trim(),
        emergency_contact_name: emergencyName.trim(),
        emergency_contact_phone: emergencyPhone.trim(),
        has_subscription: hasSubscription,
        plan_id: hasSubscription ? selectedPlanId : undefined,
        plan_name: hasSubscription ? planName : undefined,
        fee: hasSubscription ? Number(fee) : 0,
        start_date: hasSubscription ? startDate : undefined,
        expiry_date: hasSubscription ? expiryDate : undefined,
        payment_status: hasSubscription ? paymentStatus : "Waived",
        member_status: "Active",
        fitness_goal: fitnessGoal.trim(),
        batch_slot: batchSlot,
        assigned_trainer: assignedTrainer.trim(),
        notes: notes.trim(),
      });

      onSuccess(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register member.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                NEW REGISTRATION
              </span>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">Add Gym User</h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Register a new gym member or trainer with role permissions and package assignment.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Role Selection */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Account Role *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("member")}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                  role === "member"
                    ? "border-emerald-600 bg-white text-slate-900 shadow-sm ring-1 ring-emerald-600"
                    : "border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-bold">Gym Member</span>
                  {role === "member" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Standard member. Subscription package is mandatory.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole("trainer")}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                  role === "trainer"
                    ? "border-emerald-600 bg-white text-slate-900 shadow-sm ring-1 ring-emerald-600"
                    : "border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-bold">Gym Trainer / Staff</span>
                  {role === "trainer" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Trainer account. Taking a paid subscription is optional.
                </p>
              </button>
            </div>
          </div>

          {/* Personal Details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Full Name *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikram Malhotra"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Phone Number *</label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vikram@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as MemberProfile["gender"])}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Batch Slot</label>
              <select
                value={batchSlot}
                onChange={(e) => setBatchSlot(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="Morning 6:00 AM">Morning 6:00 AM</option>
                <option value="Morning 7:00 AM">Morning 7:00 AM</option>
                <option value="Morning 8:30 AM">Morning 8:30 AM</option>
                <option value="Evening 5:30 PM">Evening 5:30 PM</option>
                <option value="Evening 7:00 PM">Evening 7:00 PM</option>
                <option value="Flexible / All-Day">Flexible / All-Day</option>
              </select>
            </div>
          </div>

          {/* Membership Subscription Block */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Membership &amp; Subscription
                </p>
                <p className="text-[11px] text-slate-500">
                  {role === "trainer"
                    ? "Trainers can optionally enroll in a paid membership plan or be waived."
                    : "Normal members must enroll in a valid membership package."}
                </p>
              </div>

              {role === "trainer" && (
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSubscription}
                    onChange={(e) => setHasSubscription(e.target.checked)}
                    className="h-4 w-4 rounded accent-emerald-600"
                  />
                  Take Paid Subscription
                </label>
              )}
            </div>

            {hasSubscription ? (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Select Membership Package *
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => handlePlanSelect(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} — ₹{pkg.price.toLocaleString("en-IN")} ({pkg.durationDays} days)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Fee (₹)</label>
                  <input
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Waived">Waived / Staff</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-white/60 p-3 text-xs text-slate-500">
                Staff / Trainer exemption active: No subscription required. Access to floor granted as trainer.
              </div>
            )}
          </div>

          {/* Additional details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Assigned Trainer</label>
              <input
                value={assignedTrainer}
                onChange={(e) => setAssignedTrainer(e.target.value)}
                placeholder="Coach Vikram Rathi"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Fitness Goal</label>
              <input
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
                placeholder="Muscle Building, Fat Loss, Endurance"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Emergency Contact Name</label>
              <input
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Emergency Contact Phone</label>
              <input
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Address / City</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 402 Palm Grove, Bandra West"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
            >
              + Register {role === "trainer" ? "Trainer" : "Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================================
   2. MEMBER PROFILE DRAWER (ALL FIELDS EDITABLE EXCEPT MEMBER ID)
   ========================================================================= */

interface MemberProfileDrawerProps {
  member: MemberProfile | null;
  gymName: string;
  packages: GymPackage[];
  onClose: () => void;
  onUpdated: (updatedMember: MemberProfile) => void;
  onDeleted: (memberId: string) => void;
  onCheckin: (memberId: string) => void;
}

export function MemberProfileDrawer({
  member,
  gymName,
  packages,
  onClose,
  onUpdated,
  onDeleted,
  onCheckin,
}: MemberProfileDrawerProps) {
  const [formData, setFormData] = useState<MemberProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({ ...member });
    }
  }, [member]);

  if (!member || !formData) return null;

  const handleChange = (field: keyof MemberProfile, value: unknown) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handlePlanChange = (planId: string) => {
    const matched = packages.find((p) => p.id === planId);
    if (matched && formData) {
      const sDate = new Date(formData.start_date || new Date());
      sDate.setDate(sDate.getDate() + matched.durationDays);
      setFormData({
        ...formData,
        plan_id: matched.id,
        plan_name: matched.name,
        fee: matched.price,
        expiry_date: sDate.toISOString().split("T")[0],
      });
    }
  };

  const handleSave = () => {
    if (!formData) return;
    setSaving(true);
    try {
      // Updates in local storage
      const updated = gymDataManager.updateMember(member.gymId, member.member_id, formData);
      onUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const waUrl = gymDataManager.generateWhatsAppReminderUrl(formData, gymName);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 font-extrabold text-base">
              {formData.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{formData.name}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                    formData.role === "trainer"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {formData.role}
                </span>
              </div>
              <p className="flex items-center gap-1 font-mono text-xs font-semibold text-slate-400">
                <Lock className="h-3 w-3 text-slate-400" />
                {formData.member_id} (Locked ID)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Status & Quick Action Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Status:</span>
              <select
                value={formData.member_status}
                onChange={(e) => handleChange("member_status", e.target.value as MemberStatus)}
                className={`rounded-full px-3 py-1 text-xs font-bold border focus:outline-none ${
                  formData.member_status === "Active"
                    ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                    : formData.member_status === "Expired"
                    ? "border-red-300 bg-red-100 text-red-800"
                    : formData.member_status === "Pending"
                    ? "border-amber-300 bg-amber-100 text-amber-800"
                    : "border-slate-300 bg-slate-200 text-slate-700"
                }`}
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Pending">Pending</option>
                <option value="Frozen">Frozen</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {/* WhatsApp Reminder Button */}
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:brightness-105 transition"
              >
                <MessageCircle className="h-3.5 w-3.5 fill-current" />
                WhatsApp Reminder
              </a>

              {/* 1-click Checkin */}
              <button
                type="button"
                onClick={() => onCheckin(formData.member_id)}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Check In
              </button>
            </div>
          </div>

          {/* Streak & Consistency Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-3 text-center">
              <p className="flex items-center justify-center gap-1 text-[11px] font-bold text-orange-700">
                <Flame className="h-3.5 w-3.5" /> STREAK
              </p>
              <p className="mt-1 text-2xl font-extrabold text-orange-900">{formData.current_streak} Days</p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 text-center">
              <p className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-700">
                <Activity className="h-3.5 w-3.5" /> CHECK-INS
              </p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-900">{formData.total_checkins}</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center">
              <p className="text-[11px] font-bold text-slate-500">PAYMENT</p>
              <select
                value={formData.payment_status}
                onChange={(e) => handleChange("payment_status", e.target.value as PaymentStatus)}
                className="mt-1 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-800"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Waived">Waived</option>
              </select>
            </div>
          </div>

          {/* Editable Fields Section */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Personal Information (Editable)
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Full Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Phone</label>
                <input
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Email</label>
                <input
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Account Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value as MemberRole)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                >
                  <option value="member">Member</option>
                  <option value="trainer">Trainer</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value as MemberProfile["gender"])}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Date of Birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleChange("date_of_birth", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-600">Address</label>
                <input
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Membership Subscription Block */}
          <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Membership Details &amp; Validity
              </p>
              {formData.role === "trainer" && (
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_subscription}
                    onChange={(e) => handleChange("has_subscription", e.target.checked)}
                    className="accent-emerald-600"
                  />
                  Has Subscription
                </label>
              )}
            </div>

            {formData.has_subscription ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Package</label>
                  <select
                    value={formData.plan_id || ""}
                    onChange={(e) => handlePlanChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} — ₹{pkg.price.toLocaleString("en-IN")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date || ""}
                    onChange={(e) => handleChange("start_date", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiry_date || ""}
                    onChange={(e) => handleChange("expiry_date", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Fee Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.fee || 0}
                    onChange={(e) => handleChange("fee", Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Payment Status</label>
                  <select
                    value={formData.payment_status}
                    onChange={(e) => handleChange("payment_status", e.target.value as PaymentStatus)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Waived">Waived</option>
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Trainer is on staff without an active paid subscription requirement.
              </p>
            )}
          </div>

          {/* Operational Details */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Training &amp; Emergency Contacts
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Assigned Trainer</label>
                <input
                  value={formData.assigned_trainer || ""}
                  onChange={(e) => handleChange("assigned_trainer", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Batch Slot</label>
                <input
                  value={formData.batch_slot || ""}
                  onChange={(e) => handleChange("batch_slot", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Fitness Goal</label>
                <input
                  value={formData.fitness_goal || ""}
                  onChange={(e) => handleChange("fitness_goal", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Emergency Phone</label>
                <input
                  value={formData.emergency_contact_phone || ""}
                  onChange={(e) => handleChange("emergency_contact_phone", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-600">Coach Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes || ""}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${formData.name}?`)) {
                gymDataManager.deleteMember(member.gymId, member.member_id);
                onDeleted(member.member_id);
                onClose();
              }
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Saved!
              </span>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save Profile Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

