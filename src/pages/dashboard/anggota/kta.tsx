import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { memberService } from '@/services/memberService'
import IdCardTemplate from '@/components/IdCardTemplate'
import { Button } from '@/components/ui/button'
import { Printer, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function KtaDigital() {
  const [search, setSearch] = useState('')
  
  const { data: members, isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: memberService.getMembers
  })

  const filteredMembers = members?.filter(m => 
    m.nama.toLowerCase().includes(search.toLowerCase()) || 
    (m.nomor_anggota && m.nomor_anggota.toLowerCase().includes(search.toLowerCase()))
  )

  const handlePrintAll = () => {
    window.print()
  }

  if (isLoading) {
    return <div className="flex justify-center p-4 md:p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">KTA Digital</h2>
          <p className="text-muted-foreground">Kartu Tanda Anggota Elektronik</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari nama / nomor anggota..." 
              className="pl-9 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={handlePrintAll}>
            <Printer className="mr-2 h-4 w-4" /> Cetak Terpilih
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6" id="print-section">
        {filteredMembers?.map(member => (
          <div key={member.id} className="flex justify-center p-4 bg-slate-50 border rounded-xl">
            <IdCardTemplate member={member} />
          </div>
        ))}
        {filteredMembers?.length === 0 && (
          <div className="col-span-full p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            Anggota tidak ditemukan.
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section, #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
          }
          .border { border: none !important; background: transparent !important; }
        }
      `}} />
    </div>
  )
}
