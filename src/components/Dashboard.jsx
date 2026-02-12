import React, { useState, useEffect } from 'react'; // Added useEffect
import { 
  Plus, Download, Trash2, FileText, ChevronDown, 
  FileSpreadsheet, User, Calendar, IndianRupee 
} from 'lucide-react'; // Added FileSpreadsheet and others
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx'; // Make sure this is here
import { useRef } from 'react'; // Add useRef to the react import

export default function Dashboard() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- FETCH DATA FROM MONGODB ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/invoices');
        const data = await res.json();
        // Sort by newest first
        setHistory(data.reverse());
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleCreate = (type) => {
    navigate('/generator', { state: { type: type } });
    setShowDropdown(false);
  };

const fileInputRef = useRef(null);

const handleImportExcel = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    console.log("Imported Data:", jsonData);
    
    // Logic: Navigate to generator with the first row of data
    if (jsonData.length > 0) {
      alert("✅ Data parsed! Sending to Invoice Generator...");
      navigate('/generator', { state: { importedData: jsonData[0] } });
    }
  };
  reader.readAsArrayBuffer(file);
};

const handleStatusUpdate = async (id, currentStatus) => {
  const newStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';
  
  // Replace this URL with your Render URL when you deploy!
  const API_BASE = "http://localhost:5000"; 

  try {
    const res = await fetch(`${API_BASE}/api/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (res.ok) {
      // Update the local state so the UI changes immediately
      setHistory(prev => prev.map(inv => 
        inv._id === id ? { ...inv, status: newStatus } : inv
      ));
    } else {
      alert("Failed to update status on the server.");
    }
  } catch (err) {
    console.error("Network Error:", err);
    alert("Check your backend connection!");
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* LEFT SIDEBAR: ACTIONS */}
      <aside className="w-full md:w-80 p-8 border-r bg-white shadow-sm h-screen sticky top-0">
        <div className="mb-10">
           <h1 className="text-2xl font-black text-blue-900">PRO-INVOICE</h1>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Dashboard</p>
        </div>

        <div className="space-y-4">
          <div className="w-full">
  {/* Hidden File Input */}
  <input 
    type="file" 
    ref={fileInputRef} 
    onChange={handleImportExcel} 
    accept=".xlsx, .xls, .csv" 
    className="hidden" 
  />

  {/* Real Button */}
  <button 
    onClick={() => fileInputRef.current.click()}
    className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-xl text-xs font-black text-slate-600 transition-all border-2 border-transparent hover:border-blue-200"
  >
    <FileSpreadsheet size={18} /> 
    IMPORT FROM EXCEL
  </button>
</div>

          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-blue-800 transition-all"
            >
              <Plus size={20} /> NEW DOCUMENT <ChevronDown size={18} />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white shadow-2xl rounded-2xl border p-2 z-50 animate-in fade-in slide-in-from-top-2">
                 <button onClick={() => handleCreate('Invoice')} className="w-full text-left p-3 hover:bg-blue-50 rounded-lg flex items-center gap-3 text-sm font-bold text-slate-700">
                  <FileText className="text-blue-500" size={18} /> Invoice
                </button>
                <button onClick={() => handleCreate('Quote')} className="w-full text-left p-3 hover:bg-blue-50 rounded-lg flex items-center gap-3 text-sm font-bold text-slate-700">
                  <FileText className="text-emerald-500" size={18} /> Quote 
                </button>
                <button onClick={() => handleCreate('Credit Note')} className="w-full text-left p-3 hover:bg-blue-50 rounded-lg flex items-center gap-3 text-sm font-bold text-slate-700">
                  <FileText className="text-red-500" size={18} /> Credit Note
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE: CONTENT & HISTORY */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tight">My Documents</h2>
               <p className="text-slate-500 font-medium">Manage and track your recent billings</p>
            </div>
          </div>
          
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Total Generated</p>
                <h3 className="text-4xl font-black mt-1">{history.length}</h3>
              </div>
              <FileText className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
            </div>
            
            <div className="bg-emerald-500 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Total Revenue</p>
                <h3 className="text-4xl font-black mt-1">₹{history.reduce((acc, curr) => acc + (curr.total || 0), 0).toLocaleString()}</h3>
              </div>
              <IndianRupee className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
            </div>
          </div>

          {/* DOCUMENT LIST */}
          <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
               <h4 className="font-black text-slate-700 text-sm uppercase tracking-widest">Recent Transactions</h4>
               <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">{history.length} Records</span>
            </div>

            {loading ? (
              <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                Fetching records...
              </div>
            ) : history.length === 0 ? (
              <div className="p-20 text-center">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-400 font-bold">No documents found in database.</p>
                <p className="text-xs text-slate-300 uppercase mt-1">Create your first invoice to see it here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Doc #</th>
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((doc) => (
                      <tr key={doc._id} className="hover:bg-blue-50/50 transition-colors group cursor-pointer">
                        <td className="px-6 py-4">
  <button 
  onClick={(e) => {
    e.stopPropagation();
    handleStatusUpdate(doc._id, doc.status);
  }}
  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
    doc.status === 'Paid' 
      ? 'bg-emerald-100 text-emerald-600' 
      : 'bg-red-100 text-red-600 border border-red-200'
  }`}
>
  {doc.status || 'Unpaid'}
</button>
</td>
                        <td className="px-6 py-4 font-black text-blue-900 text-sm">#{doc.docNumber}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-600">{doc.clientName}</td>
                        <td className="px-6 py-4 text-sm text-slate-400">{new Date(doc.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">{doc.currency}{doc.total?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}