const [history, setHistory] = useState([]);

useEffect(() => {
  const data = JSON.parse(localStorage.getItem('public_history') || "[]");
  setHistory(data);
}, []);

const deleteInvoice = (id) => {
  const filtered = history.filter(inv => inv.id !== id);
  setHistory(filtered);
  localStorage.setItem('public_history', JSON.stringify(filtered));
};

const clearEverything = () => {
  if(window.confirm("Erase all local invoices?")) {
    localStorage.removeItem('public_history');
    setHistory([]);
  }
};