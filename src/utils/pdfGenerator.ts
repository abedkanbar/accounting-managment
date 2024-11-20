import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Transaction } from '../lib/db';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateAuditReport = (
  transactions: Transaction[],
  groupBy?: string
) => {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFontSize(20);
  doc.text('Rapport d\'audit des transactions', 20, 20);
  
  // Date du rapport
  doc.setFontSize(12);
  doc.text(`Date du rapport: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })}`, 20, 30);

  // Statistiques globales
  const totalCredit = transactions.reduce((sum, t) => 
    sum + (t.operation_type === 'CREDIT' ? t.amount : 0), 0);
  const totalDebit = transactions.reduce((sum, t) => 
    sum + (t.operation_type === 'DEBIT' ? t.amount : 0), 0);
  const balance = totalCredit - totalDebit;

  doc.text(`Total Crédit: ${totalCredit.toLocaleString('fr-FR')} €`, 20, 47);
  doc.text(`Total Débit: ${totalDebit.toLocaleString('fr-FR')} €`, 20, 54);
  doc.text(`Balance: ${balance.toLocaleString('fr-FR')} €`, 20, 61);
  doc.text(`Nombre de transactions: ${transactions.length}`, 20, 68);

  // Table des transactions
  const tableData = transactions.map(t => [
    format(new Date(t.date), 'dd/MM/yyyy', { locale: fr }),
    t.type?.name || '',
    t.operation_type === 'CREDIT' 
      ? `+${t.amount.toLocaleString('fr-FR')} €` 
      : `-${t.amount.toLocaleString('fr-FR')} €`,
    t.operation_type === 'CREDIT' ? 'Crédit' : 'Débit',
    t.payment_method?.name || '',
    t.bank_account?.name || '',
    t.member?.name || '',
    t.description || ''
  ]);

  (doc as any).autoTable({
    startY: 80,
    head: [['Date', 'Type', 'Montant', 'Nature', 'Paiement', 'Compte', 'Adhérent', 'Description']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] },
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 20 }, // Date
      1: { cellWidth: 25 }, // Type
      2: { cellWidth: 20 }, // Montant
      3: { cellWidth: 15 }, // Nature
      4: { cellWidth: 25 }, // Paiement
      5: { cellWidth: 25 }, // Compte
      6: { cellWidth: 25 }, // Adhérent
      7: { cellWidth: 'auto' } // Description
    }
  });

  return doc;
};