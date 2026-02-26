import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, FileText, ChevronDown, 
  FileSpreadsheet, IndianRupee, Edit3, 
  Store ,X,LogOut
} from 'lucide-react'; 

import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

export default function Dashboard() {
  const [showDropdown, setShowDropdown] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Use environment variable for production, fallback to local for dev
  const API_BASE = "https://invoice-generator-backend-5sfh.onrender.com";

  // --- FETCH DATA ---
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    const email = user?.email;
    
    console.log("user:",user);
    console.log("Email:",user?.email);
    if (!user || !user.email)
      {
        setLoading(false);
        return;
      } // Get user from login
    
  try {
      const res = await fetch(`${API_BASE}/api/invoices?email=${user.email}`);
      const data = await res.json();
      console.log("Fetched invoice",data);
      // Assume backend handles sorting, or use .reverse() if needed
      setHistory(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch Error:", err);
      setLoading(false);
    }
  };

  // --- DELETE LOGIC ---
  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent row click trigger
    if (!window.confirm("Delete this document permanently?")) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/invoices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(inv => inv._id !== id));
      }
    } catch (err) {
      alert("Delete failed. Check backend.");
    }
  };

  // --- EDIT LOGIC ---
  const openEditModal = (invoice, e) => {
    e.stopPropagation();
    setEditingInvoice({ ...invoice }); // Create a copy so we don't edit live data
    setIsEditModalOpen(true);
  };
  const saveEdit = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/invoices/${editingInvoice._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingInvoice)
      });

      if (res.ok) {
        // Update local state to reflect changes
        setHistory(prev => prev.map(inv => inv._id === editingInvoice._id ? editingInvoice : inv));
        setIsEditModalOpen(false);
        alert("✅ Invoice Updated!");
      }
    } catch (err) {
      alert("Error updating invoice");
    }
  };

  // --- STATUS TOGGLE ---
  const handleStatusUpdate = async (id, currentStatus, e) => {
    e.stopPropagation();
    const newStatus = currentStatus?.toLowerCase() === 'paid' ? 'Unpaid' : 'Paid'; // Toggle locally
    try {
        console.log("Updating invoice ID:",id);
        const res = await fetch(`${API_BASE}/api/invoices/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }) //
        });
          
        if (res.ok) {
            // Update the history state immediately so the UI changes
            setHistory(prev => prev.map(inv => 
                inv._id === id ? { ...inv, status: newStatus } : inv
            ));
        }
    } catch (err) {
        console.error("Status Update Error:", err); //
    }
};
  // --- EXCEL & NAVIGATION ---
  const handleCreate = (type) => {
    navigate('/generator', { state: { type: type } });
    setShowDropdown(false);
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      if (jsonData.length > 0) {
        navigate('/generator', { state: { importedData: jsonData[0] } });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user data
    navigate('/login'); // Redirect to login page
};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className=" relative w-full md:w-80 p-8 border-r bg-white shadow-sm h-screen sticky top-0">
        <div className="mb-10">
          <h1 className="text-2xl font-black text-blue-900">PRO-INVOICE</h1>
          
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Dashboard</p>
        </div>
        


        <div className="space-y-4">
        <div className="absolute bottom-6 left-6 right-6">
  <button
    onClick={handleLogout}
    className="w-full flex items-center justify-center gap-2 px-4 py-3 
               bg-slate-100 hover:bg-red-50 
               text-slate-600 hover:text-red-600 
               rounded-xl text-sm font-semibold 
               transition-all duration-200"
  >
    <LogOut size={16} />
    Logout
  </button>
</div><div className="absolute bottom-24 left-6 right-6 text-center">
  <p className="text-xs text-slate-400 font-semibold">
    Signed in as
  </p>
  <p className="text-sm font-bold text-slate-700 truncate">
    {user?.email}
  </p>
</div>
          <input type="file" ref={fileInputRef} onChange={handleImportExcel} accept=".xlsx, .xls, .csv" className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-xl text-xs font-black text-slate-600 transition-all">
            <FileSpreadsheet size={18} /> IMPORT FROM EXCEL
          </button>

          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
              <Plus size={20} /> NEW DOCUMENT <ChevronDown size={18} />
            </button>
            {showDropdown && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white shadow-2xl rounded-2xl border p-2 z-50">
                {['Invoice', 'Quote', 'Credit Note'].map(type => (
                  <button key={type} onClick={() => handleCreate(type)} className="w-full text-left p-3 hover:bg-blue-50 rounded-lg text-sm font-bold text-slate-700 flex items-center gap-3">
                    <FileText size={16} className="text-blue-500" /> {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-slate-900 mb-8">My Documents</h2>
           
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-blue-600 p-8 rounded-3xl text-white relative overflow-hidden group">
              <p className="text-xs font-bold opacity-80 uppercase">Total Documents</p>
              <h3 className="text-4xl font-black mt-1">{history.length}</h3>
              <FileText className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
            </div>
            <div className="bg-emerald-500 p-8 rounded-3xl text-white relative overflow-hidden group">
              <p className="text-xs font-bold opacity-80 uppercase">Total Revenue</p>
              <h3 className="text-4xl font-black mt-1">₹{history.reduce((acc, curr) => acc + (curr.total || 0), 0).toLocaleString()}</h3>
              <IndianRupee className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
            </div>
          </div>

          <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
              <h4 className="font-black text-slate-700 text-sm uppercase">Recent Transactions</h4>
            </div>

            {loading ? (
              <div className="p-20 text-center text-slate-400 font-bold animate-pulse">LOADING...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Doc #</th>
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((doc) => (
                      <tr key={doc._id} className="hover:bg-blue-50/30 transition-colors group cursor-default">
                        <td className="px-6 py-4">
                          <button type="button"
                            onClick={(e) => handleStatusUpdate(doc._id, doc.status, e)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                              doc.status?.toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600 border border-red-200'
                            }`}

                          >
                            {doc.status ? doc.status: 'Unpaid'}
                    
                          </button>
                        </td>
                        <td className="px-6 py-4 font-black text-blue-900 text-sm">#{doc.docNumber}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-600">{doc.clientName}</td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">
                          {doc.currency}{doc.total?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-3">
                            <button onClick={(e) => openEditModal(doc, e)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                              <Edit3 size={18} />
                            </button>
                            <button onClick={(e) => handleDelete(doc._id, e)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* --- EDIT MODAL --- */}
        {isEditModalOpen && editingInvoice && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <h3 className="font-black text-slate-800">Edit Document</h3>
                <button onClick={() => setIsEditModalOpen(false)}><X size={20}/></button>
              </div>
              <div className="p-8 space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Client Name</label>
                  <input 
                    className="w-full mt-1 p-3 bg-slate-100 rounded-xl font-bold focus:ring-2 ring-blue-500 outline-none"
                    value={editingInvoice.clientName}
                    onChange={(e) => setEditingInvoice({...editingInvoice, clientName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Total Amount</label>
                  <input 
                    type="number"
                    className="w-full mt-1 p-3 bg-slate-100 rounded-xl font-bold focus:ring-2 ring-blue-500 outline-none"
                    value={editingInvoice.total}
                    onChange={(e) => setEditingInvoice({...editingInvoice, total: Number(e.target.value)})}
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 font-bold text-slate-500">Cancel</button>
                  <button onClick={saveEdit} className="flex-1 py-3 bg-blue-900 text-white rounded-xl font-bold">Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}