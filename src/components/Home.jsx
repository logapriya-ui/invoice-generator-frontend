import { ArrowRight, FileText, ShieldCheck, Zap, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    { q: "What are the different types of invoices?", a: "Common types include standard invoices, proforma invoices, recurring invoices, and credit invoices." },
    { q: "Why is it important to add a due date on the invoice?", a: "A due date ensures timely payments and helps businesses manage cash flow effectively." },
    { q: "Can I customize this invoice?", a: "Yes, you can customize logos, colors, invoice formats, and terms." },
    { q: "What is a proforma invoice?", a: "A proforma invoice is a preliminary bill issued before goods or services are delivered." },
    { q: "Can I edit my invoices later?", a: "Yes, invoices can be edited before final submission or reissued if required." }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl font-black tracking-tighter text-blue-900">
          PRO<span className="text-blue-600">-</span>INVOICE
        </h1>

        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">
            Login
          </Link>
          <Link to="/signup">
            <button className="px-6 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all shadow-lg shadow-blue-200">
              Get Started
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 text-center bg-gradient-to-b from-blue-50/50 to-white">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          Trusted by 10,000+ Businesses
        </div>

        <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">
          Professional Invoices.<br />
          <span className="text-blue-600">Zero Effort.</span>
        </h2>

        <p className="text-slate-600 max-w-2xl mx-auto mb-12 text-lg leading-relaxed">
          Create GST-compliant invoices, track payments, and manage your 
          entire billing cycle in a clean, professional interface.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <button className="group inline-flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:-translate-y-1">
              Create New Invoice <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <button className="px-10 py-4 border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition">
            View Sample
          </button>
        </div>
      </section>

      {/* Info Section */}
      {/* How to Create Invoice - Improved Section */}
<section className="bg-slate-50 py-24 px-6">
  <div className="max-w-6xl mx-auto">
    <div className="grid lg:grid-cols-2 gap-16 items-center">
      
      {/* Left Column: Visual Representation */}
      <div className="relative">
        <div className="absolute -inset-4 bg-blue-600/5 rounded-[2.5rem] rotate-2"></div>
        <div className="relative bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100">
          <div className="flex items-center justify-between mb-8 border-b pb-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">Live Preview</div>
          </div>
          
          {/* Skeleton UI for Invoice */}
          <div className="space-y-4">
            <div className="h-8 w-32 bg-blue-900 rounded-md mb-8"></div>
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-slate-100 rounded"></div>
                <div className="h-3 w-32 bg-slate-100 rounded"></div>
              </div>
              <div className="h-12 w-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-400">Logo</div>
            </div>
            <div className="pt-8 space-y-3">
              <div className="h-4 w-full bg-slate-50 rounded"></div>
              <div className="h-4 w-full bg-slate-50 rounded"></div>
              <div className="h-4 w-2/3 bg-slate-50 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Step-by-Step Stepper */}
      <div className="space-y-10">
        <div>
          <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            Create professional bills <br/>
            <span className="text-blue-600 underline decoration-blue-100 underline-offset-8">in under 60 seconds.</span>
          </h3>
          <p className="text-slate-600 text-lg">
            Our intuitive generator handles all the complex formatting and calculations for you.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { 
              step: "01", 
              title: "Customize Identity", 
              desc: "Upload your business logo and select 'Royal Blue' branding to match your company's professional look." 
            },
            { 
              step: "02", 
              title: "Smart Fill Data", 
              desc: "Add client details and line items. Our system automatically calculates GST, discounts, and totals." 
            },
            { 
              step: "03", 
              title: "Seamless Export", 
              desc: "Generate a secure PDF link or send the invoice directly to your client's inbox with one click." 
            }
          ].map((item, index) => (
            <div key={index} className="group flex items-start gap-6 p-6 rounded-2xl transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 border border-transparent hover:border-slate-100">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                {item.step}
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  </div>
</section>

      {/* Features Cards */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <FileText className="text-blue-600" />, title: "Business Details", desc: "Keep your GST, address, and contact info saved for one-click invoicing." },
              { icon: <Zap className="text-blue-600" />, title: "Automation", desc: "Automated recurring billing and payment reminders for late clients." },
              { icon: <ShieldCheck className="text-blue-600" />, title: "Payment Info", desc: "Securely add bank details, UPI IDs, or international wire instructions." }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 bg-white border border-slate-200 rounded-3xl hover:border-blue-300 transition-all hover:shadow-xl group">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <h3 className="text-3xl font-bold text-slate-900 text-center mb-12">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-slate-200 rounded-2xl overflow-hidden transition-all hover:border-blue-200">
              <button 
                className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-slate-50 transition"
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              >
                <span className="font-bold text-slate-800">{faq.q}</span>
                <div className={`transition-transform duration-300 ${openFAQ === index ? 'rotate-180' : ''}`}>
                   <Plus size={20} className={openFAQ === index ? 'text-blue-600' : 'text-slate-400'} />
                </div>
              </button>
              {openFAQ === index && (
                <div className="px-6 pb-6 text-slate-500 bg-white text-sm leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div>
            <h1 className="text-2xl font-black tracking-tighter mb-4">
              PRO<span className="text-blue-400">-</span>INVOICE
            </h1>
            <p className="text-slate-400 text-sm">
              Simplifying billing for modern enterprises and creative freelancers worldwide.
            </p>
          </div>
          <div className="flex gap-16 md:justify-center">
            <div className="space-y-2 text-sm">
              <div className="font-bold text-white mb-4">Product</div>
              <div className="text-slate-400 hover:text-white cursor-pointer">Features</div>
              <div className="text-slate-400 hover:text-white cursor-pointer">Pricing</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="font-bold text-white mb-4">Support</div>
              <div className="text-slate-400 hover:text-white cursor-pointer">Help Center</div>
              <div className="text-slate-400 hover:text-white cursor-pointer">Contact</div>
            </div>
          </div>
          <div className="md:text-right">
            <button className="bg-blue-600 px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-500 transition">Subscribe Now</button>
            <div className="mt-8 text-xs text-slate-500">
              © 2026 Invoice Generator. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}