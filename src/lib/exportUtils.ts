import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportToExcel(title: string, columns: string[], data: any[][]) {
  // Combine columns and data
  const wsData = [columns, ...data]
  
  // Create a new workbook and worksheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  
  // Auto-size columns slightly
  const colWidths = columns.map(col => ({ wch: Math.max(10, col.length + 5) }))
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  
  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `${title}.xlsx`)
}

export function exportToPDF(title: string, columns: string[], data: any[][]) {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(16)
  doc.text(title, 14, 15)
  
  // Table
  autoTable(doc, {
    head: [columns],
    body: data,
    startY: 25,
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74] }, // Tailwind green-600
  })
  
  doc.save(`${title}.pdf`)
}
