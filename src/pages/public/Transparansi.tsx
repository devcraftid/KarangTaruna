import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

export default function Transparansi() {
  const [realtimeTrigger, setRealtimeTrigger] = useState(0)

  useEffect(() => {
    const incomeSub = supabase.channel('public:income').on('postgres_changes', { event: '*', schema: 'public', table: 'income' }, () => setRealtimeTrigger(prev => prev + 1)).subscribe()
    const expenseSub = supabase.channel('public:expenses').on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => setRealtimeTrigger(prev => prev + 1)).subscribe()
    return () => { supabase.removeChannel(incomeSub); supabase.removeChannel(expenseSub) }
  }, [])

  // Fetch data
  const { data: income = [] } = useQuery({ 
    queryKey: ['public-income', realtimeTrigger], 
    queryFn: async () => { 
      const { data, error } = await supabase.from('income').select('*').eq('status', 'verified').order('tanggal', { ascending: false });
      if (error) throw error; return data || []
    } 
  })
  
  const { data: expenses = [] } = useQuery({ 
    queryKey: ['public-expenses', realtimeTrigger], 
    queryFn: async () => { 
      const { data, error } = await supabase.from('expenses').select('*').order('tanggal', { ascending: false });
      if (error) throw error; return data || []
    } 
  })

  const { data: programs = [] } = useQuery({
    queryKey: ['public-programs-realization'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_programs').select('*').order('created_at', { ascending: false }).limit(3)
      if (error) throw error; return data || []
    }
  })

  const { data: campaigns = [] } = useQuery({
    queryKey: ['public-campaigns-active'],
    queryFn: async () => {
      const { data, error } = await supabase.from('patungan_campaigns').select('*').eq('status', 'aktif').limit(2)
      if (error) throw error; return data || []
    }
  })

  const { data: sponsors = [] } = useQuery({
    queryKey: ['public-sponsors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sponsors').select('*').limit(4)
      if (error) throw error; return data || []
    }
  })

  const { data: documents = [] } = useQuery({
    queryKey: ['public-documents-reports'],
    queryFn: async () => {
      const { data, error } = await supabase.from('documents').select('*').eq('is_public', true).order('created_at', { ascending: false }).limit(3)
      if (error) throw error; return data || []
    }
  })

  // Calculations
  const totalIncome = income.reduce((sum, item) => sum + Number(item.nominal), 0)
  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.nominal), 0)
  const totalDonasi = income.filter(i => i.kategori?.toLowerCase() === 'donasi').reduce((sum, item) => sum + Number(item.nominal), 0)
  const saldo = totalIncome - totalExpense
  const realisasiPersen = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0

  const formatRupiah = (angka: number) => {
    if (angka >= 1000000) return `Rp ${(angka / 1000000).toFixed(1)}M`
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)
  }
  const formatRupiahFull = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)

  // Transaction History Combine
  const transactions = useMemo(() => {
    const all = [
      ...income.map(i => ({ ...i, type: 'Pemasukan', sourceTitle: i.nama_donatur || 'Donatur', titleDesc: i.keterangan || 'Donasi' })),
      ...expenses.map(e => ({ ...e, type: 'Pengeluaran', sourceTitle: e.nama_pengeluaran || 'Pengeluaran', titleDesc: e.keterangan || 'Operasional' }))
    ]
    return all.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
  }, [income, expenses])

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const totalPages = Math.ceil(transactions.length / itemsPerPage)
  const currentTransactions = transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="bg-md-surface text-md-on-surface font-inter selection:bg-md-primary-fixed selection:text-md-on-primary-fixed w-full min-h-screen">
      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-12">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="bg-md-secondary-container text-md-on-secondary-container px-3 py-1 rounded-full text-xs font-semibold mb-4 inline-block uppercase tracking-wider">Amanah & Transparan</span>
              <h1 className="font-extrabold text-4xl md:text-5xl text-md-primary mb-4 leading-tight">Transparansi Kas Karang Taruna</h1>
              <p className="text-lg text-md-on-surface-variant">Komitmen kami terhadap keterbukaan finansial sebagai bentuk tanggung jawab organisasi kepada masyarakat. Pantau alokasi dana untuk setiap program pemberdayaan pemuda.</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm font-semibold text-md-outline">Terakhir diperbarui:</p>
              <p className="text-2xl font-bold text-md-secondary">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </section>

        {/* Summary Grid (Bento Style) */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Main Balance Card */}
          <div className="md:col-span-2 bg-md-primary-container text-md-on-primary-container p-6 md:p-8 rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-between h-64 border border-md-primary/20">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-md-primary-fixed/10 rounded-full blur-3xl"></div>
            <div className="z-10">
              <p className="text-sm font-semibold opacity-80 mb-2 uppercase tracking-widest">Saldo Saat Ini</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white">{formatRupiahFull(saldo)}</h2>
            </div>
            <div className="z-10 flex items-center gap-2 text-white/90">
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              <span className="text-sm font-semibold">Tahun Anggaran {new Date().getFullYear()}</span>
            </div>
          </div>

          {/* Stats Column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-md-outline-variant shadow-sm hover:border-md-primary transition-colors">
              <p className="text-xs font-semibold text-md-on-surface-variant mb-1 uppercase">Total Pemasukan</p>
              <p className="text-2xl font-bold text-md-primary">{formatRupiah(totalIncome)}</p>
              <div className="mt-2 h-1 w-full bg-md-surface-variant rounded-full overflow-hidden">
                <div className="bg-green-600 h-full w-[100%]"></div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-md-outline-variant shadow-sm hover:border-md-primary transition-colors">
              <p className="text-xs font-semibold text-md-on-surface-variant mb-1 uppercase">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-md-error">{formatRupiah(totalExpense)}</p>
              <div className="mt-2 h-1 w-full bg-md-surface-variant rounded-full overflow-hidden">
                <div className="bg-md-error h-full" style={{ width: `${Math.min(realisasiPersen, 100)}%` }}></div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-md-outline-variant shadow-sm hover:border-md-primary transition-colors">
              <p className="text-xs font-semibold text-md-on-surface-variant mb-1 uppercase">Realisasi Anggaran</p>
              <p className="text-2xl font-bold text-md-secondary">{realisasiPersen}%</p>
              <div className="mt-2 h-1 w-full bg-md-surface-variant rounded-full overflow-hidden">
                <div className="bg-md-secondary h-full" style={{ width: `${Math.min(realisasiPersen, 100)}%` }}></div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-md-outline-variant shadow-sm hover:border-md-primary transition-colors">
              <p className="text-xs font-semibold text-md-on-surface-variant mb-1 uppercase">Total Donasi</p>
              <p className="text-2xl font-bold text-md-primary">{formatRupiah(totalDonasi)}</p>
              <div className="mt-2 h-1 w-full bg-md-surface-variant rounded-full overflow-hidden">
                <div className="bg-md-primary h-full w-[100%]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h3 className="text-2xl font-bold text-md-primary flex items-center gap-2">
              <span className="material-symbols-outlined">analytics</span> Visualisasi Data Kas
            </h3>
            <div className="flex bg-md-surface-container-low p-1 rounded-lg border border-md-outline-variant self-start sm:self-auto">
              <button className="px-4 py-1.5 rounded-md text-sm font-semibold transition-all hover:bg-white dark:hover:bg-slate-800 active:scale-95">Bulan Ini</button>
              <button className="px-4 py-1.5 rounded-md text-sm font-semibold bg-white dark:bg-slate-800 shadow-sm text-md-primary">Tahun Ini</button>
              <button className="px-4 py-1.5 rounded-md text-sm font-semibold transition-all hover:bg-white dark:hover:bg-slate-800 active:scale-95">Semua Data</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Bar Chart Sim: Pemasukan vs Pengeluaran */}
            <div className="md:col-span-8 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl border border-md-outline-variant">
              <p className="text-sm font-semibold text-md-on-surface-variant mb-6">Tren Pemasukan vs Pengeluaran (6 Bulan Terakhir)</p>
              <div className="h-64 flex items-end justify-around gap-2 md:gap-4 px-2 md:px-4 border-b border-md-outline-variant pb-2">
                {[6, 5, 4, 3, 2, 1].map((m) => (
                  <div key={m} className="flex flex-col items-center flex-1 max-w-[60px]">
                    <div className="flex gap-1 items-end h-full w-full">
                      <div className="bg-md-primary/40 hover:bg-md-primary w-1/2 rounded-t-sm transition-all" style={{ height: `${Math.max(20, 100 - m * 10)}%` }}></div>
                      <div className="bg-md-secondary/60 hover:bg-md-secondary w-1/2 rounded-t-sm transition-all" style={{ height: `${Math.max(10, 80 - m * 15)}%` }}></div>
                    </div>
                    <span className="text-[10px] font-semibold mt-2">{new Date(new Date().setMonth(new Date().getMonth() - m)).toLocaleDateString('id-ID', { month: 'short' }).toUpperCase()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-md-primary rounded-full"></div>
                  <span className="text-xs font-semibold">Pemasukan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-md-secondary rounded-full"></div>
                  <span className="text-xs font-semibold">Pengeluaran</span>
                </div>
              </div>
            </div>

            {/* Pie Chart Sim: Sumber Pemasukan */}
            <div className="md:col-span-4 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl border border-md-outline-variant flex flex-col items-center justify-center">
              <p className="text-sm font-semibold text-md-on-surface-variant mb-6 w-full text-left">Sumber Pemasukan</p>
              <div className="relative w-48 h-48 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" fill="transparent" r="16" stroke="#f1f5f9" strokeWidth="32"></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white dark:bg-slate-900 w-24 h-24 rounded-full flex items-center justify-center shadow-inner">
                    <span className="font-bold text-md-primary">0%</span>
                  </div>
                </div>
              </div>
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-md-primary rounded-full"></div>
                    <span className="text-xs font-semibold">Donasi Umum</span>
                  </div>
                  <span className="text-xs font-bold">0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-md-secondary rounded-full"></div>
                    <span className="text-xs font-semibold">Sponsorship</span>
                  </div>
                  <span className="text-xs font-bold">0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-md-outline rounded-full"></div>
                    <span className="text-xs font-semibold">Iuran Wajib</span>
                  </div>
                  <span className="text-xs font-bold">0%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Program Realization Table */}
        <section className="mb-12">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-md-primary">Realisasi Anggaran Program</h3>
            <p className="text-md-on-surface-variant mt-1">Target vs Realisasi penggunaan dana per divisi/program.</p>
          </div>
          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-md-outline-variant">
            <table className="w-full text-left">
              <thead className="bg-md-surface-container-low border-b border-md-outline-variant">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-md-primary whitespace-nowrap">Nama Program</th>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-md-primary whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-md-primary whitespace-nowrap">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-md-outline-variant">
                {programs.length === 0 ? (
                   <tr><td colSpan={3} className="p-6 text-center text-slate-500">Belum ada program kerja</td></tr>
                ) : programs.map((p, i) => (
                  <tr key={p.id} className="hover:bg-md-surface-container-lowest transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold">{p.nama_program}</p>
                      <p className="text-[12px] text-md-outline">{p.bidang}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 bg-md-primary/10 text-md-primary rounded-full text-xs font-semibold uppercase">{p.status || 'Berjalan'}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-md-surface-variant h-2 min-w-[100px] rounded-full overflow-hidden">
                          <div className="bg-green-600 h-full" style={{ width: `${80 - (i * 10)}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-green-700">{80 - (i * 10)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Transaction History */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-md-primary">Riwayat Transaksi Publik</h3>
              <p className="text-md-on-surface-variant mt-1">Data real-time pengeluaran dan pemasukan organisasi.</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-md-outline">search</span>
                <input className="pl-10 pr-4 py-2 bg-md-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-md-primary w-full md:w-64" placeholder="Cari transaksi..." type="text"/>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-md-outline-variant rounded-lg bg-white dark:bg-slate-900 hover:bg-md-surface-container-low transition-colors active:scale-95">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                <span className="text-sm font-semibold">Filter</span>
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-md-outline-variant overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-md-surface-container-low text-left">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-md-primary whitespace-nowrap">Tanggal</th>
                    <th className="px-6 py-4 text-sm font-semibold text-md-primary whitespace-nowrap">Jenis</th>
                    <th className="px-6 py-4 text-sm font-semibold text-md-primary whitespace-nowrap">Sumber/Tujuan</th>
                    <th className="px-6 py-4 text-sm font-semibold text-md-primary">Keterangan</th>
                    <th className="px-6 py-4 text-sm font-semibold text-right text-md-primary whitespace-nowrap">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-md-outline-variant">
                  {currentTransactions.length === 0 ? (
                    <tr><td colSpan={5} className="p-12 text-center text-slate-500">Belum ada transaksi</td></tr>
                  ) : currentTransactions.map((trx, idx) => (
                    <tr key={idx} className="hover:bg-md-surface-container-lowest transition-colors">
                      <td className="px-6 py-4 font-medium whitespace-nowrap">{new Date(trx.tanggal).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {trx.type === 'Pemasukan' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">Pemasukan</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-md-error uppercase">Pengeluaran</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-md-on-surface-variant whitespace-nowrap">{trx.sourceTitle}</td>
                      <td className="px-6 py-4 text-md-on-surface-variant min-w-[200px]">{trx.titleDesc}</td>
                      <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${trx.type === 'Pemasukan' ? 'text-green-600' : 'text-md-error'}`}>
                        {trx.type === 'Pemasukan' ? '+' : '-'}{formatRupiahFull(Number(trx.nominal))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-md-outline-variant bg-md-surface-container-lowest flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-xs text-md-outline">Menampilkan {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, transactions.length)} dari {transactions.length} transaksi</p>
                <div className="flex gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded hover:bg-md-surface-variant disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                  {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
                    // Logic for simple pagination display
                    let pageNum = currentPage;
                    if (currentPage === 1) pageNum = i + 1;
                    else if (currentPage === totalPages) pageNum = totalPages - 2 + i;
                    else pageNum = currentPage - 1 + i;
                    
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    
                    return (
                      <button 
                        key={pageNum} 
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-2.5 py-1 text-xs font-bold rounded ${currentPage === pageNum ? 'bg-md-primary text-white' : 'hover:bg-md-surface-variant text-md-on-surface'}`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 rounded hover:bg-md-surface-variant disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Donation & Sponsorship */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-md-secondary/5 rounded-2xl p-6 md:p-8 border border-md-secondary/20 flex flex-col justify-between">
            <div>
              <h4 className="text-2xl font-bold text-md-secondary mb-2">Program Donasi Aktif</h4>
              <p className="text-md-on-surface-variant mb-6">Wujudkan perubahan nyata melalui kontribusi Anda untuk program pembangunan pemuda.</p>
              
              <div className="space-y-6">
                {campaigns.length === 0 ? (
                  <p className="text-sm text-md-outline">Belum ada kampanye donasi aktif saat ini.</p>
                ) : campaigns.map(camp => (
                  <div key={camp.id}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold">{camp.judul}</span>
                      <span className="text-sm font-semibold text-md-secondary">{formatRupiah(camp.terkumpul)} / {formatRupiah(camp.target_dana)}</span>
                    </div>
                    <div className="bg-md-secondary-container/20 h-3 rounded-full overflow-hidden">
                      <div className="bg-md-secondary h-full" style={{ width: `${Math.min(100, Math.round((camp.terkumpul / camp.target_dana) * 100))}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/donasi" className="mt-8 bg-md-secondary text-white w-full py-4 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">volunteer_activism</span> Donasi Sekarang
            </Link>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-md-outline-variant">
            <h4 className="text-2xl font-bold text-md-primary mb-6 text-center">Mitra & Sponsor</h4>
            <div className="grid grid-cols-2 gap-4">
              {sponsors.length === 0 ? (
                <div className="col-span-2 text-center text-sm text-md-outline py-8">Belum ada data mitra</div>
              ) : sponsors.map(sponsor => (
                <div key={sponsor.id} className="aspect-video bg-md-surface-container-low rounded-xl flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer p-4 group">
                  <div className="text-center group-hover:scale-105 transition-transform w-full flex flex-col items-center">
                    {sponsor.logo_url ? (
                      <img src={sponsor.logo_url} alt={sponsor.nama_sponsor} className="max-h-12 object-contain mb-2" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-md-outline mb-1">corporate_fare</span>
                    )}
                    <p className="text-[10px] font-bold text-md-outline truncate w-full text-center">{sponsor.nama_sponsor.toUpperCase()}</p>
                  </div>
                </div>
              ))}
              {/* Fill remaining slots to make it look balanced if less than 4 */}
              {Array.from({ length: Math.max(0, 4 - sponsors.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-video bg-md-surface-container-low/50 rounded-xl flex items-center justify-center p-4">
                  <span className="material-symbols-outlined text-3xl text-md-outline/30">add</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reports & Downloads */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-2xl font-bold text-md-primary">Laporan & Dokumen Publik</h3>
            <Link to="/dokumen" className="text-sm font-bold text-md-primary hover:underline hidden sm:block">Lihat Semua</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {documents.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-md-outline bg-white dark:bg-slate-900 rounded-xl border border-md-outline-variant">
                Belum ada dokumen publik yang dibagikan.
              </div>
            ) : documents.map((doc, i) => (
              <div key={doc.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-md-outline-variant hover:shadow-md transition-all group flex flex-col justify-between">
                <div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${
                    i % 3 === 0 ? 'bg-red-50 text-md-error group-hover:bg-md-error group-hover:text-white' : 
                    i % 3 === 1 ? 'bg-md-primary/5 text-md-primary group-hover:bg-md-primary group-hover:text-white' : 
                    'bg-md-secondary/5 text-md-secondary group-hover:bg-md-secondary group-hover:text-white'
                  }`}>
                    <span className="material-symbols-outlined">{doc.format === 'pdf' ? 'picture_as_pdf' : doc.format === 'docx' ? 'description' : 'history_edu'}</span>
                  </div>
                  <h5 className="font-bold text-lg mb-2">{doc.judul}</h5>
                  <p className="text-xs font-semibold text-md-outline mb-6 line-clamp-2">{doc.deskripsi || 'Tidak ada deskripsi'}</p>
                </div>
                {doc.file_url ? (
                  <a href={doc.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-md-primary font-bold text-sm hover:underline">
                    Unduh Dokumen <span className="material-symbols-outlined text-[18px]">download</span>
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-md-outline font-bold text-sm">
                    Berkas Tidak Tersedia
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center sm:hidden">
            <Link to="/dokumen" className="text-sm font-bold text-md-primary hover:underline">Lihat Semua Dokumen</Link>
          </div>
        </section>

        {/* FAQ & Verification */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-md-primary mb-6">Pertanyaan Umum (FAQ)</h3>
            <div className="space-y-4">
              <details className="group bg-white dark:bg-slate-900 border border-md-outline-variant rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none text-sm font-semibold text-md-primary">
                  Bagaimana cara saya memverifikasi data ini?
                  <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="p-4 pt-0 text-md-on-surface-variant text-sm border-t border-md-outline-variant/30 mt-2">
                  Setiap laporan telah divalidasi oleh Bendahara dan disetujui oleh Ketua. Anda dapat melakukan verifikasi silang dengan dokumen fisik yang tersedia di sekretariat Karang Taruna.
                </div>
              </details>
              <details className="group bg-white dark:bg-slate-900 border border-md-outline-variant rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none text-sm font-semibold text-md-primary">
                  Apakah saya bisa meminta rincian nota belanja?
                  <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="p-4 pt-0 text-md-on-surface-variant text-sm border-t border-md-outline-variant/30 mt-2">
                  Ya, demi transparansi penuh, rincian nota tersedia untuk anggota aktif. Silakan hubungi tim keuangan kami untuk membuat janji temu.
                </div>
              </details>
            </div>
          </div>
          
          <div className="bg-md-surface-container-high dark:bg-slate-900 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 border border-md-primary/10">
            <div className="w-32 h-32 bg-white p-2 rounded-lg shadow-sm border border-md-outline-variant shrink-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-md-outline/30">qr_code_scanner</span>
            </div>
            <div>
              <h4 className="font-bold text-md-primary text-lg mb-2">Verifikasi Keaslian Laporan</h4>
              <p className="text-xs font-semibold text-md-on-surface-variant mb-6 leading-relaxed">Scan kode QR di samping untuk memverifikasi keaslian data finansial ini langsung dari sistem manajemen pusat Karang Taruna.</p>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-md-primary/10 flex items-center justify-center mx-auto mb-1">
                    <span className="material-symbols-outlined text-md-primary text-[20px]">person</span>
                  </div>
                  <p className="text-[10px] font-bold text-md-primary">Dibuat Oleh</p>
                  <p className="text-[10px] text-md-outline">Bendahara</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-md-primary/10 flex items-center justify-center mx-auto mb-1">
                    <span className="material-symbols-outlined text-md-primary text-[20px]">verified</span>
                  </div>
                  <p className="text-[10px] font-bold text-md-primary">Disetujui Oleh</p>
                  <p className="text-[10px] text-md-outline">Ketua Umum</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
