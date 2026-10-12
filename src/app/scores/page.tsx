'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GolfScore } from '@/types';
import { addGolfScore, updateGolfScore, deleteGolfScore, getUserGolfScores } from '@/lib/storage';
import {
  Target,
  Plus,
  Calendar,
  MapPin,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Award,
  Sparkles,
  RefreshCw,
  X,
} from 'lucide-react';

export default function MyScoresPage() {
  const { user } = useAuth();
  const [scores, setScores] = useState<GolfScore[]>(() => {
    return typeof window !== 'undefined' && user?.id ? getUserGolfScores(user.id) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [courseInput, setCourseInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchScores = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = user?.id ? `/api/scores?userId=${encodeURIComponent(user.id)}` : '/api/scores';
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.scores) && data.scores.length > 0) {
        setScores(data.scores);
      } else if (user?.id) {
        const localScores = getUserGolfScores(user.id);
        setScores(localScores);
      } else {
        setScores([]);
      }
    } catch {
      if (user?.id) {
        setScores(getUserGolfScores(user.id));
      } else {
        setError('Failed to load golf scores. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchScores();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleOpenAdd = () => {
    setEditingScoreId(null);
    setScoreInput('');
    setDateInput(new Date().toISOString().split('T')[0]);
    setCourseInput('Local Course');
    setNotesInput('');
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (s: GolfScore) => {
    setEditingScoreId(s.id);
    setScoreInput(s.score.toString());
    setDateInput(s.date);
    setCourseInput(s.courseName || '');
    setNotesInput(s.notes || '');
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const scoreNum = parseInt(scoreInput, 10);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      setError('Stableford score must be an integer between 1 and 45.');
      return;
    }

    if (!dateInput) {
      setError('A valid date is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = '/api/scores';
      const method = editingScoreId ? 'PUT' : 'POST';
      const body = {
        scoreId: editingScoreId,
        score: scoreNum,
        date: dateInput,
        courseName: courseInput || 'Local Course',
        notes: notesInput || '',
        userId: user?.id,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Error saving score entry.');
        setIsSubmitting(false);
        return;
      }

      if (user?.id) {
        if (editingScoreId) {
          updateGolfScore(editingScoreId, scoreNum, dateInput, courseInput || 'Local Course', notesInput || '');
        } else {
          addGolfScore(user.id, scoreNum, dateInput, courseInput || 'Local Course', notesInput || '');
        }
        window.dispatchEvent(new Event('dh-storage-update'));
      }

      setSuccessMessage(editingScoreId ? 'Score updated successfully!' : 'Score round logged successfully!');
      setModalOpen(false);
      fetchScores();
    } catch {
      setError('Network error saving score.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (scoreId: string) => {
    if (!confirm('Are you sure you want to delete this golf round?')) return;
    setError(null);
    setSuccessMessage(null);

    try {
      const url = user?.id
        ? `/api/scores?id=${scoreId}&userId=${encodeURIComponent(user.id)}`
        : `/api/scores?id=${scoreId}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        if (user?.id) {
          deleteGolfScore(scoreId);
          window.dispatchEvent(new Event('dh-storage-update'));
        }
        setSuccessMessage('Score deleted.');
        fetchScores();
      } else {
        setError(data.message || 'Error deleting score.');
      }
    } catch {
      setError('Network error deleting score.');
    }
  };

  // Calculations
  const scoreNums = scores.map((s) => s.score);
  const averageScore = scoreNums.length > 0 ? (scoreNums.reduce((a, b) => a + b, 0) / scoreNums.length).toFixed(1) : '0';
  const peakScore = scoreNums.length > 0 ? Math.max(...scoreNums) : 0;
  const isFullyQualified = scores.length >= 5;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121824] border border-[#D4AF37]/30 text-[#F5E6AB] text-xs font-semibold mb-2 uppercase tracking-wider">
            <Target className="w-3.5 h-3.5 text-[#D4AF37]" />
            STABLEFORD GOLF SCORE LOG BOOK
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">My Golf Scores</h1>
          <p className="text-xs sm:text-sm text-slate-400 font-light mt-1">
            Log your rolling 5 official Stableford scores (1–45) to maintain monthly draw eligibility.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 btn-gold-primary text-slate-950 font-bold rounded-2xl text-xs transition shadow-xl flex items-center gap-2 self-start md:self-auto uppercase tracking-wider"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Log New Round</span>
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-[#D4AF37]/15 border border-[#D4AF37]/40 rounded-2xl text-[#F5E6AB] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Qualification Status */}
        <div className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">DRAW ELIGIBILITY</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-serif font-bold text-white">{scores.length} / 5 Rounds</span>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                isFullyQualified ? 'bg-[#D4AF37]/20 text-[#F5E6AB] border border-[#D4AF37]/40' : 'bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              {isFullyQualified ? 'Full Entry Ready' : `${5 - scores.length} More Needed`}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-light">Requires 5 valid rolling scores & active subscription.</p>
        </div>

        {/* Average Score */}
        <div className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">5-ROUND AVERAGE</span>
          <div className="text-2xl font-serif font-bold gold-text mt-1">{averageScore} pts</div>
          <p className="text-[11px] text-slate-400 font-light">Calculated across your rolling 5 entries.</p>
        </div>

        {/* Peak Score */}
        <div className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SEASON PEAK SCORE</span>
          <div className="text-2xl font-serif font-bold text-[#F5E6AB] mt-1">{peakScore > 0 ? `${peakScore} pts` : 'N/A'}</div>
          <p className="text-[11px] text-slate-400 font-light">Highest Stableford round logged.</p>
        </div>
      </div>

      {/* Scores Table / List */}
      <div className="glass-panel p-6 rounded-3xl border border-[#D4AF37]/30 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-[#D4AF37]" />
            Active 5-Round Scorecard (Most Recent First)
          </h3>
          <button onClick={fetchScores} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
            ))}
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center mx-auto text-2xl font-serif">
              ⛳
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-serif font-bold text-white">No Golf Scores Logged Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-light">
                Start logging your 18-hole Stableford scores (1–45) to build your rolling 5 score entry for the monthly draw.
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="px-6 py-3 btn-gold-primary text-slate-950 font-bold text-xs rounded-xl transition uppercase tracking-wider"
            >
              Log Your First Round
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {scores.map((s, idx) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-[#05070A] border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#121824] border border-[#D4AF37]/40 flex items-center justify-center font-bold font-mono text-xl text-[#F5E6AB] shrink-0">
                    {s.score}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-white text-sm">{s.courseName || 'Local Course'}</span>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#F5E6AB] text-[9px] font-bold border border-[#D4AF37]/40 uppercase tracking-wider">
                          Latest
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {s.date}
                      </span>
                      {s.notes && <span className="italic text-slate-400 truncate max-w-xs font-sans">&quot;{s.notes}&quot;</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition text-xs flex items-center gap-1"
                    title="Edit round"
                  >
                    <Edit2 className="w-4 h-4 text-[#D4AF37]" />
                  </button>

                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition text-xs"
                    title="Delete round"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#121724] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 text-xs text-slate-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-[#D4AF37]" />
                {editingScoreId ? 'Edit Golf Round' : 'Log New Stableford Round'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Stableford Score (1–45) *</label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  placeholder="e.g. 38"
                  required
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-sm text-white font-bold focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Round Date *</label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Golf Course / Club Name</label>
                <input
                  type="text"
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  placeholder="e.g. Royal Melbourne"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Windy day, great putting"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/15 rounded-xl font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 btn-gold-primary text-slate-950 font-bold rounded-xl shadow-lg uppercase tracking-wider"
                >
                  {isSubmitting ? 'Saving...' : editingScoreId ? 'Update Round' : 'Save Round'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

