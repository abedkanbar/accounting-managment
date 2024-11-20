import React, { createContext, useContext } from 'react';
import { supabase } from './supabase';

// Types
export interface Member {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  status_id: number;
  created_at?: Date;
  status?: MemberStatus;
}

export interface MemberStatus {
  id: number;
  name: string;
  description?: string;
}

export interface BankAccount {
  id?: number;
  name: string;
  bank: string;
  iban: string;
  initial_balance: number;
  current_balance?: number;
  total_credit?: number;
  total_debit?: number;
  created_at?: Date;
}

export interface Transaction {
  id?: number;
  date: Date;
  type_id: number;
  amount: number;
  operation_type: 'DEBIT' | 'CREDIT';
  payment_method_id: number;
  member_id: number;
  bank_account_id: number;
  description?: string;
  check_reference?: string;
  created_at?: Date;
  type?: TransactionType;
  payment_method?: PaymentMethod;
  member?: Member;
  bank_account?: BankAccount;
}

export interface TransactionType {
  id: number;
  name: string;
  description?: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  description?: string;
}

export interface TransactionStats {
  group_values: Record<string, string | number>;
  count: number;
  total_debit: number;
  total_credit: number;
  balance: number;
}

// Database context type
interface DatabaseContextType {
  getAllMembers: () => Promise<Member[]>;
  getMemberStatuses: () => Promise<MemberStatus[]>;
  insertMember: (member: Omit<Member, 'id' | 'created_at'>) => Promise<Member>;
  updateMember: (id: number, member: Partial<Member>) => Promise<Member>;
  deleteMember: (id: number) => Promise<void>;
  
  getAllBankAccounts: () => Promise<BankAccount[]>;
  insertBankAccount: (account: Omit<BankAccount, 'id' | 'created_at'>) => Promise<BankAccount>;
  updateBankAccount: (id: number, account: Partial<BankAccount>) => Promise<BankAccount>;
  deleteBankAccount: (id: number) => Promise<void>;
  
  getAllTransactions: () => Promise<Transaction[]>;
  getTransactionTypes: () => Promise<TransactionType[]>;
  getPaymentMethods: () => Promise<PaymentMethod[]>;
  getTransactionStats: (groupBy: string[]) => Promise<TransactionStats[]>;
  insertTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<Transaction>;
  updateTransaction: (id: number, transaction: Partial<Transaction>) => Promise<Transaction>;
  deleteTransaction: (id: number) => Promise<void>;
}

// Create context
const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Database provider component
export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getAllMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        status:member_statuses(*)
      `)
      .order('name');
    
    if (error) throw error;
    return data;
  };

  const getMemberStatuses = async () => {
    const { data, error } = await supabase
      .from('member_statuses')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  };

  const insertMember = async (member: Omit<Member, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('members')
      .insert([member])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const updateMember = async (id: number, member: Partial<Member>) => {
    const { data, error } = await supabase
      .from('members')
      .update(member)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const deleteMember = async (id: number) => {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  };

  const getAllBankAccounts = async () => {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  };

  const insertBankAccount = async (account: Omit<BankAccount, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert([account])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const updateBankAccount = async (id: number, account: Partial<BankAccount>) => {
    const { data, error } = await supabase
      .from('bank_accounts')
      .update(account)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const deleteBankAccount = async (id: number) => {
    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  };

  const getAllTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        type:transaction_types(*),
        payment_method:payment_methods(*),
        member:members(*),
        bank_account:bank_accounts(*)
      `)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  };

  const getTransactionTypes = async () => {
    const { data, error } = await supabase
      .from('transaction_types')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  };

  const getPaymentMethods = async () => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  };

  const getTransactionStats = async (groupBy: string[]) => {
    const { data, error } = await supabase
      .rpc('get_transaction_stats', { group_by: groupBy });
    
    if (error) throw error;
    return data;
  };

  const insertTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const updateTransaction = async (id: number, transaction: Partial<Transaction>) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(transaction)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const deleteTransaction = async (id: number) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  };

  const value = {
    getAllMembers,
    getMemberStatuses,
    insertMember,
    updateMember,
    deleteMember,
    getAllBankAccounts,
    insertBankAccount,
    updateBankAccount,
    deleteBankAccount,
    getAllTransactions,
    getTransactionTypes,
    getPaymentMethods,
    getTransactionStats,
    insertTransaction,
    updateTransaction,
    deleteTransaction
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};