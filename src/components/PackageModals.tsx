"use client";

import React, { useState, useEffect } from "react";
import { X, Layers, AlertTriangle } from "lucide-react";
import { GymPackage } from "@/lib/types";
import { gymDataManager } from "@/lib/gymData";

interface PackageModalProps {
  open: boolean;
  gymId: string;
  pkg: GymPackage | null; // null means create new
  onClose: () => void;
  onSuccess: (savedPkg: GymPackage) => void;
}

export function PackageModal({ open, gymId, pkg, onClose, onSuccess }: PackageModalProps) {
  const [name, setName] = useState("");
  const [durationDays, setDurationDays] = useState("90");
  const [price, setPrice] = useState("6499");
  const [maxFreezeDays, setMaxFreezeDays] = useState("10");
  const [description, setDescription] = useState("");
  const [popular, setPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [featuresText, setFeaturesText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pkg) {
      setName(pkg.name);
      setDurationDays(String(pkg.durationDays));
      setPrice(String(pkg.price));
      setMaxFreezeDays(String(pkg.maxFreezeDays));
      setDescription(pkg.description);
      setPopular(Boolean(pkg.popular));
      setIsActive(pkg.isActive ?? true);
      setFeaturesText((pkg.features || []).join("\n"));
    } else {
      setName("");
      setDurationDays("90");
      setPrice("6499");
      setMaxFreezeDays("10");
      setDescription("");
      setPopular(false);
      setIsActive(true);
      setFeaturesText("All floor & cardio zones\n1 Dietician consultation\n10 days freeze pass");
    }
  }, [pkg, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please specify a package name.");
      return;
    }

    const features = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const saved = gymDataManager.savePackage(gymId, {
      id: pkg?.id,
      name: name.trim(),
      durationDays: Number(durationDays),
      price: Number(price),
      maxFreezeDays: Number(maxFreezeDays),
      description: description.trim(),
      popular,
      isActive,
      features,
    });

    onSuccess(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {pkg ? `Edit Package: ${pkg.name}` : "Create Membership Package"}
              </h3>
              <p className="text-xs text-slate-500">Admin-exclusive package and pricing configuration.</p>
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
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Package Title *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Quarterly Transformation"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Price (₹) *</label>
              <input
                required
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Duration (Days) *</label>
              <input
                required
                type="number"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Freeze Cap (Days)</label>
              <input
                type="number"
                min="0"
                value={maxFreezeDays}
                onChange={(e) => setMaxFreezeDays(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Package Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of what this plan includes..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Features &amp; Inclusions (one per line)
            </label>
            <textarea
              rows={3}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder="Gym floor access&#10;Steam & Sauna&#10;1 Trainer Session"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-emerald-600 focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={popular}
                onChange={(e) => setPopular(e.target.checked)}
                className="h-4 w-4 rounded accent-emerald-600"
              />
              Mark as Popular / Best Value
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded accent-emerald-600"
              />
              Active for Signups
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertTriangle className="h-4 w-4" />
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
              {pkg ? "Save Changes" : "+ Create Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

