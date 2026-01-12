
import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  History, 
  LayoutDashboard, 
  Camera, 
  MapPin, 
  User, 
  LogOut, 
  CheckCircle, 
  ChevronRight,
  FileText,
  Calendar as CalendarIcon,
  ShieldCheck
} from 'lucide-react';
import { AttendanceRecord, UserProfile, AttendanceStatus } from './types';
import { AttendanceDashboard } from './components/AttendanceDashboard';

const DEFAULT_USER: UserProfile = {
  id: 'u101',
  name: 'Ustadz Ahmad Fauzi',
  role: 'Pengajar Madrasah',
  unit: 'Unit Aliyah',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lapor' | 'riwayat' | 'dashboard'>('lapor');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [currentUser] = useState<UserProfile>(DEFAULT_USER);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<AttendanceStatus>('Hadir');
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mahasina_reports');
    if (saved) setRecords(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('mahasina_reports', JSON.stringify(records));
  }, [records]);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAbsen = async (type: 'In' | 'Out') => {
    setLoading(true);
    let location = undefined;
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
      location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch (e) { console.warn("Location error"); }

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
      type,
      status,
      note,
      photo: photo || undefined,
      location
    };

    setRecords(prev => [newRecord, ...prev]);
    setSuccessMsg(`Laporan ${type === 'In' ? 'Kehadiran' : 'Selesai Tugas'} Berhasil Terkirim!`);
    setNote(''); setPhoto(null); setLoading(false);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 flex flex-col lg:flex-row font-['Inter']">
      
      {/* Sidebar - Desktop Mahasina Theme */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-emerald-950 text-white flex-col shadow-2xl z-20">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/30">
              <ShieldCheck className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">Smart Report</h1>
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] mt-1">Mahasina</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-3">
          <button 
            onClick={() => setActiveTab('lapor')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'lapor' ? 'bg-emerald-900 text-white shadow-lg border border-white/5' : 'text-emerald-100/40 hover:text-white hover:bg-emerald-900/40'}`}
          >
            <div className="flex items-center space-x-3">
              <ClipboardCheck size={20} />
              <span className="font-bold text-sm">Laporan Harian</span>
            </div>
            {activeTab === 'lapor' && <ChevronRight size={16} />}
          </button>
          
          <button 
            onClick={() => setActiveTab('riwayat')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'riwayat' ? 'bg-emerald-900 text-white shadow-lg border border-white/5' : 'text-emerald-100/40 hover:text-white hover:bg-emerald-900/40'}`}
          >
            <div className="flex items-center space-x-3">
              <History size={20} />
              <span className="font-bold text-sm">Log Aktivitas</span>
            </div>
            {activeTab === 'riwayat' && <ChevronRight size={16} />}
          </button>

          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-emerald-900 text-white shadow-lg border border-white/5' : 'text-emerald-100/40 hover:text-white hover:bg-emerald-900/40'}`}
          >
            <div className="flex items-center space-x-3">
              <LayoutDashboard size={20} />
              <span className="font-bold text-sm">Dashboard Rekap</span>
            </div>
            {activeTab === 'dashboard' && <ChevronRight size={16} />}
          </button>
        </nav>

        <div className="p-8 bg-black/10">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img src={currentUser.avatar} alt="Profile" className="w-12 h-12 rounded-2xl border-2 border-emerald-500/30" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-emerald-950 rounded-full"></div>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black truncate">{currentUser.name}</p>
              <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">{currentUser.unit}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 min-h-screen pb-32 lg:pb-16">
        <div className="max-w-6xl mx-auto px-6 pt-12 lg:px-12">
          
          <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 text-emerald-600 mb-2">
                <CalendarIcon size={16} />
                <span className="text-xs font-black uppercase tracking-[0.2em]">
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-none">
                {activeTab === 'lapor' ? 'Kirim Laporan' : activeTab === 'riwayat' ? 'Arsip Laporan' : 'Dashboard Rekap'}
              </h2>
            </div>
            
            <div className="bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100 flex items-center space-x-3 shadow-sm">
               <User className="text-emerald-600" size={18} />
               <span className="text-sm font-black text-emerald-900">{currentUser.name}</span>
            </div>
          </header>

          {successMsg && (
            <div className="mb-10 bg-emerald-600 text-white px-8 py-5 rounded-[2rem] flex items-center justify-between shadow-2xl shadow-emerald-200 animate-in slide-in-from-top duration-500">
              <div className="flex items-center">
                <CheckCircle className="mr-4" size={28} />
                <span className="font-black text-lg">{successMsg}</span>
              </div>
            </div>
          )}

          {activeTab === 'lapor' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Form Laporan */}
              <div className="lg:col-span-7 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <div className="flex items-center space-x-4 mb-10">
                   <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                      <FileText size={24} />
                   </div>
                   <h3 className="text-2xl font-black text-slate-800">Formulir Harian</h3>
                </div>

                <div className="space-y-10">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Status Kehadiran</label>
                    <div className="flex flex-wrap gap-3">
                      {(['Hadir', 'Izin', 'Sakit', 'Terlambat'] as AttendanceStatus[]).map(s => (
                        <button
                          key={s}
                          onClick={() => setStatus(s)}
                          className={`px-8 py-4 rounded-[1.25rem] text-sm font-black transition-all duration-300 ${status === s ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Dokumentasi (Selfie/Foto)</label>
                    <label className="group relative block w-full h-72 border-2 border-dashed border-slate-200 rounded-[2.5rem] cursor-pointer hover:border-emerald-400 transition-all overflow-hidden bg-slate-50/50">
                      {photo ? (
                        <img src={photo} className="absolute inset-0 w-full h-full object-cover rounded-[2.5rem]" alt="Capture" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 shadow-sm transition-all duration-300 group-hover:scale-110">
                            <Camera size={32} />
                          </div>
                          <div className="text-center">
                            <p className="text-base font-black text-slate-600">Klik Untuk Memotret</p>
                            <p className="text-xs text-slate-400 font-medium">Pastikan dokumentasi terlihat jelas</p>
                          </div>
                        </div>
                      )}
                      <input type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhotoCapture} />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Ringkasan Aktivitas</label>
                    <textarea 
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Apa yang Anda kerjakan hari ini? Berikan detail singkat..."
                      className="w-full p-6 rounded-[2rem] border border-slate-200 bg-slate-50/50 focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 focus:outline-none h-40 transition-all text-sm font-bold placeholder:text-slate-300"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <button 
                      disabled={loading || !photo}
                      onClick={() => handleAbsen('In')}
                      className="flex items-center justify-center space-x-3 bg-emerald-600 text-white py-5 rounded-[1.5rem] font-black shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50 active:scale-95 text-lg"
                    >
                      <CheckCircle size={24} />
                      <span>Kirim Laporan</span>
                    </button>
                    <button 
                      disabled={loading || !photo}
                      onClick={() => handleAbsen('Out')}
                      className="flex items-center justify-center space-x-3 bg-slate-900 text-white py-5 rounded-[1.5rem] font-black shadow-2xl shadow-slate-200 hover:bg-black transition-all disabled:opacity-50 active:scale-95 text-lg"
                    >
                      <LogOut size={24} />
                      <span>Selesai Tugas</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Lokasi & Info */}
              <div className="lg:col-span-5 space-y-10">
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                  <h4 className="font-black text-slate-800 mb-8 flex items-center">
                    <MapPin className="mr-3 text-emerald-500" size={24} /> Titik Pelaporan
                  </h4>
                  <div className="relative h-64 rounded-[2rem] overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={`https://picsum.photos/seed/mahasina-location/800/600`} className="w-full h-full object-cover opacity-50 mix-blend-multiply grayscale" alt="Map" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="bg-white px-6 py-3 rounded-full shadow-2xl border border-emerald-100 flex items-center space-x-3 animate-pulse">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                          <span className="text-xs font-black text-slate-700 tracking-wider">LOKASI TERVERIFIKASI</span>
                       </div>
                    </div>
                  </div>
                  <p className="mt-5 text-[10px] text-slate-400 text-center font-black uppercase tracking-widest leading-relaxed">Sistem mendeteksi koordinat Anda secara otomatis demi validitas data.</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                  <h4 className="font-black text-2xl mb-4">Akses Terbatas</h4>
                  <p className="text-emerald-50 text-sm leading-relaxed mb-8 opacity-80 font-medium">
                    Setiap data yang Anda kirim akan melalui proses validasi oleh pimpinan unit untuk memastikan standar pelaporan Mahasina terjaga.
                  </p>
                  <div className="flex items-center space-x-3 text-white font-black text-xs uppercase tracking-[0.2em]">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    <span>Data Terarsip Aman</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'riwayat' && (
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom duration-700">
              <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
                <h3 className="text-2xl font-black text-slate-800 flex items-center">
                  <span className="w-2 h-8 bg-emerald-500 rounded-full mr-4"></span>
                  Log Laporan Hari Ini
                </h3>
                <div className="flex items-center bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Monitoring</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pengirim</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Waktu & Tipe</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Keterangan</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Foto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-10 py-32 text-center">
                           <div className="flex flex-col items-center opacity-20">
                              <FileText size={64} className="mb-6" />
                              <p className="font-black text-2xl uppercase tracking-tighter">Log Masih Kosong</p>
                              <p className="text-sm font-medium">Laporan hari ini akan muncul di sini setelah dikirim.</p>
                           </div>
                        </td>
                      </tr>
                    ) : (
                      records.map((record) => (
                        <tr key={record.id} className="hover:bg-emerald-50/20 transition-all duration-300 group">
                          <td className="px-10 py-8">
                            <div className="flex items-center space-x-5">
                              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-[1.25rem] flex items-center justify-center font-black text-lg border border-emerald-100 group-hover:scale-110 transition-transform shadow-sm">
                                {record.userName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-base font-black text-slate-800 leading-none">{record.userName}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{currentUser.unit}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center space-x-2 mb-1.5">
                               <span className={`w-2 h-2 rounded-full ${record.type === 'In' ? 'bg-emerald-500' : 'bg-slate-900'}`}></span>
                               <span className="text-sm font-black text-slate-700">{record.type === 'In' ? 'MASUK' : 'PULANG'}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-black tracking-widest">{new Date(record.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
                          </td>
                          <td className="px-10 py-8">
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${record.status === 'Hadir' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-10 py-8">
                             <p className="text-xs text-slate-500 font-medium max-w-[200px] truncate">{record.note || '-'}</p>
                          </td>
                          <td className="px-10 py-8">
                            {record.photo && (
                              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-lg group-hover:scale-125 transition-all duration-500 z-10">
                                <img src={record.photo} className="w-full h-full object-cover" alt="Bukti" />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && <AttendanceDashboard records={records} />}
        </div>
      </main>

      {/* Mobile Navigation - Mahasina Style */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 bg-emerald-950/95 backdrop-blur-xl border border-white/10 flex justify-around p-4 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem]">
        <button 
          onClick={() => setActiveTab('lapor')}
          className={`flex flex-col items-center p-4 rounded-3xl transition-all duration-500 ${activeTab === 'lapor' ? 'bg-emerald-500 text-white shadow-2xl shadow-emerald-500/50 -mt-12 scale-110' : 'text-emerald-100/40'}`}
        >
          <Camera size={28} />
          {activeTab !== 'lapor' && <span className="text-[9px] mt-1 font-black uppercase tracking-widest">Lapor</span>}
        </button>
        <button 
          onClick={() => setActiveTab('riwayat')}
          className={`flex flex-col items-center p-3 transition-all duration-300 ${activeTab === 'riwayat' ? 'text-emerald-400 scale-110' : 'text-emerald-100/40'}`}
        >
          <History size={26} />
          <span className="text-[9px] mt-1 font-black uppercase tracking-widest">Arsip</span>
        </button>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center p-3 transition-all duration-300 ${activeTab === 'dashboard' ? 'text-emerald-400 scale-110' : 'text-emerald-100/40'}`}
        >
          <LayoutDashboard size={26} />
          <span className="text-[9px] mt-1 font-black uppercase tracking-widest">Rekap</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
