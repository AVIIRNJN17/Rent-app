import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReceiptRecord } from '../types';

export async function generateReceiptPDF(
  elementId: string,
  receipt: ReceiptRecord
): Promise<{ success: boolean; blob?: Blob; filename: string }> {
  const filename = `${receipt.receiptNumber}_${receipt.monthKey}.pdf`;
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return { success: false, filename };
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution for crisp text
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: 800,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Add image onto A4 page
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    const blob = pdf.output('blob');
    return { success: true, blob, filename };
  } catch (error) {
    console.error('Failed to generate PDF via html2canvas:', error);

    // Fallback: minimal jsPDF generation directly
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.setFontSize(20);
      pdf.setTextColor(212, 175, 55);
      pdf.text('AVHII RENT APP', 105, 20, { align: 'center' });
      pdf.setFontSize(14);
      pdf.setTextColor(30, 30, 30);
      pdf.text(receipt.title, 105, 30, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text(`Receipt No: ${receipt.receiptNumber}`, 20, 45);
      pdf.text(`Month: ${receipt.monthKey}`, 20, 52);
      pdf.text(`Tenant: ${receipt.tenantName}`, 20, 59);
      pdf.text(`Landlord: ${receipt.landlordName}`, 20, 66);
      pdf.text(`Rent: Rs. ${receipt.monthlyRent}`, 20, 75);
      pdf.text(`Electricity (${receipt.unitsConsumed} units @ Rs. 7): Rs. ${receipt.electricityBill}`, 20, 82);
      if (receipt.adjustmentAmount && receipt.adjustmentAmount > 0) {
        const sign = receipt.adjustmentType === 'deduct' ? '-' : '+';
        const label = receipt.adjustmentType === 'deduct' ? 'Deduct (Extra Deposit/Adv)' : 'Add (Prior Dues/Extra)';
        pdf.text(`${label}: ${sign}Rs. ${receipt.adjustmentAmount} (${receipt.adjustmentReason || ''})`, 20, 88);
      }
      pdf.text(`Grand Total: Rs. ${receipt.grandTotal}`, 20, 95);
      pdf.text(`Amount Paid: Rs. ${receipt.amountPaid}`, 20, 102);
      pdf.text(`Balance Due: Rs. ${receipt.remainingBalance}`, 20, 109);
      pdf.text(`Status: ${receipt.paymentStatus}`, 20, 117);

      const blob = pdf.output('blob');
      return { success: true, blob, filename };
    } catch (fallbackErr) {
      console.error('Direct PDF creation failed:', fallbackErr);
      return { success: false, filename };
    }
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
