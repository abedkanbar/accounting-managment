import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDatabase } from '../lib/db';
import type { Transaction } from '../lib/db';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateAuditReport } from '@/utils/pdfGenerator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flex } from '@/components/ui/flex';
import { Checkbox } from '@/components/ui/checkbox';
import { Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Pagination from '@/components/Pagination';

type GroupBy = 'month' | 'member' | 'type' | 'bank_account' | 'none';

interface GroupedItem {
  id: string;
  isGroup?: boolean;
  groupName?: string;
  totalCredit?: number;
  totalDebit?: number;
  count?: number;
  transactions?: Transaction[];
}

const Audit = () => {
  const db = useDatabase();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await db.getAllTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
    }
  };

  const groupTransactions = (transactions: Transaction[]) => {
    if (groupBy === 'none') return transactions.map(t => ({ id: t.id!.toString(), ...t }));

    const grouped = transactions.reduce((acc, transaction) => {
      let key = '';
      switch (groupBy) {
        case 'month':
          key = format(new Date(transaction.date), 'yyyy-MM', { locale: fr });
          break;
        case 'member':
          key = transaction.member?.name || 'Sans adhérent';
          break;
        case 'type':
          key = transaction.type?.name || 'Sans type';
          break;
        case 'bank_account':
          key = transaction.bank_account?.name || 'Sans compte';
          break;
      }

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(transaction);
      return acc;
    }, {} as Record<string, Transaction[]>);

    return Object.entries(grouped).flatMap(([group, groupTransactions]) => {
      const totalCredit = groupTransactions.reduce((sum, t) => 
        sum + (t.operation_type === 'CREDIT' ? t.amount : 0), 0);
      const totalDebit = groupTransactions.reduce((sum, t) => 
        sum + (t.operation_type === 'DEBIT' ? t.amount : 0), 0);

      const groupId = `group-${group}`;
      const isExpanded = expandedGroups.has(groupId);

      return [
        {
          id: groupId,
          isGroup: true,
          groupName: group,
          totalCredit,
          totalDebit,
          count: groupTransactions.length,
          transactions: groupTransactions
        },
        ...(isExpanded ? groupTransactions.map(t => ({ id: t.id!.toString(), ...t })) : [])
      ];
    });
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === paginatedTransactions.length) {
      setSelectedItems(new Set());
    } else {
      const newSelected = new Set(paginatedTransactions.map(item => item.id));
      setSelectedItems(newSelected);
    }
  };

  const toggleSelectGroup = (groupId: string, transactions: Transaction[]) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      const transactionIds = transactions.map(t => t.id!.toString());
      
      const allSelected = transactionIds.every(id => prev.has(id));
      if (allSelected) {
        transactionIds.forEach(id => next.delete(id));
      } else {
        transactionIds.forEach(id => next.add(id));
      }
      
      return next;
    });
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

const handleExportSelected = () => {
    const selectedTransactions = transactions.filter(t => 
      selectedItems.has(t.id!.toString())
    );
    
    try {
      const doc = generateAuditReport(selectedTransactions, groupBy);
      doc.save('rapport-audit.pdf');
      toast.success('Rapport PDF généré avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error('Erreur lors de la génération du rapport PDF');
    }
  };

  const groupedTransactions = groupTransactions(transactions);
  const totalItems = groupedTransactions.length;
  const paginatedTransactions = groupedTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const renderTableRow = (item: GroupedItem) => {
    if (item.isGroup) {
      const isExpanded = expandedGroups.has(item.id);
      const allSelected = item.transactions?.every(t => 
        selectedItems.has(t.id!.toString())
      );

      return (
        <TableRow key={item.id} className="bg-muted/50">
          <TableCell>
            <Flex gap={2}>
              <Checkbox 
                checked={allSelected}
                onCheckedChange={() => item.transactions && toggleSelectGroup(item.id, item.transactions)}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleGroup(item.id)}
              >
                {isExpanded ? '▼' : '▶'}
              </Button>
            </Flex>
          </TableCell>
          <TableCell colSpan={2}>
            <strong>{item.groupName}</strong>
          </TableCell>
          <TableCell>
            <Badge variant="success">
              +{item.totalCredit?.toLocaleString('fr-FR')} €
            </Badge>
          </TableCell>
          <TableCell>
            <Badge variant="danger">
              -{item.totalDebit?.toLocaleString('fr-FR')} €
            </Badge>
          </TableCell>
          <TableCell colSpan={3}>
            <em>{item.count} transactions</em>
          </TableCell>
        </TableRow>
      );
    }

    const transaction = item as Transaction;
    return (
      <TableRow key={transaction.id}>
        <TableCell>
          <Checkbox 
            checked={selectedItems.has(transaction.id!.toString())}
            onCheckedChange={() => toggleSelectItem(transaction.id!.toString())}
          />
        </TableCell>
        <TableCell>
          {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: fr })}
        </TableCell>
        <TableCell>{transaction.type?.name}</TableCell>
        <TableCell className={transaction.operation_type === 'CREDIT' ? 'text-success' : 'text-destructive'}>
          {transaction.operation_type === 'CREDIT' ? '+' : '-'}
          {transaction.amount.toLocaleString('fr-FR')} €
        </TableCell>
        <TableCell>
          <Badge variant={transaction.operation_type === 'CREDIT' ? 'success' : 'danger'}>
            {transaction.operation_type === 'CREDIT' ? 'Crédit' : 'Débit'}
          </Badge>
        </TableCell>
        <TableCell>{transaction.payment_method?.name}</TableCell>
        <TableCell>{transaction.bank_account?.name}</TableCell>
        <TableCell>{transaction.member?.name}</TableCell>
      </TableRow>
    );
  };

  return (
    <Container size="full" className="h-full flex flex-col p-0">
      <Card>
        <CardHeader>
          <Flex justify="between" align="center">
            <CardTitle>Audit des transactions</CardTitle>
            <Flex gap={4}>
              <Select
                value={groupBy}
                onValueChange={(value) => setGroupBy(value as GroupBy)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Grouper par..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sans groupement</SelectItem>
                  <SelectItem value="month">Par mois</SelectItem>
                  <SelectItem value="member">Par adhérent</SelectItem>
                  <SelectItem value="type">Par type</SelectItem>
                  <SelectItem value="bank_account">Par compte bancaire</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={handleExportSelected}
                disabled={selectedItems.size === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter la sélection
              </Button>
            </Flex>
          </Flex>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedItems.size === paginatedTransactions.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Nature</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Compte</TableHead>
                  <TableHead>Adhérent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.map(renderTableRow)}
              </TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>
    </Container>
  );
};

export default Audit;