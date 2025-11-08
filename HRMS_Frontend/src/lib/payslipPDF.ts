import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface PayslipData {
  employee: {
    firstName: string;
    lastName: string;
    employeeId: string;
    email: string;
    department?: string;
    designation?: string;
    bankAccountNumber?: string;
    panNumber?: string;
  };
  selectedMonth: number;
  selectedYear: string;
  basicSalary: number;
  allowances: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  companyName?: string;
  companyAddress?: string;
}

export const generatePayslipPDF = (data: PayslipData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const companyName = data.companyName || 'WorkZen HRMS';
  const companyAddress = data.companyAddress || 'Corporate Office, Business District, India';
  
  // Header with company logo placeholder and name
  doc.setFillColor(102, 126, 234); // Blue color
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(companyAddress, pageWidth / 2, 25, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Payslip Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYSLIP', pageWidth / 2, 48, { align: 'center' });
  
  // Period Information
  const periodStart = format(new Date(parseInt(data.selectedYear), data.selectedMonth, 1), 'dd MMM yyyy');
  const periodEnd = format(new Date(parseInt(data.selectedYear), data.selectedMonth + 1, 0), 'dd MMM yyyy');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Pay Period: ${periodStart} to ${periodEnd}`, pageWidth / 2, 56, { align: 'center' });
  
  // Employee Details Section
  doc.setFillColor(240, 240, 240);
  doc.rect(14, 65, pageWidth - 28, 40, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Details', 18, 72);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  // Left column
  doc.text('Employee Name:', 18, 80);
  doc.text(`${data.employee.firstName} ${data.employee.lastName}`, 55, 80);
  
  doc.text('Employee ID:', 18, 87);
  doc.text(data.employee.employeeId, 55, 87);
  
  doc.text('Email:', 18, 94);
  doc.text(data.employee.email, 55, 94);
  
  // Right column
  doc.text('Department:', 110, 80);
  doc.text(data.employee.department || 'N/A', 145, 80);
  
  doc.text('Designation:', 110, 87);
  doc.text(data.employee.designation || 'N/A', 145, 87);
  
  doc.text('PAN Number:', 110, 94);
  doc.text(data.employee.panNumber || 'N/A', 145, 94);
  
  if (data.employee.bankAccountNumber) {
    doc.text('Bank Account:', 18, 101);
    doc.text(data.employee.bankAccountNumber, 55, 101);
  }
  
  // Salary Details Table
  let yPos = 115;
  
  // Earnings Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Earnings', 18, yPos);
  
  yPos += 5;
  
  const earningsData = [
    ['Basic Salary', formatCurrencyForPDF(data.basicSalary)],
    ['House Rent Allowance', formatCurrencyForPDF(data.allowances * 0.5)],
    ['Other Allowances', formatCurrencyForPDF(data.allowances * 0.5)],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Component', 'Amount (INR)']],
    body: earningsData,
    theme: 'grid',
    headStyles: { fillColor: [102, 126, 234], fontSize: 9, cellPadding: 2.5 },
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 60, halign: 'right' },
    },
    margin: { left: 18, right: 18 },
  });
  
  // Get Y position after earnings table
  const earningsEndY = (doc as any).lastAutoTable.finalY || yPos + 40;
  
  // Deductions Table (below earnings)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Deductions', 18, earningsEndY + 10);
  
  const deductionsData = [
    ['Provident Fund (PF)', formatCurrencyForPDF(data.deductions * 0.5)],
    ['Income Tax (TDS)', formatCurrencyForPDF(data.deductions * 0.4)],
    ['Professional Tax', formatCurrencyForPDF(data.deductions * 0.1)],
  ];
  
  autoTable(doc, {
    startY: earningsEndY + 15,
    head: [['Component', 'Amount (INR)']],
    body: deductionsData,
    theme: 'grid',
    headStyles: { fillColor: [239, 68, 68], fontSize: 9, cellPadding: 2.5 },
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 60, halign: 'right' },
    },
    margin: { left: 18, right: 18 },
  });
  
  // Get final Y position after tables
  const finalY = (doc as any).lastAutoTable.finalY || earningsEndY + 60;
  
  // Summary Box
  const summaryY = finalY + 10;
  
  // Gross Salary
  doc.setFillColor(240, 253, 244);
  doc.rect(14, summaryY, pageWidth - 28, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Gross Salary:', 18, summaryY + 6.5);
  doc.text(formatCurrencyForPDF(data.grossSalary), pageWidth - 22, summaryY + 6.5, { align: 'right' });
  
  // Total Deductions
  doc.setFillColor(254, 242, 242);
  doc.rect(14, summaryY + 12, pageWidth - 28, 10, 'F');
  doc.text('Total Deductions:', 18, summaryY + 18.5);
  doc.text(`- ${formatCurrencyForPDF(data.deductions)}`, pageWidth - 22, summaryY + 18.5, { align: 'right' });
  
  // Net Salary (highlighted)
  doc.setFillColor(220, 252, 231);
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(0.5);
  doc.rect(14, summaryY + 24, pageWidth - 28, 15, 'FD');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text('Net Salary (Take Home):', 18, summaryY + 33);
  doc.text(formatCurrencyForPDF(data.netSalary), pageWidth - 22, summaryY + 33, { align: 'right' });
  
  // Reset colors
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);
  
  // Footer Notes
  const footerY = summaryY + 50;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Note: This is a computer-generated payslip and does not require a signature.', 18, footerY);
  doc.text('For any queries, please contact the HR department.', 18, footerY + 5);
  
  // Footer with generation date
  doc.setFillColor(102, 126, 234);
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, pageWidth / 2, pageHeight - 7, { align: 'center' });
  
  // Generate filename
  const fileName = `Payslip_${data.employee.employeeId}_${format(new Date(parseInt(data.selectedYear), data.selectedMonth, 1), 'MMM_yyyy')}.pdf`;
  
  // Save the PDF
  doc.save(fileName);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

// Format currency for PDF (without rupee symbol to avoid encoding issues)
const formatCurrencyForPDF = (amount: number): string => {
  return 'Rs. ' + new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};
