'use client';

import { useState } from 'react';
import { submitWinnerProof } from '@/lib/storage';
import { Winner } from '@/types';
import { X, Upload, CheckCircle2, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';

interface WinnerProofModalProps {
  winner: Winner;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function WinnerProofModal({
  winner,
  isOpen,
  onClose,
  onSuccess,
}: WinnerProofModalProps) {
  const [imageUrl, setImageUrl] = useState(
    winner.proofImageUrl ||
      'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=800&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setError('Please provide or upload a screenshot image URL of your golf scores.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      submitWinnerProof(winner.id, imageUrl.trim());
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    }, 800);
  };

  // Preset sample screenshot proofs for quick testing
  const sampleScreenshots = [
    {
      label: 'MiScore / Official App Screenshot',
      url: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Handicap Golf Pass & Attested Card',
      url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#121724] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase">
            Winner Verification System (§ 09)
          </span>
          <h3 className="text-xl font-bold text-white mt-1">
            Submit Golf Score Verification Proof
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            You won <strong className="text-emerald-300">${winner.prizeAmount.toLocaleString()}</strong> in {winner.drawName} ({winner.matchType.replace('_', ' ').toUpperCase()}). Please upload a screenshot of your scores from your golf platform.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <div className="text-base font-bold text-white">Score Proof Uploaded!</div>
            <p className="text-xs text-slate-400">
              Your submission is now under admin review. Once approved, payout will be disbursed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Score Screenshot URL / Upload Link
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                placeholder="https://... image url of scorecard"
              />
            </div>

            {/* Image Preview */}
            {imageUrl && (
              <div className="rounded-xl overflow-hidden border border-white/15 bg-black/40 p-2">
                <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-slate-400" />
                  Proof Preview:
                </div>
                <img
                  src={imageUrl}
                  alt="Scorecard Proof"
                  className="w-full h-44 object-cover rounded-lg"
                  onError={() => setError('Invalid image URL. Please enter a valid URL.')}
                />
              </div>
            )}

            {/* Quick Sample Presets */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400">Fast-Test Sample Scorecard Proofs:</span>
              <div className="flex gap-2">
                {sampleScreenshots.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(s.url)}
                    className="text-[11px] px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 transition"
                  >
                    Sample {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl text-[11px] text-slate-400">
              <strong>Admin Review Note:</strong> Digital Heroes administrators verify that the Stableford points and round dates match the numbers entered in the draw.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isSubmitting ? 'Uploading Proof...' : 'Submit Verification Proof to Committee'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
