import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Operation } from '../lib/api';
import { getMoyenPaiementLabel } from '../lib/api';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface GenerateReportParams {
  allOperations: Operation[];
  getContactName: (id?: number) => string;
  months: { value: number; label: string; }[];
}

export const generateOperationsReport = ({ 
  allOperations, 
  getContactName,
  months
}: GenerateReportParams) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  // En-tête
  doc.setFontSize(20);
  doc.text('Rapport des opérations', 15, 20);
  
  // Date du rapport
  doc.setFontSize(12);
  doc.text(`Date du rapport: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })}`, 15, 30);

  // Statistiques globales
  const totalCredit = allOperations.reduce((sum, op) => 
    sum + (parseFloat(op.credit) || 0), 0);
  const totalDebit = allOperations.reduce((sum, op) => 
    sum + (parseFloat(op.debit) || 0), 0);
  const balance = totalCredit + totalDebit;

  doc.text(`Total Crédit: ${totalCredit} €`, 15, 40);
  doc.text(`Total Débit: ${totalDebit} €`, 15, 50);
  doc.text(`Balancezz: ${parseFloat(balance).toFixed(2)} €`, 15, 60);
  doc.text(`Nombre d'opérations: ${allOperations.length}`, 15, 70);

  // Table des opérations
  const tableData = allOperations.map(op => [
    op.idoperation || '',
    getContactName(op.idcontactcotisant),
    op.libelle || '',
    getMoyenPaiementLabel(op.moyenpaiement),
    op.credit ? `${parseFloat(op.credit).toLocaleString('fr-FR')} €` : '0 €',
    op.debit ? `${parseFloat(op.debit).toLocaleString('fr-FR')} €` : '0 €',
    op.anneecotisation || '',
    months.find((month) => month.value === op.moiscotisation)?.label || ''
  ]);

  (doc as any).autoTable({
    startY: 65,
    head: [['ID', 'Contact', 'Libellé', 'Paiement', 'Crédit', 'Débit', 'Année', 'Mois']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] },
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 10 }, // ID
      1: { cellWidth: 40 }, // Contact
      2: { cellWidth: 60 }, // Libellé
      3: { cellWidth: 30 }, // Paiement
      4: { cellWidth: 20 }, // Crédit
      5: { cellWidth: 20 }, // Débit
      6: { cellWidth: 20 }, // Année
      7: { cellWidth: 25 }  // Mois
    }
  });

  return doc;
};