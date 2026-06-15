import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      try {
        let url = '/api/medicines';
        if (filter === 'low') url += '?lowStock=true';
        if (filter === 'expiring') url += '?expiring=true';
        
        const res = await fetch(url);
        if (res.ok) {
          setMedicines(await res.json());
        }
      } catch (e) {
        console.error('Failed to fetch medicines', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Manage medicines, stock levels, and expiry dates.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
          <Plus size={18} />
          Add Medicine
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', name: 'All Items', icon: Package },
          { id: 'low', name: 'Low Stock', icon: TrendingDown },
          { id: 'expiring', name: 'Expiring Soon', icon: Clock }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
              filter === f.id 
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
              : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
            }`}
          >
            <f.icon size={16} />
            {f.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-2xl" />)
        ) : medicines.length > 0 ? (
          medicines.map((med) => (
            <div key={med.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Package size={20} />
                </div>
                {med.stock_quantity <= med.reorder_level && (
                  <div className="bg-amber-50 text-amber-600 p-1.5 rounded-lg" title="Low Stock">
                    <AlertTriangle size={18} />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 line-clamp-1">{med.name}</h3>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-tight">{med.generic_name || 'Generic Name'}</p>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div>
                    <p className="text-2xl font-bold text-gray-900">{med.stock_quantity}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{med.unit || 'Units'}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expiry</p>
                    <p className={`text-sm font-bold ${new Date(med.expiry_date) < new Date() ? 'text-red-500' : 'text-gray-700'}`}>
                        {med.expiry_date ? new Date(med.expiry_date).toLocaleDateString() : 'N/A'}
                    </p>
                </div>
              </div>
              <button className="w-full mt-6 py-2 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                Adjust Stock
                <ArrowUpRight size={14} />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-gray-400">
            <Package className="mx-auto mb-2 opacity-10" size={64} />
            <p>No medicines found in inventory.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineList;
