import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useLocation, useNavigate } from 'react-router-dom';

import * as XLSX from 'xlsx';
import { 
  Plus, Trash2, Download, Sun, Moon, 
  ArrowLeft, Save, Clock, FileSpreadsheet, Eraser, 
  Layout, Globe, RefreshCcw, Mail, Cloud, Users, UserPlus, TrendingUp, Wallet
} from 'lucide-react';
export default function InvoiceGenerator() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // --- STATE ---
  const [docType, setDocType] = useState(location.state?.type || 'Tax Invoice');
  const [darkMode, setDarkMode] = useState(false);
  const [logo, setLogo] = useState(null);
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState('Unpaid');
  // Form Fields
  const [docNumber, setDocNumber] = useState('001');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [senderDetails, setSenderDetails] = useState('');
  const [billTo, setBillTo] = useState('');
  const [shipTo, setShipTo] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  //data base conntion in cloud
  const API_BASE = import.meta.env.VITE_API_BASE;
  // Table Items
  const [items, setItems] = useState([{ id: Date.now(), desc: '', qty: 1, rate: 0 }]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);

  const [currency, setCurrency] = useState('₹');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [history, setHistory] = useState([]);
  const [isSynced, setIsSynced] = useState(true);


  // Inside your component...
const downloadPDF = async () => {
  const element = document.getElementById('invoice-download-area');
  const buttons = document.querySelectorAll('.no-print');

  // 1. Hide the elements
  buttons.forEach(btn => btn.style.display = 'none');

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${docType}_${docNumber}.pdf`);
  } catch (err) {
    console.error("PDF Error:", err);
  } finally {
    // 2. THE FIX: Restore to original CSS instead of forcing 'flex'
    buttons.forEach(btn => btn.style.display = ''); 
  }
};

  // --- LOAD TEMPLATE & HISTORY ON MOUNT ---
  // --- 1. YOUR ORIGINAL TEMPLATE EFFECT ---
useEffect(() => {
  const savedTemplate = JSON.parse(localStorage.getItem('invoice_template'));
  if (savedTemplate) {
    setLogo(savedTemplate.logo);
    setSenderDetails(savedTemplate.senderDetails);
    setGstNumber(savedTemplate.gstNumber);
  }
}, []);

// --- 2. NEW EFFECT FOR IMPORTED DATA & AUTO-INCREMENT ---
useEffect(() => {
  // A. Check for Imported Excel Data from Dashboard
  if (location.state?.importedData) {
    const data = location.state.importedData;
    setBillTo(data.ClientName || '');
    setDocNumber(data.InvoiceNo || '001');
    setItems([{
      id: Date.now(),
      desc: data.Description || 'Imported Item',
      qty: data.Quantity || 1,
      rate: data.Rate || 0
    }]);
  } 
  // B. Otherwise, handle Auto-Increment if history exists
  else if (history.length > 0) {
    const lastNum = Math.max(...history.map(doc => parseInt(doc.docNumber) || 0));
    const nextNum = (lastNum + 1).toString().padStart(3, '0');
    setDocNumber(nextNum);
  }
}, [location.state, history]); // Runs when you navigate or history loads
  // --- CALCULATIONS ---
  const subtotal = items.reduce((acc, item) => acc + (Number(item.qty) * Number(item.rate)), 0);
  const discountVal = (subtotal * Number(discount)) / 100;
  const taxVal = ((subtotal - discountVal) * Number(tax)) / 100;
  const total = subtotal - discountVal + taxVal + Number(shipping);
  const balanceDue = total - Number(amountPaid);

  // --- ACTIONS ---
  const sendEmail = () => {
    const subject = encodeURIComponent(`${docType} #${docNumber} from ${senderDetails.split('\n')[0]}`);
    const body = encodeURIComponent(`Hello,\n\nPlease find the ${docType} attached.\nTotal Amount: ${currency}${total.toLocaleString()}\n\nRegards,\n${senderDetails.split('\n')[0]}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
  // --- TEMPLATE FUNCTIONS ---
  const saveAsTemplate = () => {
    const templateData = { logo, senderDetails, gstNumber };
    localStorage.setItem('invoice_template', JSON.stringify(templateData));
    alert("Company profile saved as default template!");
  };

  const clearTemplate = () => {
    if (window.confirm("Remove saved company profile?")) {
      localStorage.removeItem('invoice_template');
      setLogo(null);
      setSenderDetails('');
      setGstNumber('');
    }
  };

  // --- HANDLERS ---
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };
  
  const handleSignup = async () => {
  // 1. Validation Check
  if (!name.trim() || !email.trim() || !password.trim()) {
    alert("❌ Error: You cannot leave fields blank!");
    return; // This stops the function immediately
  }

  // 2. Only if valid, proceed to fetch
  try {
    const response = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    
    alert("Account created successfully!");
  } catch (err) {
    alert(err.message);
  }
};
  const saveToHistory = async () => {
  setIsSaving(true);
  
  // 1. Get the real logged-in user from localStorage
  const userData = JSON.parse(localStorage.getItem('user'));
  const userEmail = userData ? userData.email : "guest@example.com";

  const invoiceData = {
    creatorEmail: userEmail, // Now it uses the real email!
    docNumber,
    date,
    clientName: billTo.split('\n')[0] || "Unknown Client",
    total: Number(total),
    currency,
    items,
    status: "Unpaid"
  };

  try {
    const response = await fetch(`${API_BASE}/api/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData)
    });

    if (response.ok) {
      alert("✅ Invoice Saved to Database!");
      fetchHistory(); // This refreshes your "Recent History" sidebar automatically
    }
  } catch (error) {
    alert("❌ Database Connection Error!");
  } finally {
    setIsSaving(false);
  }
};

