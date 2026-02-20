
import { Student, AttendanceRecord, GeneralSettings } from '../types';

/**
 * Automates the printing of a single attendance slip.
 * Creates a hidden iframe to format the slip for thermal or standard printers.
 */
export const printAttendanceSlip = (student: Student, record: AttendanceRecord, brand: GeneralSettings) => {
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = '0';
  document.body.appendChild(printFrame);

  const doc = printFrame.contentWindow?.document;
  if (!doc) return;

  const dateStr = new Date(record.date).toLocaleDateString('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  
  const timeStr = record.scanTime ? new Date(record.scanTime).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }) : '-';

  const isLate = (record.minutesLate || 0) > 0;
  const printerType = brand.printer?.printerType || 'standard';

  const logoHtml = brand.schoolLogoUrl 
    ? `<img src="${brand.schoolLogoUrl}" style="max-height: 40px; margin-bottom: 5px;" /><br/>` 
    : '';

  const slipHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Slip</title>
      <style>
        body {
          font-family: 'Courier New', Courier, monospace;
          margin: 0;
          padding: ${printerType === 'thermal' ? '5mm' : '20mm'};
          width: ${printerType === 'thermal' ? '72mm' : 'auto'};
          color: #000;
          line-height: 1.2;
        }
        .header {
          text-align: center;
          margin-bottom: 15px;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        .school-name { font-weight: bold; font-size: 14px; margin: 0; }
        .slip-title { font-size: 10px; margin: 5px 0; }
        .content { font-size: 12px; margin-bottom: 15px; }
        .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .label { font-weight: bold; }
        .footer {
          text-align: center;
          font-size: 9px;
          margin-top: 15px;
          border-top: 1px dashed #000;
          padding-top: 10px;
        }
        .status-box {
          border: 1px solid #000;
          padding: 8px;
          text-align: center;
          font-weight: bold;
          margin-top: 10px;
          font-size: 13px;
        }
        .late { background-color: #eee; }
        @media print {
          @page { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${logoHtml}
        <p class="school-name">${brand.schoolName.toUpperCase()}</p>
        <p class="slip-title">${brand.printer?.slipTitle || 'BUKTI PRESENSI'}</p>
      </div>
      
      <div class="content">
        <div class="row">
          <span class="label">Nama:</span>
          <span>${student.name}</span>
        </div>
        <div class="row">
          <span class="label">NIS:</span>
          <span>${student.rollNumber}</span>
        </div>
        <div class="row">
          <span class="label">Kelas:</span>
          <span>${student.className || '-'}</span>
        </div>
        <div class="row">
          <span class="label">Tanggal:</span>
          <span>${dateStr}</span>
        </div>
        <div class="row">
          <span class="label">Waktu:</span>
          <span>${timeStr} WIB</span>
        </div>

        <div class="status-box ${isLate ? 'late' : ''}">
          ${isLate ? `TERLAMBAT ${record.minutesLate} MENIT` : 'HADIR TEPAT WAKTU'}
        </div>
      </div>

      <div class="footer">
        <p>Terima kasih atas disiplinnya.</p>
        <p>HADIRKU DIGITAL SYSTEM</p>
        <p>${new Date().toLocaleString('id-ID')}</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(() => {
            window.parent.document.body.removeChild(window.frameElement);
          }, 100);
        };
      </script>
    </body>
    </html>
  `;

  doc.open();
  doc.write(slipHtml);
  doc.close();
};
