import { Member } from '@/services/memberService'

interface IdCardTemplateProps {
  member: Member
}

// Standard CR80 card dimensions in mm (53.98mm x 85.6mm).
// For print CSS, we use exact physical sizes.
export default function IdCardTemplate({ member }: IdCardTemplateProps) {
  return (
    <div className="id-card print:m-0 m-auto relative bg-white border border-slate-200 overflow-hidden shadow-lg print:shadow-none font-sans" 
         style={{ width: '54mm', height: '86mm', position: 'relative' }}>
      
      {/* Background Gradient/Pattern */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-red-600 to-red-700 z-0">
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
           <pattern id="pattern-circles" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
             <circle cx="10" cy="10" r="2" fill="white" />
           </pattern>
           <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
        </svg>
      </div>

      <div className="absolute top-1/3 left-0 right-0 bottom-0 bg-white z-0 flex flex-col justify-end pb-4">
        {/* Abstract shapes for bottom */}
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-red-50 rounded-tl-full opacity-50 z-0"></div>
        <div className="absolute bottom-4 left-0 w-8 h-8 bg-slate-50 rounded-tr-full opacity-50 z-0"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col items-center pt-3 px-2">
        {/* Header Text & Prominent Logo */}
        <div className="text-center w-full mb-3 flex flex-col items-center">
          <img src="/logo.png" alt="Logo Karang Taruna" className="w-8 h-8 object-contain mb-1 drop-shadow-md bg-white rounded-full border border-white/20 p-0.5" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          <h2 className="text-white text-[9px] font-black tracking-widest uppercase leading-tight drop-shadow-sm">Karang Taruna</h2>
          <h3 className="text-white/90 text-[7px] font-bold tracking-widest uppercase mt-0.5">Pondok Betung</h3>
        </div>

        {/* Photo Container */}
        <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white overflow-hidden flex items-center justify-center relative">
          {member.foto_url ? (
            <img src={member.foto_url} alt={member.nama} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
              <span className="text-slate-300 text-3xl font-bold uppercase">{member.nama.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Details Container */}
        <div className="mt-4 flex flex-col items-center w-full text-center px-1">
          <h1 className="text-slate-800 font-extrabold text-[13px] leading-tight break-words uppercase w-full">
            {member.nama}
          </h1>
          <span className="text-red-600 font-bold text-[9px] uppercase tracking-wider mt-1 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
            {member.jabatan || 'Anggota'}
          </span>
        </div>

        {/* Info Box */}
        <div className="mt-auto mb-2 w-[90%] bg-slate-50 rounded-md p-1.5 border border-slate-100 flex flex-col items-center">
          <span className="text-[6px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Nomor Induk / NIK</span>
          <span className="text-[9px] font-mono font-bold text-slate-700 tracking-wider">
            {member.nik || '---'}
          </span>
          <div className="w-full h-[1px] bg-slate-200 my-1"></div>
          <span className="text-[7px] text-slate-500 font-medium">RT {member.rt} / RW {member.rw}</span>
        </div>
      </div>

    </div>
  )
}
