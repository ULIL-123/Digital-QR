import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { Student, GeneralSettings, AttendanceStatus } from '../types';

declare var XLSX: any;

interface StudentWithQr extends Student {
  qrDataUrl: string;
}

const setOptimalFontSize = (doc: jsPDF, text: string, maxWidth: number, startSize: number): number => {
    let size = startSize;
    doc.setFontSize(size);
    while (doc.getTextWidth(text) > maxWidth && size > 5) {
        size -= 0.5;
        doc.setFontSize(size);
    }
    return size;
};

const addUltraVisionHologram = (doc: jsPDF, x: number, y: number, w: number, h: number) => {
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.03);
    // Hanya garis vertikal (tidak miring)
    for (let i = 0; i < w; i += 3) {
        doc.setGState(new (doc as any).GState({ opacity: 0.05 }));
        doc.line(x + i, y, x + i, y + h);
    }
    
    // Titik-titik partikel cahaya (pengganti garis miring untuk estetika)
    doc.setFillColor(255, 255, 255);
    for (let i = 0; i < 80; i++) {
        const px = x + Math.random() * w;
        const py = y + Math.random() * h;
        const pSize = Math.random() * 0.25;
        doc.setGState(new (doc as any).GState({ opacity: Math.random() * 0.2 }));
        doc.rect(px, py, pSize, pSize, 'F');
    }
    doc.setGState(new (doc as any).GState({ opacity: 1.0 }));
};

