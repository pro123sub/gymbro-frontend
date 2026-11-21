"use client";

import React, { useState } from "react";
import { X, Trophy, AlertCircle } from "lucide-react";
import { CommunityPost } from "@/lib/types";

interface CommunityModalProps {
  open: boolean;
  authorName: string;
  authorRole: "member" | "trainer" | "admin";
  onClose: () => void;
  onSubmit: (post: {
    title: string;
    category: CommunityPost["category"];
    content: string;
    metric_badge?: string;
  }) => void;
}

export function ShareAchievementModal({
  open,
  authorName,
  authorRole,
  onClose,
  onSubmit,
}: CommunityModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CommunityPost["category"]>("Personal Record");
  const [metricBadge, setMetricBadge] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Please fill in both the achievement headline and description.");
      return;
    }

    onSubmit({
      title: title.trim(),
      category,
      metric_badge: metricBadge.trim() || undefined,
      content: content.trim(),
    });

    setTitle("");
    setMetricBadge("");
    setContent("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Post Achievement</h3>
              <p className="text-xs text-slate-500">
                Celebrate fitness milestones, PRs, and consistency with your gym community!
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
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Headline *</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hit a 140kg Deadlift PR today! 🏋️‍♂️"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CommunityPost["category"])}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
              >
                <option value="Personal Record">Personal Record</option>
                <option value="Streak Milestone">Streak Milestone</option>
                <option value="Weight Goal">Weight Goal</option>
                <option value="Transformation">Transformation</option>
                <option value="Community Event">Community Event</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Metric Badge (Optional)
              </label>
              <input
                value={metricBadge}
                onChange={(e) => setMetricBadge(e.target.value)}
                placeholder="e.g. 140 kg PR or 30-Day Streak"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Description / Story *</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share how you achieved this, training tips, who helped spot or coach you..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
            <span>Posting as:</span>
            <strong className="text-slate-900">{authorName}</strong>
            <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-700">
              {authorRole}
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
            >
              Post to Community
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

