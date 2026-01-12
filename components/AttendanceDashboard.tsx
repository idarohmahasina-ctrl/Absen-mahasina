
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AttendanceRecord } from '../types';
import { getAttendanceInsights } from '../services/geminiService';
import { Brain, TrendingUp, Users, Clock, Award, ListChecks, Calendar as CalendarIcon } from 'lucide-react';

interface Props {
  records: AttendanceRecord[];
}

const COLORS = ['#059669', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

export const AttendanceDashboard: React.FC<Props> = ({ records }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Stats for the recap cards
  const stats = useMemo(() => {
    const total = records.length;
    const hadir = records.filter(r => r.status === 'Hadir').length;
    const izinSakit = records.filter(r => r.status === 'Izin' || r.status === 'Sakit').length;
    const terlambat = records.filter(r => r.status === 'Terlambat').length;
    const disciplineRate = total > 0 ? Math.round((hadir / total) * 100) : 0;

    return { total, hadir, izinSakit, terlambat, disciplineRate };
  }, [records]);

  // Data for Charts
  const pieData = useMemo(() => {
    const counts = records.reduce((acc: any, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [records]);

  const barData = useMemo(() => {
    const dateCounts = records.reduce((acc: any, curr) => {
      const date = new Date(curr.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(dateCounts).slice(-7).map(key => ({ date: key, total: dateCounts[key] }));
  }, [records]);

  // Table Recap per User
  const userRecap = useMemo(() => {
    const recap: Record<string, any> = {};
    records.forEach(r => {
      if (!recap[r.userName]) {
        recap[r.userName] = { name: r.userName, hadir: 0, izin: 0, sakit: 0, terlambat: 0, total: 0 };
      }
      recap[r.userName].total += 1;
      if (r.status === 'Hadir') recap[r.userName].hadir += 1;
      else if (r.status === 'Izin') recap[r.userName].izin += 1;
      else if (r.status === 'Sakit') recap[r.userName].sakit += 1;
      else if (r.status === 'Terlambat') recap[r.userName].terlambat += 1;
    });
    return Object.values(recap).sort((a, b) => b.hadir - a.hadir);
  }, [records]);

  const handleGenerateInsight = async () => {
    setLoadingInsight(true);
    const result = await getAttendanceInsights(records);
    setInsight(result);
    setLoadingInsight(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Recap Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-50 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Users size={24}/></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Laporan</p>
            <p className="text-2xl font-black text-slate-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-50 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Award size={24}/></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hadir</p>
            <p className="text-2xl font-black text-slate-800">{stats.hadir}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-50 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Clock size={24}/></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keterlambatan</p>
            <p className="text-2xl font-black text-slate-800">{stats.terlambat}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-50 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><TrendingUp size={24}/></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Disiplin</p>
            <p className="text-2xl font-black text-slate-800">{stats.disciplineRate}%</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center">
            <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3"></span>
            Proporsi Status
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={105}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="outline-none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
             {pieData.map((item, idx) => (
               <div key={idx} className="flex items-center space-x-2">
                 <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.name} ({item.value})</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center">
            <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3"></span>
            Tren 7 Hari Terakhir
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" fill="#10B981" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Recap Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 flex items-center">
            <ListChecks className="mr-3 text-emerald-500" size={24} />
            Rekapitulasi Kehadiran Individu
          </h3>
          <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full flex items-center space-x-2">
            <CalendarIcon size={14} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Semester Ganjil</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Karyawan/Pengajar</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Hadir</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Izin</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Sakit</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Terlambat</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Total Laporan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {userRecap.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-slate-400 font-medium italic">Data rekapitulasi belum tersedia.</td>
                </tr>
              ) : (
                userRecap.map((user, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-700 font-bold shadow-sm">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center font-bold text-emerald-600 bg-emerald-50/20">{user.hadir}</td>
                    <td className="px-8 py-6 text-center font-bold text-amber-600">{user.izin}</td>
                    <td className="px-8 py-6 text-center font-bold text-slate-500">{user.sakit}</td>
                    <td className="px-8 py-6 text-center font-bold text-red-500">{user.terlambat}</td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-3 py-1 bg-slate-100 rounded-lg font-black text-slate-600 text-xs">
                        {user.total}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-emerald-400/20"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center space-x-6">
              <div className="p-5 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/20">
                <Brain size={40} className="text-emerald-300" />
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-tight">AI Smart Analytics</h3>
                <p className="text-emerald-100 opacity-80 mt-1 max-w-md">Laporan ringkasan otomatis bertenaga AI untuk membantu pengambilan keputusan pimpinan.</p>
              </div>
            </div>
            <button 
              onClick={handleGenerateInsight}
              disabled={loadingInsight || records.length === 0}
              className="px-10 py-4 bg-white text-emerald-900 font-black rounded-2xl hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-950/30 disabled:opacity-50 active:scale-95 whitespace-nowrap"
            >
              {loadingInsight ? 'MENGANALISIS...' : 'GENERATE INSIGHT AI'}
            </button>
          </div>
          
          {insight && (
            <div className="mt-10 p-8 bg-black/20 rounded-[2rem] backdrop-blur-md border border-white/10 prose prose-invert max-w-none shadow-inner">
              <div className="whitespace-pre-wrap text-emerald-50 leading-relaxed font-medium">{insight}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
