import React, { useState, useEffect } from 'react';
import { Download, Mail, Search, Edit, Trash, Plus, Copy } from 'lucide-react';
import { useDatabase } from '../lib/db';
import type { Transaction, BankAccount } from '../lib/db';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import TransactionModal from '../components/TransactionModal';
import TransactionStats from '../components/TransactionStats';
import useTransactionStats from '../hooks/useTransactionStats';
import DeleteDialog from '@/components/DeleteDialog';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { Flex } from '@/components/ui/flex';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "..//components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "..//components/ui/card";
import { Text } from "..//components/ui/text";

const Transactions = () => {
  const db = useDatabase();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalBalance, setTotalBalance] = useState({
    credit: 0,
    debit: 0,
    balance: 0
  });
  const [accountBalances, setAccountBalances] = useState<Record<number, {
    total_credit: number;
    total_debit: number;
    current_balance: number;
  }>>({});
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    transaction?: Transaction;
  }>({
    isOpen: false,
    transaction: undefined,
  });

  const { stats, loading: statsLoading, error: statsError, reload: reloadStats } = useTransactionStats(['month']);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadData = async () => {
    try {
      const [transactionsData, accountsData] = await Promise.all([
        db.getAllTransactions(),
        db.getAllBankAccounts()
      ]);
      
      setTransactions(transactionsData);
      setAccounts(accountsData);

      // Calculer les totaux globaux
      const totals = transactionsData.reduce((acc, t) => ({
        credit: acc.credit + (t.operation_type === 'CREDIT' ? t.amount : 0),
        debit: acc.debit + (t.operation_type === 'DEBIT' ? t.amount : 0),
        balance: acc.balance + (t.operation_type === 'CREDIT' ? t.amount : -t.amount)
      }), { credit: 0, debit: 0, balance: 0 });
      setTotalBalance(totals);

      // Calculer les soldes par compte
      const balances: Record<number, { total_credit: number; total_debit: number; current_balance: number }> = {};
      accountsData.forEach(account => {
        const accountTransactions = transactionsData.filter(t => t.bank_account_id === account.id);
        const total_credit = accountTransactions.reduce((sum, t) => 
          sum + (t.operation_type === 'CREDIT' ? t.amount : 0), 0);
        const total_debit = accountTransactions.reduce((sum, t) => 
          sum + (t.operation_type === 'DEBIT' ? t.amount : 0), 0);
        const current_balance = (account.initial_balance || 0) + total_credit - total_debit;

        balances[account.id!] = {
          total_credit,
          total_debit,
          current_balance
        };
      });
      setAccountBalances(balances);

      reloadStats();
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des transactions');
    }
  };

  const handleNewTransaction = () => {
    setSelectedTransaction(undefined);
    setShowModal(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setDeleteDialog({ isOpen: true, transaction });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.transaction) {
      try {
        await db.deleteTransaction(deleteDialog.transaction.id!);
        toast.success('Transaction supprimée avec succès');
        loadData();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
    setDeleteDialog({ isOpen: false, transaction: undefined });
  };

  const sendInvoice = async (transaction: Transaction) => {
    try {
      // Implémenter l'envoi de facture ici
      toast.success('Facture envoyée avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la facture');
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const searchStr = searchTerm.toLowerCase();
    return (
      t.type?.name.toLowerCase().includes(searchStr) ||
      t.member?.name.toLowerCase().includes(searchStr) ||
      t.bank_account?.name.toLowerCase().includes(searchStr) ||
      t.description?.toLowerCase().includes(searchStr)
    );
  });

  const totalItems = filteredTransactions.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + pageSize);

  return (
    <Container size="full" className="h-full flex flex-col p-0">
      <Card>
        <CardHeader>
          <Flex justify="between" align="center">
            <div>
              <CardTitle>Transactions</CardTitle>
              <Flex direction="col" gap={2} className="mt-2">
                <Text className="text-sm text-muted-foreground">
                  Total Crédit: <Text as="span" className="text-green-600 font-medium">
                    {totalBalance.credit.toLocaleString('fr-FR')} €
                  </Text>
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Total Débit: <Text as="span" className="text-red-600 font-medium">
                    {totalBalance.debit.toLocaleString('fr-FR')} €
                  </Text>
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Balance: <Text as="span" className={`font-medium ${totalBalance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalBalance.balance.toLocaleString('fr-FR')} €
                  </Text>
                </Text>
                {accounts.map(account => (
                  <Text key={account.id} className="text-sm text-muted-foreground">
                    <Text as="span" className="font-medium">{account.name}:</Text>
                    <Text as="span" className={`ml-2 ${accountBalances[account.id!]?.current_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {accountBalances[account.id!]?.current_balance.toLocaleString('fr-FR')} €
                    </Text>
                  </Text>
                ))}
              </Flex>
            </div>
            <Flex gap={2}>
              <Button onClick={handleNewTransaction}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle transaction
              </Button>
              
            </Flex>
          </Flex>
        </CardHeader>

        <CardContent>
          <TransactionStats stats={stats} loading={statsLoading} error={statsError} />

          <Card className="mt-6">
            <CardContent className="p-0">
              <Flex className="p-4 border-b">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une transaction..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </Flex>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Nature</TableHead>
                    <TableHead>Paiement</TableHead>
                    <TableHead>Description</TableHead>                    
                    <TableHead>Compte</TableHead>                    
                    <TableHead>Adhérent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>{transaction.type?.name}</TableCell>
                      <TableCell className={transaction.operation_type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.operation_type === 'CREDIT' ? '+' : '-'}
                        {transaction.amount.toLocaleString('fr-FR')} €
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.operation_type === 'CREDIT' ? 'success' : 'danger'}>
                          {transaction.operation_type === 'CREDIT' ? 'Crédit' : 'Débit'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.payment_method?.name}
                        {transaction.check_reference && ` (${transaction.check_reference})`}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.bank_account?.name}</TableCell>
                      <TableCell>{transaction.member?.name}</TableCell>
                      <TableCell>
                        <Flex gap={2}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(transaction)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => sendInvoice(transaction)}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedTransaction({
                                ...transaction,
                                id: undefined,
                                date: new Date(),
                                created_at: undefined
                              });
                              setShowModal(true);
                            }}
                            title="Dupliquer la transaction"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </Flex>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <TransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={loadData}
        transaction={selectedTransaction}
      />

      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, transaction: undefined })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la transaction"
        description="Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action est irréversible."
      />
    </Container>
  );
};

export default Transactions;