const safeAddImage = (doc: jsPDF, dataUrl: string | undefined, x: number, y: number, w: number, h: number) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) return false;
    try {
        const format = dataUrl.toLowerCase().includes('png') ? 'PNG' : 'JPEG';
        doc.addImage(dataUrl, format, x, y, w, h, undefined, 'FAST');
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * MENGHASILKAN LAPORAN KEHADIRAN RESMI A4 (KOP PEMERINTAH)
 */
export const generateAttendanceReportPdf = async (
  data: any[], 
  date: string, 
  className: string, 
  brand: GeneralSettings
): Promise<void> => {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  
  const drawHeader = (doc: jsPDF) => {
    // Logo Pemerintah (Kiri)
    if (brand.govtLogoUrl) {
      safeAddImage(doc, brand.govtLogoUrl, margin, 10, 22, 22);
    }
    
    // Logo Sekolah (Kanan)
    if (brand.schoolLogoUrl) {
      safeAddImage(doc, brand.schoolLogoUrl, pageWidth - margin - 22, 10, 22, 22);
    }

    // Teks KOP
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("PEMERINTAH KABUPATEN GROBOGAN", pageWidth / 2, 16, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("DINAS PENDIDIKAN DAN KEBUDAYAAN", pageWidth / 2, 22, { align: "center" });
    doc.setFontSize(18);
    doc.text(brand.schoolName.toUpperCase(), pageWidth / 2, 29, { align: "center" });
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("Dusun Sembukan RT 02 RW 08 Desa Kronggen, Brati", pageWidth / 2, 34, { align: "center" });
    doc.text("Grobogan, Jawa Tengah 58153", pageWidth / 2, 38, { align: "center" });
    doc.text("Pos-El: sdn4kronggen@gmail.com, NPSN: 20313593", pageWidth / 2, 42, { align: "center" });
    
    // Garis KOP
    doc.setLineWidth(0.8);
    doc.line(margin, 45, pageWidth - margin, 45);
    doc.setLineWidth(0.2);
    doc.line(margin, 46, pageWidth - margin, 46);
  };

  const drawTable = (doc: jsPDF, startIndex: number) => {
    const startY = 65;
    const rowHeight = 8;
    const cols = [
      { header: "NO", width: 10 },
      { header: "NAMA SISWA", width: 65 },
      { header: "NIS", width: 25 },
      { header: "MASUK", width: 20 },
      { header: "PULANG", width: 20 },
      { header: "KETERANGAN STATUS", width: 35 }
    ];

    // Table Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    let currentX = margin;
    cols.forEach(col => {
      doc.rect(currentX, startY, col.width, rowHeight);
      doc.text(col.header, currentX + col.width / 2, startY + 5, { align: "center" });
      currentX += col.width;
    });

    // Table Body
    doc.setFont("helvetica", "normal");
    let currentY = startY + rowHeight;
    let itemsOnPage = 0;
    const maxItemsPerPage = 22;

    for (let i = startIndex; i < data.length; i++) {
      if (itemsOnPage >= maxItemsPerPage) return i;

      const record = data[i];
      currentX = margin;
      
      const statusLabel = 
        record.status === AttendanceStatus.Absent ? "ALFA" : 
        record.status === AttendanceStatus.Sick ? "SAKIT" : 
        record.status === AttendanceStatus.Permit ? "IJIN" : 
        (record.minutesLate > 0 ? "TERLAMBAT" : "HADIR");

      const rowData = [
        (i + 1).toString(),
        record.student.name.substring(0, 30),
        record.student.rollNumber,
        record.scanTime ? new Date(record.scanTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : '-',
        record.pulangTime ? new Date(record.pulangTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : '-',
        statusLabel
      ];

      rowData.forEach((text, idx) => {
        doc.rect(currentX, currentY, cols[idx].width, rowHeight);
        doc.text(text, currentX + (idx === 1 ? 2 : cols[idx].width / 2), currentY + 5, { align: idx === 1 ? "left" : "center" });
        currentX += cols[idx].width;
      });

      currentY += rowHeight;
      itemsOnPage++;
    }
    return -1; // Selesai
  };

  const drawFooter = (doc: jsPDF) => {
    const formattedDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const footerY = doc.internal.pageSize.getHeight() - 60;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Kronggen, ${formattedDate}`, pageWidth - margin - 50, footerY);
    
    // Penandatangan
    doc.text("Mengetahui,", margin + 10, footerY + 7);
    doc.text("Kepala Sekolah,", margin + 10, footerY + 12);
    
    doc.text("Guru Kelas,", pageWidth - margin - 50, footerY + 12);

    // Nama & NIP
    const principalName = brand.principalName || "......................................................";
    const principalNip = brand.principalNip ? `NIP. ${brand.principalNip}` : "NIP. ...........................................";
    
    // Mencari guru yang sesuai kelas (mendukung hingga 10 slot guru)
    let teacherName = "......................................................";
    let teacherNip = "NIP. ...........................................";
    
    const classNum = parseInt(className);
    if (!isNaN(classNum) && classNum >= 1 && classNum <= 10) {
      const tKey = `teacher${classNum}` as keyof GeneralSettings;
      const tData = brand[tKey] as any;
      if (tData && tData.name) {
        teacherName = tData.name;
        teacherNip = `NIP. ${tData.nip || '-'}`;
      }
    }

    doc.setFont("helvetica", "bold");
    doc.text(principalName, margin + 10, footerY + 38);
    doc.text(teacherName, pageWidth - margin - 50, footerY + 38);
    
    doc.setFont("helvetica", "normal");
    doc.text(principalNip, margin + 10, footerY + 43);
    doc.text(teacherNip, pageWidth - margin - 50, footerY + 43);
  };

  let currentIndex = 0;
  while (currentIndex !== -1) {
    if (currentIndex > 0) doc.addPage();
    drawHeader(doc);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("LAPORAN KEHADIRAN HARIAN SISWA", pageWidth / 2, 54, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Kelas: ${className === 'all' ? 'Semua Kelas' : className} | Tanggal: ${date}`, pageWidth / 2, 60, { align: "center" });
    
    currentIndex = drawTable(doc, currentIndex);
    
    if (currentIndex === -1) {
      drawFooter(doc);
    }
  }

  doc.save(`Laporan_Absensi_${className}_${date}.pdf`);
};

export const svgToPngDataUrl = (svgElement: SVGElement): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgElement);
      if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
        svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(''); return; }
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        const scale = 1.2; 
        canvas.width = 256 * scale;
        canvas.height = 256 * scale;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngDataUrl = canvas.toDataURL('image/png', 0.5); 
        URL.revokeObjectURL(url);
        resolve(pngDataUrl);
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(''); };
      img.src = url;
    } catch (error) { resolve(''); }
  });
};

export const exportAttendanceToExcel = (data: any[], fileName: string) => {
  if (typeof XLSX === 'undefined') return;
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  } catch (err) { alert("Gagal ekspor Excel."); }
};

export const downloadStudentTemplateExcel = () => {
  if (typeof XLSX === 'undefined') return;
  const templateData = [{ "Nama": "Ahmad", "NIS": "001", "Kelas": "1A", "Kontak_Ortu": "628" }];
  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, "template_siswa.xlsx");
};

