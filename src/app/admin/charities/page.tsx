'use client';

import { useState, useEffect } from 'react';
import { getCharities, addCharity, updateCharity, deleteCharity, addAuditLog } from '@/lib/storage';
import { Charity } from '@/types';
import {
  Heart,
  Plus,
  Search,
  Star,
  Globe,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  DollarSign,
  Users,
  ShieldAlert,
} from 'lucide-react';

export default function AdminCharitiesPage() {
  const [charitiesList, setCharitiesList] = useState<Charity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Charity['category']>('Youth & Children');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [taxId, setTaxId] = useState('');
  const [targetGoal, setTargetGoal] = useState<number>(50000);
  const [isSpotlight, setIsSpotlight] = useState(false);

  const loadData = () => {
    setCharitiesList(getCharities());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dh-storage-update', loadData);
    return () => window.removeEventListener('dh-storage-update', loadData);
  }, []);

  const openAddModal = () => {
    setEditingCharity(null);
    setName('');
    setCategory('Youth & Children');
    setDescription('');
    setWebsiteUrl('https://');
    setLogoUrl('https://images.unsplash.com/photo-1594704828604-5f50244791e8?w=800&q=80');
    setTaxId('501(c)(3) TAX-884920');
    setTargetGoal(50000);
    setIsSpotlight(false);
    setShowAddModal(true);
  };

  const openEditModal = (c: Charity) => {
    setEditingCharity(c);
    setName(c.name);
    setCategory(c.category);
    setDescription(c.description);
    setWebsiteUrl(c.websiteUrl || 'https://');
    setLogoUrl(c.logoUrl || '');
    setTaxId(c.taxId || '');
    setTargetGoal(c.targetGoal || 50000);
    setIsSpotlight(!!c.isSpotlight);
    setShowAddModal(true);
  };

  const handleSaveCharity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;

    if (editingCharity) {
      const updated: Charity = {
        ...editingCharity,
        name,
        category,
        description,
        websiteUrl,
        logoUrl,
        taxId,
        targetGoal,
        isSpotlight,
      };
      updateCharity(updated);
      addAuditLog(`Updated Charity Details: ${name}`, 'CHARITY', editingCharity.id);
    } else {
      const newChar = addCharity({
        name,
        tagline: name,
        category,
        description,
        impactStory: description,
        websiteUrl,
        imageUrl: logoUrl,
        logoUrl,
        taxId,
        targetGoal,
        isSpotlight,
        upcomingEvents: [],
      });
      addAuditLog(`Added New Charity Partner: ${name}`, 'CHARITY', newChar.id);
    }

    setShowAddModal(false);
    loadData();
  };

  const handleToggleSpotlight = (charity: Charity) => {
    const updated = { ...charity, isSpotlight: !charity.isSpotlight };
    updateCharity(updated);
    addAuditLog(
      `Toggled Charity Homepage Spotlight for ${charity.name} to ${!charity.isSpotlight}`,
      'CHARITY',
      charity.id
    );
    loadData();
  };

  const handleDeleteCharity = (id: string, charityName: string) => {
    if (confirm(`Are you sure you want to remove ${charityName} from active partner charities?`)) {
      deleteCharity(id);
      addAuditLog(`Deleted Charity Partner: ${charityName}`, 'CHARITY', id);
      loadData();
    }
  };

  const filteredCharities = charitiesList.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterCategory === 'all') return matchesSearch;
    if (filterCategory === 'spotlight') return matchesSearch && c.isSpotlight;
    return matchesSearch && c.category.toLowerCase() === filterCategory.toLowerCase();
  });

  const categories = Array.from(new Set(charitiesList.map((c) => c.category)));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/30 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono tracking-widest uppercase mb-1">
            <span>Admin Control Center</span>
            <span>/</span>
            <span>Charity Management</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" /> Beneficiary & Charity Ops
          </h1>
          <p className="text-xs text-slate-400">
            Manage official partner charities, set monthly homepage spotlight features, and track total grant distributions.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-lg text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Partner Charity</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search charity name, category, tax ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterCategory === 'all'
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Charities
          </button>
          <button
            onClick={() => setFilterCategory('spotlight')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center space-x-1 transition-all ${
              filterCategory === 'spotlight'
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Spotlighted</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                filterCategory === cat
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Charity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCharities.map((charity) => (
          <div
            key={charity.id}
            className={`bg-slate-900/80 border rounded-2xl overflow-hidden backdrop-blur-md shadow-xl transition-all hover:border-slate-700 flex flex-col justify-between ${
              charity.isSpotlight ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-slate-800'
            }`}
          >
            <div>
              {/* Image & Spotlight Badge */}
              <div className="relative h-40 bg-slate-950 overflow-hidden border-b border-slate-800">
                {charity.logoUrl || charity.imageUrl ? (
                  <img
                    src={charity.logoUrl || charity.imageUrl}
                    alt={charity.name}
                    className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-950 text-rose-500">
                    <Heart className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                {charity.isSpotlight && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider flex items-center space-x-1 shadow-lg shadow-amber-500/30">
                    <Star className="w-3 h-3 fill-slate-950" />
                    <span>HOMEPAGE SPOTLIGHT</span>
                  </div>
                )}

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-slate-900/90 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono rounded-md uppercase">
                    {charity.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{charity.taxId || 'Non-Profit'}</span>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white">{charity.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-3 mt-1 leading-relaxed">
                    {charity.description}
                  </p>
                </div>

                {/* Progress bar towards target goal */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">Raised: <strong className="text-emerald-400">${charity.totalRaised.toLocaleString()}</strong></span>
                    <span className="text-slate-500 font-mono">Goal: ${(charity.targetGoal || 50000).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.round((charity.totalRaised / (charity.targetGoal || 50000)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Supporters</div>
                    <div className="text-sm font-bold text-white flex items-center justify-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      {charity.supporterCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Direct Link</div>
                    <div className="text-xs font-bold text-slate-300 flex items-center justify-center gap-1 truncate">
                      {charity.websiteUrl ? (
                        <a
                          href={charity.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-emerald-400 underline flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3" /> Website <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-slate-500">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Actions Footer */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => handleToggleSpotlight(charity)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  charity.isSpotlight
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${charity.isSpotlight ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{charity.isSpotlight ? 'Spotlighted' : 'Set Spotlight'}</span>
              </button>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => openEditModal(charity)}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800"
                  title="Edit Charity"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCharity(charity.id, charity.name)}
                  className="p-1.5 bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-800 hover:border-rose-800/50"
                  title="Delete Charity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white">
                  {editingCharity ? 'Edit Partner Charity' : 'Register New Partner Charity'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCharity} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Charity Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fairway Youth Foundation"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Health & Medical">Health & Medical</option>
                    <option value="Youth & Children">Youth & Children</option>
                    <option value="Veterans & Heroes">Veterans & Heroes</option>
                    <option value="Environment">Environment</option>
                    <option value="Community Impact">Community Impact</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Impact Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe how donations directly support this non-profit cause..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Website URL</label>
                  <input
                    type="url"
                    placeholder="https://example.org"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Tax Registration / EIN</label>
                  <input
                    type="text"
                    placeholder="501(c)(3) EIN-99882"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Image / Logo Banner URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Funding Goal ($)</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={targetGoal}
                    onChange={(e) => setTargetGoal(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Feature as Homepage Spotlight
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Highlights this charity at the top of subscriber dashboards & marketing landing page.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isSpotlight}
                  onChange={(e) => setIsSpotlight(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-lg text-xs shadow-lg shadow-emerald-500/20"
                >
                  {editingCharity ? 'Update Charity' : 'Save Charity Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
