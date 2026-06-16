import React, { useState, useEffect, useCallback } from 'react';
import {
  Package, Search, Plus, AlertTriangle, Clock,
  TrendingDown, TrendingUp, X, History, RefreshCw
} from 'lucide-react';
import { AnimatedPage, staggeredContainer, staggeredItem } from '../../components/AnimatedPage';
import { motion } from 'framer-motion';

// ─── Add/Edit Medicine Modal ───────────────────────────────────────────────────────────────────────
function MedicineModal({ medicine, onClose, onSaved }) {
  const isEdit = !!medicine?.id;
  const [form, setForm] = useState({
    name:           medicine?.name           || '',
    generic_name:   medicine?.generic_name   || '',
    category:       medicine?.category       || '',
    manufacturer:   medicine?.manufacturer   || '',
    unit:           medicine?.unit           || '',
    unit_price:     medicine?.unit_price     ?? '',
    stock_quantity: medicine?.stock_quantity ?? '',
    reorder_level:  medicine?.reorder_level  ?? 10,
    batch_number:   medicine?.batch_number   || '',
    expiry_date:    medicine?.expiry_date    || '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { setError('Medicine name is required.'); return; }
    setLoading(true); setError('');
    const res = await fetch(
      isEdit ? `/api/medicines/${medicine.id}` : '/api/medicines',
      {
        method: isEdit ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          unit_price:     form.unit_price     !== '' ? Number(form.unit_price)     : 0,
          stock_quantity: form.stock_quantity !== '' ? Number(form.stock_quantity) : 0,
          reorder_level:  form.reorder_level  !== '' ? Number(form.reorder_level)  : 10,
        }),
      }
    );
    setLoading(false);
    if (res.ok) { onSaved(); }
    else { const d = await res.json().catch(() => ({})); setError(d.error || 'Save failed.'); }
  };

  const fields = [
    { key:'name',           label:'Medicine Name *',  type:'text',   full:true },
    { key:'generic_name',   label:'Generic Name',      type:'text' },
    { key:'category',       label:'Category',          type:'text' },
    { key:'manufacturer',   label:'Manufacturer',      type:'text' },
    { key:'unit',           label:'Unit (tab/mL/etc)', type:'text' },
    { key:'unit_price',     label:'Unit Price (₱)',    type:'number' },
    { key:'stock_quantity', label:'Initial Stock',     type:'number' },
    { key:'reorder_level',  label:'Reorder Level',     type:'number' },
    { key:'batch_number',   label:'Batch No.',         type:'text' },
    { key:'expiry_date',    label:'Expiry Date',       type:'date' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold">{isEdit ? 'Edit Medicine' : 'Add Medicine'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.key} className={f.full ? 'col-span-2' : ''}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            ))}
          </div>
          {error && <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </form>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50">
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Medicine'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Adjust Stock Modal ─────────────────────────────────────────────────────────────────────────────
function AdjustModal({ medicine, onClose, onSaved }) {
  const [delta,   setDelta]   = useState('');
  const [reason,  setReason]  = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handle = async (e) => {
    e.preventDefault();
    if (!delta || delta === '0') { setError('Enter a non-zero amount.'); return; }
    if (!reason.trim()) { setError('Reason is required.'); return; }
    setLoading(true); setError('');
    const res = await fetch(`/api/medicines/${medicine.id}/adjust`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta: Number(delta), reason }),
    });
    setLoading(false);
    if (res.ok) { onSaved(); }
    else { const d = await res.json().catch(() => ({})); setError(d.error || 'Adjustment failed.'); }
  };

  const numDelta = Number(delta);
  const preview  = delta && medicine ? medicine.stock_quantity + numDelta : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold">Adjust Stock</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18}/></button>
        </div>
        <form onSubmit={handle} className="px-6 py-5 space-y-4">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="font-semibold text-gray-900 text-sm">{medicine.name}</p>
            <p className="text-xs text-gray-400">{medicine.generic_name}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {medicine.stock_quantity} <span className="text-sm font-normal text-gray-400">{medicine.unit}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Adjustment Amount <span className="text-gray-400">(use − for dispense/removal)</span>
            </label>
            <div className="flex gap-2">
              <button type="button"
                onClick={() => setDelta(v => v === '' ? '-1' : String(Number(v) - 1))}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition">
                −
              </button>
              <input type="number" value={delta} onChange={e => setDelta(e.target.value)}
                placeholder="e.g. 10 or -5"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button type="button"
                onClick={() => setDelta(v => v === '' ? '1' : String(Number(v) + 1))}
                className="px-3 py-2 bg-green-50 text-green-600 rounded-xl font-bold hover:bg-green-100 transition">
                +
              </button>
            </div>
            {preview !== null && preview >= 0 && (
              <p className="text-xs mt-1.5 text-center">
                New stock: <span className={`font-bold ${
                  preview <= medicine.reorder_level ? 'text-orange-600' : 'text-green-600'
                }`}>{preview} {medicine.unit}</span>
              </p>
            )}
            {preview !== null && preview < 0 && (
              <p className="text-xs mt-1.5 text-center text-red-500 font-medium">Cannot go below 0</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reason *</label>
            <select value={reason} onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-2">
              <option value="">— select reason —</option>
              <option>Stock replenishment</option>
              <option>Dispensed to patient</option>
              <option>Expired / disposed</option>
              <option>Inventory correction</option>
              <option>Damaged / lost</option>
              <option>Transfer between branches</option>
            </select>
            <input type="text" value={reason.startsWith('—') ? '' : reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Or type custom reason..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800">Cancel</button>
            <button type="submit" disabled={loading || (preview !== null && preview < 0)}
              className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50">
              {loading ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Transaction History Drawer ─────────────────────────────────────────────────────────────────────
function HistoryDrawer({ medicine, onClose }) {
  const [txns,    setTxns]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/medicines/${medicine.id}/history`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setTxns(d.transactions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [medicine.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold">Stock History</h2>
            <p className="text-xs text-gray-400">{medicine.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18}/></button>
        </div>
        <div className="overflow-y-auto flex-1 px-4 py-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
            </div>
          ) : txns.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <History size={32} className="mx-auto mb-2 opacity-30"/>
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {txns.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                    t.delta > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                  }`}>
                    {t.delta > 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-bold ${
                        t.delta > 0 ? 'text-green-700' : 'text-red-600'
                      }`}>
                        {t.delta > 0 ? '+' : ''}{t.delta}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {t.stock_before} → {t.stock_after}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{t.reason}</p>
                    <p className="text-[10px] text-gray-400">
                      {t.user_name || 'System'} · {new Date(t.created_at).toLocaleString('en-PH', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────────────────────────────
const MedicineList = () => {
  const [medicines,    setMedicines]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');
  const [q,            setQ]            = useState('');
  const [addModal,     setAddModal]     = useState(false);
  const [adjustModal,  setAdjustModal]  = useState(null);
  const [historyModal, setHistoryModal] = useState(null);

  const fetchMeds = useCallback(async () => {
    setLoading(true);
    let url = '/api/medicines';
    if (filter === 'low')      url += '?lowStock=true';
    if (filter === 'expiring') url += '?expiring=true';
    const res = await fetch(url, { credentials: 'include' });
    if (res.ok) setMedicines(await res.json());
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchMeds(); }, [fetchMeds]);

  const filtered = medicines.filter(m =>
    !q ||
    m.name?.toLowerCase().includes(q.toLowerCase()) ||
    m.generic_name?.toLowerCase().includes(q.toLowerCase()) ||
    m.category?.toLowerCase().includes(q.toLowerCase())
  );

  const isLow      = m => m.stock_quantity <= m.reorder_level;
  const isExpiring = m => m.expiry_date && new Date(m.expiry_date) <= new Date(Date.now() + 30*24*60*60*1000);
  const isExpired  = m => m.expiry_date && new Date(m.expiry_date) < new Date();

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Medicines, stock levels &amp; expiry tracking.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchMeds}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition" title="Refresh">
            <RefreshCw size={16}/>
          </button>
          <button onClick={() => setAddModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-primary/90 transition">
            <Plus size={16}/> Add Medicine
          </button>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all',      name: 'All',          icon: Package },
            { id: 'low',      name: 'Low Stock',     icon: TrendingDown },
            { id: 'expiring', name: 'Expiring Soon', icon: Clock },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition border ${
                filter === f.id
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
              }`}>
              <f.icon size={15}/>{f.name}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input type="text" value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search name, generic, category..."
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Grid */}
      <motion.div
        variants={staggeredContainer} initial="initial" animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {loading ? (
          [1,2,3,4,5,6].map(i => <div key={i} className="h-52 bg-gray-100 animate-pulse rounded-2xl"/>)
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400">
            <Package className="mx-auto mb-2 opacity-10" size={64}/>
            <p>No medicines found.</p>
          </div>
        ) : filtered.map(med => (
          <motion.div key={med.id} variants={staggeredItem}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 bg-primary-soft text-primary rounded-xl">
                  <Package size={18}/>
                </div>
                <div className="flex gap-1.5">
                  {isExpired(med) && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">EXPIRED</span>
                  )}
                  {!isExpired(med) && isExpiring(med) && (
                    <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">EXP SOON</span>
                  )}
                  {isLow(med) && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <AlertTriangle size={9}/> LOW
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-gray-900 line-clamp-1">{med.name}</h3>
              <p className="text-xs text-gray-400 font-medium">{med.generic_name || '—'}</p>
              {med.category && <p className="text-xs text-gray-400 mt-0.5">{med.category}</p>}

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className={`text-2xl font-bold ${
                    isLow(med) ? 'text-amber-600' : 'text-gray-900'
                  }`}>{med.stock_quantity}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{med.unit || 'Units'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expiry</p>
                  <p className={`text-sm font-bold ${
                    isExpired(med) ? 'text-red-500' :
                    isExpiring(med) ? 'text-orange-500' : 'text-gray-700'
                  }`}>
                    {med.expiry_date
                      ? new Date(med.expiry_date).toLocaleDateString('en-PH', { month:'short', day:'numeric', year:'numeric' })
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isLow(med) ? 'bg-amber-400' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(100, (med.stock_quantity / Math.max(med.reorder_level * 2, 1)) * 100)}%` }}
                  />
                </div>
                <p className="text-[9px] text-gray-400 mt-0.5">Reorder at {med.reorder_level}</p>
              </div>
            </div>

            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={() => setAdjustModal(med)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition flex items-center justify-center gap-1.5"
              >
                <TrendingUp size={13}/> Adjust Stock
              </button>
              <button
                onClick={() => setHistoryModal(med)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-400 hover:bg-gray-50 transition"
                title="Transaction History"
              >
                <History size={14}/>
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {addModal     && <MedicineModal onClose={() => setAddModal(false)}    onSaved={() => { setAddModal(false);    fetchMeds(); }} />}
      {adjustModal  && <AdjustModal   medicine={adjustModal}  onClose={() => setAdjustModal(null)}  onSaved={() => { setAdjustModal(null);  fetchMeds(); }} />}
      {historyModal && <HistoryDrawer medicine={historyModal} onClose={() => setHistoryModal(null)} />}
    </AnimatedPage>
  );
};

export default MedicineList;