const saveInvoice = () => {
  const newInvoice = { id: Date.now(), ...invoiceData, date: new Date() };
  
  // 1. Get existing local history
  const localHistory = JSON.parse(localStorage.getItem('public_history') || "[]");
  
  // 2. Add new one
  const updatedHistory = [newInvoice, ...localHistory];
  
  // 3. Save back to browser memory
  localStorage.setItem('public_history', JSON.stringify(updatedHistory));
  
  alert("Invoice saved to local history!");
};
const handleSave = (invoiceData) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    // PUBLIC MODE: Save to browser memory
    const existingHistory = JSON.parse(localStorage.getItem('local_invoices') || "[]");
    const updatedHistory = [invoiceData, ...existingHistory];
    localStorage.setItem('local_invoices', JSON.stringify(updatedHistory));
    alert("Saved to your device history!");
  } else {
    // CLOUD MODE: Send to your MongoDB backend
    saveToDatabase(invoiceData);
  }
};
  const exportToExcel = () => {
    const data = [
      ["TAX INVOICE"], [""],
      ["Invoice #", docNumber], ["Date", date], ["GSTIN", gstNumber], [""],
      ["Bill To", billTo], ["Ship To", shipTo], [""],
      ["Item Description", "Qty", "Rate", "Total"],
      ...items.map(i => [i.desc, i.qty, i.rate, i.qty * i.rate]),
      [""], ["Subtotal", subtotal], ["Tax", taxVal], ["Total", total], ["Balance", balanceDue]
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice");
    XLSX.writeFile(wb, `${docType}_${docNumber}.xlsx`);
  };
  const fetchHistory = async () => {
    try {
    const userData = JSON.parse(localStorage.getItem('invoice_user'));
    const userEmail=userData?.email;
    const response = await fetch(`${API_BASE}/api/invoices?email=${userEmail}`);
    if (response.ok) {
      const data = await response.json();
      setHistory(data);

      // --- AUTO-INCREMENT LOGIC ---
      if (data.length > 0) {
        // Find the highest number in the database
        const lastInvoice = data[0]; // Assuming newest is first
        const lastNum = parseInt(lastInvoice.docNumber);
        
        // Set the new invoice number to lastNum + 1, formatted as "002", "003", etc.
        const nextNum = (lastNum + 1).toString().padStart(3, '0');
        setDocNumber(nextNum);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

// Call this function when the page loads
useEffect(() => {
  fetchHistory();
}, []);

  // --- STYLES (High Visibility) ---
  const labelStyle = "text-[12px] font-black text-blue-950 dark:text-blue-200 uppercase tracking-wider mb-1 block";
  const inputStyle = "w-full border-2 border-slate-300 dark:border-slate-700 rounded-lg p-3 text-sm font-bold text-slate-900 bg-white dark:bg-slate-800 dark:text-white focus:border-blue-900 outline-none transition-all";

  return (
    <div className={`${darkMode ? 'dark bg-slate-950' : 'bg-slate-100'} min-h-screen pb-20 font-sans`}>
      
      {/* HEADER */}
      <header className="bg-white dark:bg-slate-900 border-b-2 border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 no-print">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <ArrowLeft size={20} className="text-blue-950 dark:text-white" />
          </button>
          <h1 className="text-xl font-black text-blue-900 dark:text-blue-400">PRO-INVOICE</h1>
          <div className="flex items-center gap-1 mt-1">
               <Cloud size={12} className={isSynced ? "text-emerald-500" : "text-amber-500"} />
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{isSynced ? "Cloud Synced" : "Unsaved Changes"}</span>
            </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={saveAsTemplate} className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-lg font-bold text-xs hover:bg-blue-100 transition-all border border-blue-200">
            <Layout size={14} /> SAVE AS TEMPLATE
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-900">
            {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR */}
        <aside className="lg:w-72 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-slate-100 shadow-sm space-y-3">
        <label className="text-[10px] font-black text-slate-500 uppercase">Document Status</label>
          <div className="flex gap-2">
      < button  onClick={() => setStatus('Unpaid')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${status === 'Unpaid' ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
        UNPAID
      </button>
      <button 
        onClick={() => setStatus('Paid')}
        className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${status === 'Paid' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
      >
        PAID
      </button>
    </div>
    </div>
         <button 
      onClick={async () => {
        setIsSaving(true);
        await saveToHistory(); 
        await downloadPDF();
        setIsSaving(false);
      }} 
      className="w-full h-14 bg-blue-900 hover:bg-blue-950 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl"
    >
      <Download size={20} /> PRINT / SAVE PDF
    </button>
          <button onClick={sendEmail} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl text-sm">
      <Mail size={20} /> Send via Email
    </button>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-blue-100 shadow-xl no-print">
            <h3 className="text-xs font-black text-blue-900 mb-4 flex items-center gap-2 uppercase tracking-widest"><Globe size={16}/> Currency & Region</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['₹', '$', '€'].map(symbol => (
                <button key={symbol} onClick={() => {setCurrency(symbol); setIsSynced(false);}} className={`py-3 rounded-xl font-black text-sm transition-all ${currency === symbol ? 'bg-blue-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border-2 hover:bg-blue-50'}`}>{symbol}</button>
              ))}
            </div>
            <label className="text-[10px] font-black text-slate-500 uppercase">Conversion Rate</label>
            <div className="flex items-center gap-2 mt-1 bg-slate-50 p-3 rounded-xl border-2 border-slate-100">
              <RefreshCcw size={14} className="text-blue-900"/>
              <input type="number" className="w-full bg-transparent font-black text-blue-900 outline-none" value={exchangeRate} onChange={(e) => {setExchangeRate(e.target.value); setIsSynced(false);}} />
            </div>
          </div>
          <button onClick={exportToExcel} className="w-full bg-blue-900 hover:bg-black text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl">
            <FileSpreadsheet size={20} /> EXCEL EXPORT
          </button>
         
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-black text-blue-900 mb-4 flex items-center gap-2 uppercase tracking-widest"><Clock size={16}/> Recent History</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {history.length === 0 ? <p className="text-[10px] italic text-slate-400">No documents saved.</p> : 
                history.map(doc => (
                  <div key={doc.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="font-black text-blue-900 dark:text-blue-400">#{doc.docNumber}</div>
                    <div className="text-[10px] font-bold text-slate-900 dark:text-slate-300 truncate">{doc.billTo || 'Client'}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{doc.currency}{doc.total.toLocaleString()}</div>
                  </div>
                ))
              }
            </div>
            <button onClick={() => setHistory([])} className="mt-4 w-full text-[10px] font-bold text-red-500 hover:underline flex items-center justify-center gap-1">
              <Eraser size={12}/> CLEAR ALL HISTORY
            </button>
          </div>
        </aside>

        {/* MAIN DOCUMENT */}
        <main className="flex-1" id="invoice-download-area">
          <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-sm border-2 border-slate-200 dark:border-slate-800 p-8 md:p-14">
            
            {/* TOP INFO */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
              <div className="w-full md:w-1/2">
                <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                <div onClick={() => fileInputRef.current.click()} className="w-48 h-32 border-2 border-dashed border-blue-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-blue-300 bg-blue-50/30 hover:bg-blue-50 cursor-pointer overflow-hidden mb-4 transition-all">
                  {logo ? <img src={logo} alt="Logo" className="w-full h-full object-contain" /> : <span className="text-[10px] font-black uppercase">Click to add Logo</span>}
                </div>
                <textarea 
                  className="w-full text-sm font-black h-1 bg-transparent outline-none resize-none text-blue-950 dark:text-white placeholder:text-blue-60" 
                  value={senderDetails} 
                  onChange={(e) => setSenderDetails(e.target.value)} 
                  placeholder="ENTER YOUR COMPANY NAME & ADDRESS HERE"
                />
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700">
                  <label className={labelStyle}>GSTIN / TAX ID</label>
                  <input type="text" className="w-full bg-transparent outline-none text-sm font-black text-blue-900 dark:text-blue-400" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="33XXXXX0000X1Z1" />
                </div>
                <button onClick={clearTemplate} className="mt-2 text-[10px] font-bold text-red-400 no-print hover:underline uppercase tracking-widest">Reset Company Profile</button>
              </div>

              <div className="text-right">
                <h2 className="text-6xl font-black text-blue-900 dark:text-blue-400 uppercase tracking-tighter mb-6">{docType}</h2>
                <div className="space-y-4">
                  <div className="inline-flex items-center border-2 border-blue-900 rounded-xl overflow-hidden shadow-md">
                    <span className="bg-blue-900 text-white px-4 py-2 font-black">#</span>
                    <input type="text" className="w-24 p-2 text-right font-black text-blue-900 outline-none" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
                  </div>
                  <div className="space-y-4 pt-7">
                  {['Date', 'Payment Terms', 'Due Date', 'PO Number'].map((label) => (
                    <div key={label} className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 dark:text-slate-900">{label}</label>
                      <input 
                        type={label.includes('Date') ? 'date' : 'text'} 
                        className="border-b-2 border-blue-100 w-32 text-right font-black text-blue-900 text-sm outline-none"
                   />
                    </div>
                  ))}
                </div>
                </div>
              </div>
            </div>

            {/* BILLING SECTION */}
            <div className="grid md:grid-cols-2 gap-10 mb-12">
              <div>
                <label className={labelStyle}>Bill To (Client Details)</label>
                <textarea className={inputStyle} style={{height: '120px'}} placeholder="Client Name, Address, GST..." value={billTo} onChange={(e) => setBillTo(e.target.value)} />
              </div>
              <div>
                <label className={labelStyle}>Ship To (Delivery Details)</label>
                <textarea className={inputStyle} style={{height: '120px'}} placeholder="Optional..." value={shipTo} onChange={(e) => setShipTo(e.target.value)} />
              </div>
            </div>

            {/* TABLE */}
            <div className="mb-10">
              <div className="grid grid-cols-12 bg-blue-900 text-white py-4 px-6 rounded-t-2xl text-xs font-black uppercase tracking-widest shadow-lg">
                <div className="col-span-7">Items & Description</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-2 text-center">Rate</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              <div className="border-2 border-t-0 border-blue-900 rounded-b-2xl overflow-hidden shadow-sm">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 border-b-2 border-blue-50 py-5 px-6 group hover:bg-blue-50/50 transition-colors">
                    <div className="col-span-7 font-black text-blue-900"><input className="w-full bg-transparent outline-none" placeholder="Item Name..." value={item.desc} onChange={(e) => updateItem(index, 'desc', e.target.value)} /></div>
                    <div className="col-span-1 text-center"><input type="number" className="w-full text-center font-black" value={item.qty} onChange={(e) => updateItem(index, 'qty', e.target.value)} /></div>
                    <div className="col-span-2 text-center font-black"><input type="number" className="w-full text-center font-black" value={item.rate} onChange={(e) => updateItem(index, 'rate', e.target.value)} /></div>
                    <div className="col-span-2 text-right font-black text-blue-900 flex justify-end gap-3">
                      {currency}{(item.qty * item.rate).toLocaleString()}
                      <button onClick={() => removeItem(item.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity no-print"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setItems([...items, { id: Date.now(), desc: '', qty: 1, rate: 0 }])} className="mt-4 text-blue-900 font-black text-xs flex items-center gap-1 no-print bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 shadow-sm">
                <Plus size={18}/> ADD NEW ITEM
              </button>
            </div>

            {/* BOTTOM SECTION */}
            <div className="flex flex-col md:flex-row justify-between gap-16">
              <div className="flex-1 space-y-8">
                <div>
                  <label className={labelStyle}>Important Notes</label>
                  <textarea className={inputStyle} style={{height: '100px'}} placeholder="Add any extra information here..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <div>
                  <label className={labelStyle}>Terms & Conditions</label>
                  <textarea className={inputStyle} style={{height: '100px'}} placeholder="Payment details, Bank info, etc..." value={terms} onChange={(e) => setTerms(e.target.value)} />
                </div>
              </div>

              <div className="w-80 space-y-4 bg-blue-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="flex justify-between text-xs font-bold opacity-70"><span>Subtotal</span><span>{currency}{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-xs font-bold opacity-70">
                   <span>Tax (%)</span>
                   <input type="number" className="w-16 bg-white/20 rounded text-right p-1 outline-none" value={tax} onChange={(e) => setTax(e.target.value)} />
                </div>
                <div className="flex justify-between items-center text-xs font-bold opacity-70">
                   <span>Discount (%)</span>
                   <input type="number" className="w-16 bg-white/20 rounded text-right p-1 outline-none" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                </div>
                <div className="flex justify-between items-center mb-4">
  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Payment Status</span>
  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
    status === 'Paid' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white animate-pulse'
  }`}>
    {status}
  </span>
</div>
                <div className="flex justify-between text-3xl font-black pt-4 border-t border-white/20"><span>Total</span><span>{currency}{total.toLocaleString()}</span></div>
                <div className="flex justify-between items-center pt-4 text-sm font-black text-blue-200">
                  <span>Balance Due</span>
                  <span>{currency}{balanceDue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* SIGNATURE */}
            

          </div>
        </main>
      </div>
    </div>
  );
}