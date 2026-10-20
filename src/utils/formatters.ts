// Format numbers as Indian Rupee (INR) currency
export const formatINR = (amount: number, showDecimals: boolean = false): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return formatted;
};

// Format date into DD/MM/YYYY
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '--/--/----';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

// Format Month Key "YYYY-MM" to readable name
const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_HI = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
];

export const formatMonthYear = (monthKey: string, lang: 'en' | 'hi' = 'en'): string => {
  if (!monthKey || !monthKey.includes('-')) return monthKey;
  const [yearStr, monthStr] = monthKey.split('-');
  const monthIdx = parseInt(monthStr, 10) - 1;
  const list = lang === 'hi' ? MONTH_NAMES_HI : MONTH_NAMES_EN;
  const name = list[monthIdx] || monthStr;
  return `${name} ${yearStr}`;
};

// Current month key generator: "YYYY-MM"
export const getCurrentMonthKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Today's date generator: "YYYY-MM-DD"
export const getTodayDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Convert number to Indian words
export const numberToWordsINR = (num: number): string => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Zero Rupees Only';

  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + ' ' + a[n % 10];
    if (n < 1000) return inWords(Math.floor(n / 100)) + 'Hundred ' + (n % 100 !== 0 ? inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
  };

  return `${inWords(n).trim()} Rupees Only`;
};

// Generate pre-formatted WhatsApp share message
export const generateWhatsAppMessage = (data: {
  tenantName: string;
  landlordName: string;
  monthName: string;
  roomAddress: string;
  monthlyRent: number;
  electricityUnits: number;
  electricityBill: number;
  additionalCharges: number;
  adjustmentType?: 'add' | 'deduct';
  adjustmentAmount?: number;
  adjustmentReason?: string;
  grandTotal: number;
  amountPaid: number;
  remainingBalance: number;
  status: string;
}): string => {
  const statusEmoji = data.status === 'Paid' ? '✅' : data.status === 'Partial' ? '⚠️' : '⏳';
  const adjustmentLine =
    data.adjustmentAmount && data.adjustmentAmount > 0
      ? data.adjustmentType === 'deduct'
        ? `➖ *Extra Deposit / Cash Deduct:* -${formatINR(data.adjustmentAmount)}${data.adjustmentReason ? ` (${data.adjustmentReason})` : ''}\n`
        : `➕ *Added Dues / Arrears:* +${formatINR(data.adjustmentAmount)}${data.adjustmentReason ? ` (${data.adjustmentReason})` : ''}\n`
      : '';

  return (
    `*AVHII RENT APP - Rent & Electricity Statement*\n\n` +
    `👤 *Tenant:* ${data.tenantName}\n` +
    `🏢 *Landlord:* ${data.landlordName}\n` +
    `📍 *Room:* ${data.roomAddress}\n` +
    `📅 *Billing Month:* ${data.monthName}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🏠 *Room Rent:* ${formatINR(data.monthlyRent)}\n` +
    `⚡ *Electricity (${data.electricityUnits} units @ ₹7):* ${formatINR(data.electricityBill)}\n` +
    (data.additionalCharges > 0 ? `➕ *Additional Charges:* ${formatINR(data.additionalCharges)}\n` : '') +
    adjustmentLine +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *Grand Total Payable:* ${formatINR(data.grandTotal)}\n` +
    `💵 *Amount Paid:* ${formatINR(data.amountPaid)}\n` +
    `📌 *Remaining Balance:* ${formatINR(data.remainingBalance)}\n` +
    `🏷️ *Payment Status:* ${statusEmoji} ${data.status}\n\n` +
    `_Generated via AVHII RENT APP by Abhishek Ranjan_`
  );
};

// Generate pre-formatted WhatsApp message for Monthly House Ration
export const generateRationWhatsAppMessage = (data: {
  householdName: string;
  monthName: string;
  totalItems: number;
  totalAmount: number;
  categoryBreakdown: Record<string, number>;
}): string => {
  let catText = '';
  Object.entries(data.categoryBreakdown).forEach(([cat, amt]) => {
    if (amt > 0) {
      catText += `• ${cat}: ${formatINR(amt)}\n`;
    }
  });

  return (
    `*AVHII RENT APP - Monthly House Ration Statement*\n\n` +
    `🛒 *Household:* ${data.householdName}\n` +
    `📅 *Month:* ${data.monthName}\n` +
    `📦 *Items Count:* ${data.totalItems} items\n` +
    `💰 *Total Ration Outflow:* ${formatINR(data.totalAmount)}\n\n` +
    `*Category Breakdown:*\n${catText}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `_Separate House Ration record for future verification._\n` +
    `_AVHII RENT APP • Abhishek Ranjan_`
  );
};