export const generateIdCardPdf = async (studentsWithQr: StudentWithQr[], brand: GeneralSettings): Promise<void> => {
  try {
    // Ukuran Kertas F4 (215mm x 330mm)
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [215, 330], compress: true });
    
    // Ukuran Kartu 8.6cm x 5.4cm
    const cardWidth = 86; 
    const cardHeight = 54;  
    
    const hGap = 2; 
    const vGap = 8; 
    const marginLeft = (215 - (cardWidth * 2 + hGap)) / 2; 
    const marginTop = 15;
    
    const colorHeaderNavy = [15, 23, 42]; 
    const colorAccentBlue = [30, 58, 138]; 
    const colorHoloMain = [34, 211, 238]; 
    
    const studentsPerPage = 5; 
    const totalPages = Math.ceil(studentsWithQr.length / studentsPerPage);

    for (let p = 0; p < totalPages; p++) {
      const startIdx = p * studentsPerPage;
      const endIdx = Math.min(startIdx + studentsPerPage, studentsWithQr.length);
      if (p > 0) doc.addPage();
      
      for (let i = startIdx; i < endIdx; i++) {
        const localIdx = i - startIdx;
        const y = marginTop + (localIdx * (cardHeight + vGap));
        const student = studentsWithQr[i];

        // --- DRAW FRONT SIDE ---
        const fx = marginLeft;
        doc.setFillColor(colorHoloMain[0], colorHoloMain[1], colorHoloMain[2]);
        doc.roundedRect(fx, y, cardWidth, cardHeight, 4, 4, 'F');
        addUltraVisionHologram(doc, fx, y, cardWidth, cardHeight);
        
        doc.setFillColor(colorHeaderNavy[0], colorHeaderNavy[1], colorHeaderNavy[2]);
        doc.roundedRect(fx, y, cardWidth, 18, 4, 4, 'F');
        doc.setFillColor(colorAccentBlue[0], colorAccentBlue[1], colorAccentBlue[2]);
        doc.rect(fx, y + 14.8, cardWidth, 3.2, 'F');
        
        const logoSize = 7.5; 
        // Logo Pemerintah (Kiri)
        if (brand.govtLogoUrl) {
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(fx + 3, y + 3, logoSize + 2.5, logoSize + 2.5, 1, 1, 'F');
            safeAddImage(doc, brand.govtLogoUrl, fx + 4.25, y + 4.25, logoSize, logoSize);
        }
        // Logo Sekolah (Kanan)
        if (brand.schoolLogoUrl) {
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(fx + cardWidth - (logoSize + 2.5) - 3, y + 3, logoSize + 2.5, logoSize + 2.5, 1, 1, 'F');
            safeAddImage(doc, brand.schoolLogoUrl, fx + cardWidth - logoSize - 4.25, y + 4.25, logoSize, logoSize);
        }
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255); 
        doc.setFontSize(6);
        doc.text("ID CARD ABSENSI DIGITAL", fx + cardWidth/2, y + 6, {align: 'center'});
        doc.setFontSize(9);
        doc.text(brand.schoolName.toUpperCase(), fx + cardWidth/2, y + 11, {align: 'center'}); 
        doc.setTextColor(34, 211, 238); 
        doc.setFontSize(5);
        doc.text("TOWARDS LITERATE SCHOOL", fx + cardWidth/2, y + 14, {align: 'center'}); 
        
        const fullName = student.name.toUpperCase();
        doc.setTextColor(15, 23, 42); 
        setOptimalFontSize(doc, fullName, cardWidth - 35, 12);
        doc.text(fullName, fx + 5, y + 28);
        doc.setFontSize(9);
        doc.setTextColor(30, 58, 138); 
        doc.text("NIS: " + student.rollNumber, fx + 5, y + 34);
        doc.setFontSize(8);
        doc.text("KELAS: " + (student.className || '-'), fx + 5, y + 39);

        // Hak Cipta (Bawah)
        doc.setFontSize(5);
        doc.setTextColor(15, 23, 42);
        doc.text("© 2026. SDN 4 Kronggen", fx + cardWidth / 2, y + cardHeight - 2, { align: 'center' });
        
        // QR di Sisi Kanan Depan
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(fx + cardWidth - 25, y + 25, 20, 20, 2, 2, 'F');
        if (student.qrDataUrl) safeAddImage(doc, student.qrDataUrl, fx + cardWidth - 24, y + 26, 18, 18);

        // --- DRAW BACK SIDE (Berjajar ke Kanan) ---
        const bx = marginLeft + cardWidth + hGap;
        doc.setFillColor(colorHoloMain[0], colorHoloMain[1], colorHoloMain[2]);
        doc.roundedRect(bx, y, cardWidth, cardHeight, 4, 4, 'F');
        addUltraVisionHologram(doc, bx, y, cardWidth, cardHeight);
        
        doc.setFillColor(colorHeaderNavy[0], colorHeaderNavy[1], colorHeaderNavy[2]);
        doc.roundedRect(bx, y, cardWidth, 12, 4, 4, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text("INFORMASI PENGGUNAAN", bx + cardWidth/2, y + 8, {align: 'center'});
        
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(7.5);
        const rules = [
            "• Kartu ini adalah identitas resmi digital.",
            "• Scan QR saat kedatangan & kepulangan.",
            "• Jaga kartu dari tekukan atau goresan.",
            "• Kehilangan wajib lapor kepada Admin Sekolah.",
            "• Kartu tidak dapat dipindahtangankan."
        ];
        rules.forEach((rule, rIdx) => {
            doc.text(rule, bx + 8, y + 22 + (rIdx * 5));
        });

        // Hak Cipta (Bawah Belakang)
        doc.setFontSize(5);
        doc.text("© 2026. SDN 4 Kronggen", bx + cardWidth / 2, y + cardHeight - 2, { align: 'center' });
      }
    }
    doc.save(`ID_CARD_SDN4K_2026.pdf`);
  } catch (err) { alert("Gagal membuat PDF."); }
};

