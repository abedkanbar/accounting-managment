import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, Edit, Trash } from 'lucide-react';
import { useDatabase } from '../lib/db';
import type { BankAccount } from '../lib/db';
import toast from 'react-hot-toast';
import BankAccountModal from '../components/BankAccountModal';
import DeleteDialog from '@/components/DeleteDialog';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const BankAccounts = () => {
  const db = useDatabase();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | undefined>();
  const [accountBalances, setAccountBalances] = useState<Record<number, {
    total_credit: number;
    total_debit: number;
    current_balance: number;
  }>>({});
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    account?: BankAccount;
  }>({
    isOpen: false,
    account: undefined,
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const [accountsData, transactionsData] = await Promise.all([
        db.getAllBankAccounts(),
        db.getAllTransactions()
      ]);

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

      setAccounts(accountsData);
      setAccountBalances(balances);
    } catch (error) {
      toast.error('Erreur lors du chargement des comptes');
    }
  };

  const handleEdit = (account: BankAccount) => {
    setSelectedAccount(account);
    setShowModal(true);
  };

  const handleDeleteClick = (account: BankAccount) => {
    setDeleteDialog({ isOpen: true, account });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.account) {
      try {
        await db.deleteBankAccount(deleteDialog.account.id!);
        toast.success('Compte bancaire supprimé avec succès');
        loadAccounts();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
    setDeleteDialog({ isOpen: false, account: undefined });
  };

  const handleNewAccount = () => {
    setSelectedAccount(undefined);
    setShowModal(true);
  };

  const totalBalance = Object.values(accountBalances).reduce((sum, balance) => sum + balance.current_balance, 0);
  const totalCredit = Object.values(accountBalances).reduce((sum, balance) => sum + balance.total_credit, 0);
  const totalDebit = Object.values(accountBalances).reduce((sum, balance) => sum + balance.total_debit, 0);

return (
    <Container size="full" className="h-full flex flex-col p-0">
      <Card>
        <CardHeader>
          <Flex justify="between" align="center">
            <div>
              <CardTitle>Comptes bancaires</CardTitle>
              <Flex direction="col" gap={1} className="mt-2">
                <Text className="text-sm text-muted-foreground">
                  Total Crédit:&nbsp;
                  <Text as="span" className="text-green-600 font-medium">
                    {totalCredit.toLocaleString('fr-FR')} €
                  </Text>
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Total Débit:&nbsp;
                  <Text as="span" className="text-red-600 font-medium">
                    {totalDebit.toLocaleString('fr-FR')} €
                  </Text>
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Balance Globale:&nbsp;
                  <Text as="span" className={`font-medium ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalBalance.toLocaleString('fr-FR')} €
                  </Text>
                </Text>
              </Flex>
            </div>
            <Button onClick={handleNewAccount}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau compte
            </Button>
          </Flex>
        </CardHeader>

        <CardContent>
          <Flex className="flex-wrap" gap={6}>
            {accounts.map((account) => (
              <Card key={account.id} className="flex-1 min-w-[300px] mr-4">
                <CardContent className="p-6">
                  <Flex justify="between" align="center" className="mb-4">
                    <Flex gap={2} align="center">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      <Text variant="h3">{account.name}</Text>
                    </Flex>
                    <Flex gap={2}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(account)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(account)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </Flex>
                  </Flex>

                  <Flex direction="col" gap={2}>
                    <Text className="text-sm text-muted-foreground">
                      Banque:&nbsp;{account.bank}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      IBAN:&nbsp;{account.iban}
                    </Text>

                    <Flex direction="col" gap={2} className="mt-2 pt-2 border-t">
                      <Flex justify="between">
                        <Text className="text-sm text-muted-foreground">Solde initial:&nbsp;</Text>
                        <Text className="text-sm font-medium">
                          {account.initial_balance?.toLocaleString('fr-FR')} €
                        </Text>
                      </Flex>
                      <Flex justify="between">
                        <Text className="text-sm text-muted-foreground">Total Crédit:&nbsp;</Text>
                        <Text className="text-sm font-medium text-green-600">
                          {accountBalances[account.id!]?.total_credit.toLocaleString('fr-FR')} €
                        </Text>
                      </Flex>
                      <Flex justify="between">
                        <Text className="text-sm text-muted-foreground">Total Débit:&nbsp;</Text>
                        <Text className="text-sm font-medium text-red-600">
                          {accountBalances[account.id!]?.total_debit.toLocaleString('fr-FR')} €
                        </Text>
                      </Flex>
                      <Flex justify="between" className="mt-2 pt-2 border-t">
                        <Text className="text-sm text-muted-foreground">Solde actuel:&nbsp;</Text>
                        <Text className={`text-sm font-bold ${accountBalances[account.id!]?.current_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {accountBalances[account.id!]?.current_balance.toLocaleString('fr-FR')} €
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </CardContent>
              </Card>
            ))}
          </Flex>
        </CardContent>
      </Card>

      <BankAccountModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={loadAccounts}
        account={selectedAccount}
      />

      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, account: undefined })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le compte bancaire"
        description="Êtes-vous sûr de vouloir supprimer ce compte bancaire ? Cette action supprimera également toutes les transactions associées."
      />
    </Container>
  );
};

export default BankAccounts;