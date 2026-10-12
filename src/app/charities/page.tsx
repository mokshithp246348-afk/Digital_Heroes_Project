'use client';

import { useState, useEffect } from 'react';
import { getCharities } from '@/lib/storage';
import { Charity, CharityEvent } from '@/types';
import DirectDonationModal from '@/components/charity/DirectDonationModal';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import {
  Heart,
  Search,
  Filter,
  Calendar,
  MapPin,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  X,
  Users,
  Trophy,
} from 'lucide-react';

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>(() =>
    typeof window !== 'undefined' ? getCharities() : []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCharityForModal, setSelectedCharityForModal] = useState<Charity | null>(null);

  // Modals
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [donationCharityId, setDonationCharityId] = useState<string | undefined>();
  const [subModalOpen, setSubModalOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setCharities(getCharities());
    refresh();
    window.addEventListener('dh-storage-update', refresh);
    return () => window.removeEventListener('dh-storage-update', refresh);
  }, []);

  const categories = [
    'All',
    'Youth & Children',
    'Veterans & Heroes',
    'Environment',
    'Health & Medical',
    'Community Impact',
  ];

  const filteredCharities = charities.filter((c) => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenDonate = (charityId: string) => {
    setDonationCharityId(charityId);
    setDonationModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-bold tracking-widest text-rose-400 uppercase">
          § 08 · Charity Directory & Discovery
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          Where Every Swing Creates Real-World Impact
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          Explore our vetted partner charities. Every Digital Heroes subscriber directs at least 10% of their subscription directly to the organization of their choice, with options for direct tax-deductible giving.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search charities by mission, name, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-white/10 rounded-2xl text-sm focus:outline-none focus:border-rose-500 text-white"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Charity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCharities.map((charity) => (
          <div
            key={charity.id}
            className="glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-52 w-full overflow-hidden">
                <img
                  src={charity.imageUrl}
                  alt={charity.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">
                  {charity.category}
                </span>
                {charity.isSpotlight && (
                  <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Featured
                  </span>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition">
                    {charity.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {charity.tagline}
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-white/5 rounded-2xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Raised</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      ${charity.totalRaised.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Supporters</span>
                    <span className="font-bold text-white text-sm">
                      {charity.supporterCount} Golfers
                    </span>
                  </div>
                </div>

                {/* Upcoming Events Preview */}
                {charity.upcomingEvents.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Next Charity Golf Day:
                    </span>
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                      <div className="font-semibold text-white truncate text-[11px]">
                        {charity.upcomingEvents[0].title}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-orange-400" />
                        {charity.upcomingEvents[0].date} · {charity.upcomingEvents[0].location}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 space-y-2">
              <button
                onClick={() => setSelectedCharityForModal(charity)}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5"
              >
                <span>View Full Profile & Events</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOpenDonate(charity.id)}
                  className="py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs transition flex items-center justify-center gap-1"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-400" />
                  Direct Donate
                </button>
                <button
                  onClick={() => setSubModalOpen(true)}
                  className="py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition shadow-md shadow-orange-500/20"
                >
                  Pledge & Play
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCharities.length === 0 && (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <p className="text-slate-300 text-sm">No charities match your search query.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-white"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* DETAIL PROFILE MODAL (§ 08.2) */}
      {selectedCharityForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#121724] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedCharityForModal(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with image */}
            <div className="relative h-60 w-full rounded-2xl overflow-hidden -mt-2">
              <img
                src={selectedCharityForModal.imageUrl}
                alt={selectedCharityForModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121724] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  {selectedCharityForModal.category}
                </span>
                <h2 className="text-2xl font-extrabold text-white mt-1">
                  {selectedCharityForModal.name}
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Our Mission & Story
                </h4>
                <p className="text-sm text-slate-200 mt-1 leading-relaxed">
                  {selectedCharityForModal.description}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" /> Verified Impact Metric
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedCharityForModal.impactStory}
                </p>
              </div>

              {/* Upcoming Events List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  Upcoming Charity Golf Days & Galas (§ 08.2)
                </h4>
                {selectedCharityForModal.upcomingEvents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCharityForModal.upcomingEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <h5 className="text-sm font-bold text-white">{evt.title}</h5>
                          {evt.ticketPrice && (
                            <span className="text-xs font-bold text-amber-400">
                              ${evt.ticketPrice} / Player
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {evt.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {evt.location}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{evt.description}</p>
                        {evt.spotsLeft && (
                          <div className="text-[10px] text-emerald-400 font-semibold">
                            Only {evt.spotsLeft} spots remaining for this charity flight.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No upcoming events scheduled right now.</p>
                )}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setSelectedCharityForModal(null);
                  handleOpenDonate(selectedCharityForModal.id);
                }}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
              >
                <Heart className="w-4 h-4 fill-white" />
                Direct Donate to {selectedCharityForModal.name}
              </button>
              <button
                onClick={() => {
                  setSelectedCharityForModal(null);
                  setSubModalOpen(true);
                }}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-orange-500/20"
              >
                Select as My Golf Draw Charity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <DirectDonationModal
        isOpen={donationModalOpen}
        onClose={() => {
          setDonationModalOpen(false);
          setDonationCharityId(undefined);
        }}
        defaultCharityId={donationCharityId}
      />

      <SubscriptionModal isOpen={subModalOpen} onClose={() => setSubModalOpen(false)} />
    </div>
  );
}