export const generateZip = async (studentsWithQr: StudentWithQr[], brand: GeneralSettings): Promise<void> => {
  try {
      const zip = new JSZip();
      for (const student of studentsWithQr) {
        const images = await renderStudentIdCardToImages(student, brand);
        const safeName = student.name.replace(/\s/g, '_').substring(0, 15);
        zip.file(`${safeName}_FRONT.pdf`, images.front.split(',')[1], { base64: true });
        zip.file(`${safeName}_BACK.pdf`, images.back.split(',')[1], { base64: true });
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ID_CARDS_DIGITAL_2026.zip`;
      link.click();
      URL.revokeObjectURL(url);
  } catch (err) { alert("Gagal ekspor ZIP."); }
};

const renderStudentIdCardToImages = async (student: StudentWithQr, brand: GeneralSettings): Promise<{front: string, back: string}> => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [54, 86] });
    const drawCard = (isBack: boolean) => {
        const w = 86;
        const h = 54;
        const colorHolo = [34, 211, 238];
        const colorNavy = [15, 23, 42];
        doc.setFillColor(colorHolo[0], colorHolo[1], colorHolo[2]);
        doc.rect(0, 0, w, h, 'F');
        addUltraVisionHologram(doc, 0, 0, w, h);
        if (!isBack) {
            doc.setFillColor(colorNavy[0], colorNavy[1], colorNavy[2]);
            doc.rect(0, 0, w, 18, 'F');
            const logoSize = 7.5;
            // Logo Pemerintah (Kiri)
            if (brand.govtLogoUrl) {
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(3, 4, logoSize + 2.5, logoSize + 2.5, 1, 1, 'F');
                safeAddImage(doc, brand.govtLogoUrl, 4.25, 5.25, logoSize, logoSize);
            }
            // Logo Sekolah (Kanan)
            if (brand.schoolLogoUrl) {
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(w - logoSize - 5, 4, logoSize + 2.5, logoSize + 2.5, 1, 1, 'F');
                safeAddImage(doc, brand.schoolLogoUrl, w - logoSize - 3.75, 5.25, logoSize, logoSize);
            }
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.text(brand.schoolName.toUpperCase(), w/2, 11, {align: 'center'});
            doc.setFontSize(5);
            doc.text("ID CARD ABSENSI DIGITAL", w/2, 14, {align: 'center'});
            doc.setTextColor(15, 23, 42);
            const fullName = student.name.toUpperCase();
            setOptimalFontSize(doc, fullName, w - 30, 11);
            doc.text(fullName, 5, 28);
            doc.setFontSize(9);
            doc.text("NIS: " + student.rollNumber, 5, 34);

            // Hak Cipta
            doc.setFontSize(5);
            doc.text("© 2026. SDN 4 Kronggen", w / 2, h - 2, { align: 'center' });

            doc.setFillColor(255, 255, 255);
            doc.roundedRect(w - 25, 25, 20, 20, 2, 2, 'F');
            if (student.qrDataUrl) safeAddImage(doc, student.qrDataUrl, w - 24, 26, 18, 18);
        } else {
            doc.setFillColor(colorNavy[0], colorNavy[1], colorNavy[2]);
            doc.rect(0, 0, w, 12, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.text("TATA TERTIB", w/2, 8, {align: 'center'});
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(8);
            const rules = ["Bawa kartu setiap hari.", "Scan QR saat masuk atau pulang.", "Jaga kebersihan kartu.", "Lapor jika kartu hilang."];
            rules.forEach((r, i) => doc.text("• " + r, 8, 22 + (i * 7)));

            // Hak Cipta
            doc.setFontSize(5);
            doc.text("© 2026. SDN 4 Kronggen", w / 2, h - 2, { align: 'center' });
        }
    };
    drawCard(false);
    const front = doc.output('datauristring');
    doc.addPage();
    drawCard(true);
    const back = doc.output('datauristring');
    return { front, back };
};