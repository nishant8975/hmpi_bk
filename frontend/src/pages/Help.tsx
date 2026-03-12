import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Book, 
  Calculator, 
  Activity, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  Mail,
  Phone,
  Users,
  CheckCircle2,
  Download,
  Zap,
  Globe
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('common');
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    { q: "What is the Heavy Metal Pollution Index (HMPI)?", a: "The HMPI is a weighted arithmetic mean method used to monitor the total pollution of heavy metals in water bodies. It simplifies complex analytical data into a single score for easier policy decision-making." },
    { q: "How is HMPI calculated?", a: "It involves calculating sub-index values for each metal based on observed concentrations vs. standard permissible limits, then applying weightage based on the inverse of those limits." },
    { q: "How does 'Action Tracking' work for the public?", a: "When index scores exceed 'High Risk' thresholds, the system automatically logs a policy action item which is then tracked through government response phases." },
    { q: "What format should researchers use for data uploads?", a: "We support .CSV and .XLSX files. Each row must contain a timestamp, Lat/Long coordinates, and at least three metal concentration values in μg/L." },
    { q: "Are regional reports available for all users?", a: "General summaries are public. Granular station-level reports require a Research or Admin level account." }
  ];

  const metals = [
    { sym: "As", name: "Arsenic", val: "10 μg/L" },
    { sym: "Cd", name: "Cadmium", val: "3 μg/L" },
    { sym: "Cr", name: "Chromium", val: "50 μg/L" },
    { sym: "Cu", name: "Copper", val: "2000 μg/L" },
    { sym: "Fe", name: "Iron", val: "300 μg/L" },
    { sym: "Mn", name: "Manganese", val: "400 μg/L" },
    { sym: "Ni", name: "Nickel", val: "70 μg/L" },
    { sym: "Pb", name: "Lead", val: "10 μg/L" },
    { sym: "Zn", name: "Zinc", val: "3000 μg/L" }
  ];

  return (
    <div className="min-h-screen bg-[#020817] text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Top Navigation / Back Button */}
        <div className="mb-8 flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          
          <div className="hidden md:flex items-center gap-4 text-xs text-slate-500 uppercase tracking-widest">
            <span>Documentation</span>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <span>Support</span>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <span>v2.4.0</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-[#020817] border border-slate-800 p-12 mb-10 text-center">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-20 -mt-20 animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600/10 blur-[80px] rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
            <div className="w-[500px] h-[500px] border-[1px] border-white rounded-full"></div>
            <div className="w-[400px] h-[400px] border-[1px] border-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="w-[300px] h-[300px] border-[1px] border-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          </div>

          <div className="relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4 border border-blue-500/20">Knowledge Base</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">help you</span> today?
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-lg">
              Explore our comprehensive documentation, scientific methodology, and support channels to make the most of the HMPI Analyzer platform.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all">
                <Book className="w-4 h-4" /> Quick Start Guide
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 rounded-xl font-semibold transition-all">
                <Mail className="w-4 h-4" /> Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { icon: <FileText className="text-blue-400" />, title: "Upload Guide", desc: "Data preparation and CSV formatting requirements.", color: "blue" },
            { icon: <Calculator className="text-emerald-400" />, title: "HMPI Formula", desc: "Deep dive into the mathematical weighting and index.", color: "emerald" },
            { icon: <Activity className="text-purple-400" />, title: "Action Tracking", desc: "Learn how alerts turn into real-world policy actions.", color: "purple" },
            { icon: <Download className="text-orange-400" />, title: "Report Exports", desc: "Generating PDFs and regional comparisons for briefings.", color: "orange" },
          ].map((item, i) => (
            <div key={i} className="group p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer">
              <div className={`w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h3 className="text-white font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Tabs Control */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-800/50 pb-px">
          <div className="flex gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
            <button 
              onClick={() => setActiveTab('common')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'common' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Common Questions
            </button>
            <button 
              onClick={() => setActiveTab('scientific')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'scientific' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Scientific Methodology
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-500 font-bold tracking-widest uppercase">
            <CheckCircle2 className="w-3 h-3 text-blue-500" />
            Verified WHO Guidelines (2022)
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          <div className="lg:col-span-2 space-y-4">
            {activeTab === 'common' ? (
              <div className="bg-slate-900/20 border border-slate-800/50 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">Frequently Asked Questions</h2>
                <p className="text-slate-500 text-sm text-center mb-8">Everything you need to know about the platform and its features.</p>
                <div className="space-y-2">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="border-b border-slate-800 last:border-0">
                      <button 
                        onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                        className="w-full flex items-center justify-between py-5 text-left group"
                      >
                        <span className={`font-medium transition-colors ${openFaq === idx ? 'text-blue-400' : 'text-slate-300 group-hover:text-white'}`}>
                          {faq.q}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openFaq === idx ? 'rotate-180 text-blue-400' : ''}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/20 border border-slate-800/50 rounded-3xl p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider">Calculation Standards</h2>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {metals.map((m, i) => (
                    <div key={i} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-center group hover:border-blue-500/30 transition-all">
                      <div className="text-blue-400 font-bold mb-1 text-lg">{m.sym}</div>
                      <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-tight">{m.name}</div>
                      <div className="text-xs font-mono text-slate-300">{m.val}</div>
                    </div>
                  ))}
                </div>
                <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-4">
                  <Globe className="w-5 h-5 text-blue-400 mt-1" />
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wide">Global Positioning</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Our platform uses Inverse Distance Weighting (IDW) for spatial interpolation between sampling sites to provide the "Regional Comparison" heatmap data.
                    </p>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center justify-center gap-2 mx-auto">
                    <Download className="w-4 h-4" /> Download Full Scientific Paper (PDF)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* Index Guide */}
            <div className="bg-gradient-to-b from-blue-600/20 to-transparent border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>
               <h3 className="text-xl font-bold text-white mb-1 text-center">Index Scores</h3>
               <p className="text-xs text-blue-300/60 text-center mb-6">Risk classification thresholds</p>
               
               <div className="space-y-2">
                 {[
                   { label: "Safe", val: "≤ 100", color: "bg-emerald-500/20 text-emerald-400" },
                   { label: "Moderate", val: "101-200", color: "bg-yellow-500/20 text-yellow-400" },
                   { label: "High Risk", val: "201-300", color: "bg-orange-500/20 text-orange-400" },
                   { label: "Critical", val: "> 300", color: "bg-red-500/20 text-red-400" }
                 ].map((row, i) => (
                   <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/50">
                     <span className="text-xs text-slate-400 font-medium">{row.label}</span>
                     <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${row.color}`}>{row.val}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* Contact Card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-white font-bold mb-6 text-center text-sm uppercase tracking-widest">Contact Channels</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-white font-bold">Priority Support</div>
                    <div className="text-[10px] text-slate-500">+91 (020) 2440 XXXX</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-white font-bold">Research Forum</div>
                    <div className="text-[10px] text-slate-500">community.hmpi.org</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 rounded-2xl bg-[#020817] border border-slate-800 text-center">
                <div className="text-blue-400 text-[10px] font-bold uppercase mb-1">Availability</div>
                <div className="text-sm text-white font-medium mb-1">Mon - Fri, 9:00 - 18:00 IST</div>
                <div className="text-[10px] text-slate-500 italic">Avg. response: 24 hours</div>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Form Footer */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-10 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Direct Inquiries</h3>
          </div>
          <p className="text-sm text-slate-500 mb-8">Send a detailed message to our environmental analysts.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2 ml-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  className="w-full bg-[#020817] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-700"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2 ml-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="john@example.com" 
                  className="w-full bg-[#020817] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2 ml-1">Message</label>
              <textarea 
                placeholder="How can we assist you with HMPI analysis?"
                className="w-full bg-[#020817] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-700 resize-none"
              ></textarea>
            </div>
          </div>
          
          <div className="mt-8">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all">
              Send Inquiry
            </button>
          </div>
        </div>
        
        <div className="mt-12 text-center text-[10px] text-slate-600 uppercase tracking-[0.2em]">
          &copy; 2026 Heavy Metal Pollution Index Dashboard | Advanced Environmental Analytics
        </div>
      </div>
    </div>
  );
};

export default App;