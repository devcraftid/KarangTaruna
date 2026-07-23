import { Member } from '@/services/memberService'

interface IdCardTemplateProps {
  member: Member
}

export default function IdCardTemplate({ member }: IdCardTemplateProps) {
  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || ''
  const imgUrl = member.foto_url
    ? member.foto_url.startsWith('http')
      ? member.foto_url
      : `${supabaseUrl}/storage/v1/object/public/avatars/${member.foto_url}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nama)}&background=888&color=fff&size=400&bold=true`

  const displayName = member.nama.length > 12 ? member.nama.substring(0, 12) + '...' : member.nama;

  return (
    <div
      className="id-card print:m-0 m-auto break-inside-avoid"
      style={{
        width: '200px',
        height: '352px',
        minWidth: '200px',
        minHeight: '352px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#F8F9FA', /* Light background */
        fontFamily: "'Inter', 'Montserrat', sans-serif",
        boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      <div style={{ width: '200px', height: '352px', visibility: 'hidden', pointerEvents: 'none' }} />

      {/* =========================================================
          LAYER 0: BACKGROUNDS
      ========================================================= */}
      {/* Light Background with Kawung Pattern */}
      <div style={{
        position: 'absolute', top: 0, left: '60px', width: '140px', height: '100%',
        backgroundColor: '#F8F9FA', zIndex: 0,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 0 L40 20 L20 40 L0 20 Z\' fill=\'none\' stroke=\'%23E5E5E5\' stroke-width=\'1.5\'/%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'4\' fill=\'%23E5E5E5\'/%3E%3Ccircle cx=\'20\' cy=\'0\' r=\'4\' fill=\'%23E5E5E5\'/%3E%3Ccircle cx=\'20\' cy=\'40\' r=\'4\' fill=\'%23E5E5E5\'/%3E%3Ccircle cx=\'0\' cy=\'20\' r=\'4\' fill=\'%23E5E5E5\'/%3E%3Ccircle cx=\'40\' cy=\'20\' r=\'4\' fill=\'%23E5E5E5\'/%3E%3C/svg%3E")',
        backgroundSize: '30px 30px'
      }} />

      {/* Left Wide Red Strip */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, width: '65px', height: '100%', 
        backgroundColor: '#BC1111', zIndex: 1,
        boxShadow: '3px 0 15px rgba(0,0,0,0.3)'
      }}>
        {/* Premium Batik Kawung Pattern Overlay (Top 70px) */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '70px',
          backgroundColor: '#8B0A0A',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 0 L40 20 L20 40 L0 20 Z\' fill=\'none\' stroke=\'%23FFF\' stroke-width=\'1.5\' opacity=\'0.8\'/%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'4\' fill=\'%23FFF\' opacity=\'0.8\'/%3E%3Ccircle cx=\'20\' cy=\'0\' r=\'4\' fill=\'%23FFF\' opacity=\'0.8\'/%3E%3C/svg%3E")',
          backgroundSize: '25px 25px',
          borderBottom: '2px solid rgba(255,255,255,0.4)'
        }} />
        
        {/* Hanging Streamers / Confetti */}
        <svg width="65" height="150" viewBox="0 0 65 150" style={{ position: 'absolute', top: '70px', left: 0 }}>
          {/* White Swirl */}
          <path d="M15,0 C25,20 5,40 15,60 C25,80 5,100 15,120" fill="none" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.9" filter="drop-shadow(1px 1px 2px rgba(0,0,0,0.3))" />
          {/* Red/Dark Red Swirl */}
          <path d="M40,0 C50,30 20,50 40,80" fill="none" stroke="#8B0A0A" strokeWidth="4" filter="drop-shadow(1px 1px 2px rgba(0,0,0,0.3))" />
          {/* Confetti */}
          <circle cx="25" cy="15" r="3" fill="#FFD700" />
          <circle cx="45" cy="40" r="2" fill="#FFFFFF" />
          <circle cx="50" cy="90" r="3" fill="#FFD700" />
          <polygon points="30,60 33,65 27,65" fill="#FFFFFF" />
        </svg>
      </div>

      {/* =========================================================
          LAYER 1.5: GHOST PORTRAIT (New in this reference)
      ========================================================= */}
      <div style={{
        position: 'absolute', top: '30px', right: '-20px', width: '160px', height: '220px',
        zIndex: 2, pointerEvents: 'none'
      }}>
        <img 
          src={imgUrl} 
          alt="Ghost background"
          style={{ 
            width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top right',
            filter: 'grayscale(100%) opacity(35%) drop-shadow(-5px 5px 10px rgba(0,0,0,0.2))'
          }} 
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>

      {/* =========================================================
          LAYER 2: TEXT ON RED STRIP
      ========================================================= */}
      {/* KEMERDEKAAN */}
      <div style={{ 
        position: 'absolute', top: '80px', left: '10px', 
        writingMode: 'vertical-lr', color: '#FFF', 
        fontSize: '10.5px', letterSpacing: '3px', fontFamily: "'Times New Roman', Times, serif",
        zIndex: 3, textShadow: '0 1px 2px rgba(0,0,0,0.5)'
      }}>
        KEMERDEKAAN
      </div>

      {/* SEMARAK */}
      <div style={{ 
        position: 'absolute', top: '80px', left: '26px', 
        writingMode: 'vertical-lr', color: '#FFF', 
        fontSize: '12px', fontWeight: 'bold', letterSpacing: '3px', fontFamily: "'Times New Roman', Times, serif",
        zIndex: 3, textShadow: '0 1px 2px rgba(0,0,0,0.5)'
      }}>
        SEMARAK
      </div>

      {/* LOMBA HUT RI */}
      <div style={{ 
        position: 'absolute', bottom: '65px', left: '42px', 
        writingMode: 'vertical-rl', transform: 'rotate(180deg)',
        color: '#FFF', fontSize: '12.5px', fontWeight: '900', letterSpacing: '1.5px',
        zIndex: 3, textShadow: '0 1px 2px rgba(0,0,0,0.5)'
      }}>
        LOMBA HUT RI
      </div>

      {/* =========================================================
          LAYER 3: POLAROID FRAME
          Heavily tilted counter-clockwise
      ========================================================= */}
      <div style={{ 
        position: 'absolute', top: '100px', left: '15px', 
        width: '150px', height: '180px', 
        backgroundColor: '#FDFDFD', 
        padding: '7px', paddingBottom: '38px', 
        transform: 'rotate(-14deg)', /* Tilted Left! */
        boxShadow: '0 15px 30px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(0,0,0,0.05)', 
        zIndex: 6,
        borderRadius: '3px' 
      }}>
        <div style={{ 
           width: '100%', height: '100%', overflow: 'hidden', 
           backgroundColor: '#222', borderRadius: '2px',
           boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.4)'
        }}>
          <img 
            src={imgUrl} 
            alt={member.nama}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} 
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).src =
                `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nama)}&background=555&color=fff&size=400&bold=true`
            }}
          />
        </div>
        
        {/* Name Pill inside Polaroid (Cursive font) */}
        <div style={{
           position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
           backgroundColor: '#A01515', color: '#FFF',
           padding: '4px 18px', borderRadius: '15px',
           fontSize: '14px', fontWeight: 'normal',
           fontFamily: "'Brush Script MT', 'Dancing Script', 'Pacifico', cursive",
           whiteSpace: 'nowrap', textTransform: 'capitalize',
           boxShadow: '0 3px 6px rgba(0,0,0,0.4)'
        }}>
          {displayName}
        </div>
      </div>

      {/* =========================================================
          LAYER 4: BOTTOM ORNAMENTS (Ribbon, Hand, PANITIA)
      ========================================================= */}
      {/* Dark Red Block behind PANITIA */}
      <div style={{
        position: 'absolute', bottom: '45px', right: '-10px', width: '130px', height: '35px',
        backgroundColor: '#7C0F13', zIndex: 7,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.4)',
        borderTopLeftRadius: '5px'
      }} />

      {/* Bottom PANITIA Text */}
      <div style={{ 
        position: 'absolute', bottom: '52px', right: '15px', 
        color: '#FFF', fontSize: '18px', fontWeight: '900', letterSpacing: '4px', zIndex: 8,
        textShadow: '0 2px 4px rgba(0,0,0,0.6)'
      }}>
        PANITIA
      </div>

      {/* Bottom 3D Wavy Ribbon (Flowing across) */}
      <svg width="200" height="70" viewBox="0 0 200 70" style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 8, filter: 'drop-shadow(0 -3px 8px rgba(0,0,0,0.4))' }}>
        <defs>
          <linearGradient id="redGrad" x1="0%" y1="0%" x2="0%" y2="100%">
             <stop offset="0%" stopColor="#E31225" />
             <stop offset="100%" stopColor="#9E1B1E" />
          </linearGradient>
          <linearGradient id="whiteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
             <stop offset="0%" stopColor="#FFFFFF" />
             <stop offset="100%" stopColor="#DDDDDD" />
          </linearGradient>
        </defs>
        <path d="M-10,40 Q50,70 100,35 Q150,0 210,40 L210,70 L-10,70 Z" fill="#500000" />
        <path d="M-10,50 Q50,80 100,45 Q150,10 210,50 L210,70 L-10,70 Z" fill="url(#whiteGrad)" />
        <path d="M-10,55 Q50,85 100,50 Q150,15 210,55 L210,70 L-10,70 Z" fill="url(#redGrad)" />
      </svg>

      {/* Bottom Smoothed Fist and Flag SVG */}
      <svg width="55" height="75" viewBox="0 0 55 75" style={{ position: 'absolute', bottom: '5px', left: '70px', zIndex: 9, filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.5))' }}>
        {/* Flag Pole */}
        <rect x="26" y="5" width="4" height="45" fill="#E0E0E0" rx="2" />
        {/* Red Flag (waving left) */}
        <path d="M28,5 Q15,10 5,0 L5,13 Q15,23 28,17 Z" fill="#E31225" />
        {/* White Flag (waving left) */}
        <path d="M28,17 Q15,23 5,13 L5,26 Q15,36 28,30 Z" fill="#FFFFFF" />
        
        {/* Smooth Arm Base */}
        <path d="M16,55 L16,75 L38,75 L38,55 Z" fill="#C47A55" />
        {/* Fist Hand */}
        <rect x="13" y="38" width="28" height="20" rx="5" fill="#D28F6B" />
        {/* Finger Creases */}
        <path d="M13,42 Q27,42 41,42" fill="none" stroke="#A96441" strokeWidth="1.5" />
        <path d="M13,48 Q27,48 41,48" fill="none" stroke="#A96441" strokeWidth="1.5" />
        <path d="M13,54 Q27,54 41,54" fill="none" stroke="#A96441" strokeWidth="1.5" />
        {/* Thumb */}
        <path d="M10,42 Q20,34 26,42" fill="none" stroke="#D28F6B" strokeWidth="5" strokeLinecap="round" />
        <path d="M10,42 Q20,34 26,42" fill="none" stroke="#A96441" strokeWidth="1" strokeLinecap="round" />
      </svg>

    </div>
  )
}