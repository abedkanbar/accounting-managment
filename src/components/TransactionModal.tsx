import React, { useState, useEffect } from 'react';
import { useDatabase } from '../lib/db';
import type { Transaction, Member, TransactionType, PaymentMethod, BankAccount } from '../lib/db';
import toast from 'react-hot-toast';
import { X, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Flex } from '@/components/ui/flex';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  transaction?: Transaction;
}

const TransactionModal = ({ isOpen, onClose, onSave, transaction }: TransactionModalProps) => {
  const db = useDatabase();
  const [members, setMembers] = useState<Member[]>([]);
  const [types, setTypes] = useState<TransactionType[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [formData, setFormData] = useState<Omit<Transaction, 'id' | 'created_at'>>({
    date: new Date(),
    type_id: 0,
    amount: 0,
    operation_type: 'CREDIT',
    payment_method_id: 0,
    member_id: 0,
    bank_account_id: 0,
    description: '',
    check_reference: ''
  });

  useEffect(() => {
    loadData();
    if (transaction) {
      setFormData({
        date: new Date(transaction.date),
        type_id: transaction.type_id,
        amount: transaction.amount,
        operation_type: transaction.operation_type,
        payment_method_id: transaction.payment_method_id,
        member_id: transaction.member_id,
        bank_account_id: transaction.bank_account_id,
        description: transaction.description || '',
        check_reference: transaction.check_reference || ''
      });
    } else {
      setFormData({
        date: new Date(),
        type_id: 0,
        amount: 0,
        operation_type: 'CREDIT',
        payment_method_id: 0,
        member_id: 0,
        bank_account_id: 0,
        description: '',
        check_reference: ''
      });
    }
  }, [transaction, isOpen]);

  const loadData = async () => {
    try {
      const [membersData, typesData, methodsData, accountsData] = await Promise.all([
        db.getAllMembers(),
        db.getTransactionTypes(),
        db.getPaymentMethods(),
        db.getAllBankAccounts()
      ]);

      setMembers(membersData);
      setTypes(typesData);
      setPaymentMethods(methodsData);
      setBankAccounts(accountsData);

      if (!transaction) {
        setFormData(prev => ({
          ...prev,
          type_id: typesData[0]?.id || 0,
          payment_method_id: methodsData[0]?.id || 0,
          bank_account_id: accountsData[0]?.id || 0
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (transaction?.id) {
        await db.updateTransaction(transaction.id, formData);
        toast.success('Transaction mise à jour avec succès');
      } else {
        await db.insertTransaction(formData);
        toast.success('Transaction ajoutée avec succès');
      }
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast.error(error.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const isCheckPayment = paymentMethods.find(m => m.id === formData.payment_method_id)?.name === 'Chèque';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Modifier la transaction' : 'Nouvelle transaction'}
          </DialogTitle>
          <DialogDescription>
            {transaction 
              ? 'Modifiez les informations de la transaction ci-dessous.' 
              : 'Ajoutez une nouvelle transaction en remplissant le formulaire ci-dessous.'}
          </DialogDescription>
        </DialogHeader>

        <DialogHeader>
          <DialogTitle>
            {transaction?.id 
              ? 'Modifier la transaction' 
              : transaction 
                ? 'Dupliquer la transaction'
                : 'Nouvelle transaction'}
          </DialogTitle>
          <DialogDescription>
            {transaction?.id 
              ? 'Modifiez les informations de la transaction ci-dessous.'
              : transaction
                ? 'Créez une nouvelle transaction basée sur celle-ci.'
                : 'Ajoutez une nouvelle transaction en remplissant le formulaire ci-dessous.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Flex direction="col" gap={4}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date.toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type_id.toString()}
                  onValueChange={(value) => setFormData({ ...formData, type_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nature de l'opération</Label>
              <RadioGroup
                value={formData.operation_type}
                onValueChange={(value) => setFormData({ ...formData, operation_type: value as 'CREDIT' | 'DEBIT' })}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="CREDIT" id="credit" />
                  <Label htmlFor="credit" className="text-green-600">Crédit (Entrée)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DEBIT" id="debit" />
                  <Label htmlFor="debit" className="text-red-600">Débit (Sortie)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Montant</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  required
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Moyen de paiement</Label>
                <Select
                  value={formData.payment_method_id.toString()}
                  onValueChange={(value) => setFormData({ ...formData, payment_method_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un moyen de paiement" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id.toString()}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_account">Compte bancaire</Label>
                <Select
                  value={formData.bank_account_id.toString()}
                  onValueChange={(value) => setFormData({ ...formData, bank_account_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un compte" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="member">Adhérent</Label>
                <Select
                  value={formData.member_id.toString()}
                  onValueChange={(value) => setFormData({ ...formData, member_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un adhérent" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isCheckPayment && (
              <div className="space-y-2">
                <Label htmlFor="check_reference">N° de chèque</Label>
                <Input
                  id="check_reference"
                  type="text"
                  value={formData.check_reference || ''}
                  onChange={(e) => setFormData({ ...formData, check_reference: e.target.value })}
                  placeholder="Numéro du chèque"
                  required={isCheckPayment}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </Flex>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {transaction?.id ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;