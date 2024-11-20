// import React, { useState, useEffect } from 'react';
// import { useDatabase } from '../lib/db';
// import type { BankAccount } from '../lib/db';
// import { Button } from '../components/ui/button';
// import { Input } from '../components/ui/input';
// import { Label } from '../components/ui/label';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "../components/ui/dialog";

// interface BankAccountModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: () => void;
//   account?: BankAccount;
// }

// const BankAccountModal = ({ isOpen, onClose, onSave, account }: BankAccountModalProps) => {
//   const db = useDatabase();
//   const [formData, setFormData] = useState<Omit<BankAccount, 'id' | 'created_at'>>({
//     name: '',
//     bank: '',
//     iban: '',
//     initial_balance: 0
//   });

//   useEffect(() => {
//     if (account) {
//       setFormData({
//         name: account.name,
//         bank: account.bank,
//         iban: account.iban,
//         initial_balance: account.initial_balance || 0
//       });
//     } else {
//       setFormData({
//         name: '',
//         bank: '',
//         iban: '',
//         initial_balance: 0
//       });
//     }
//   }, [account, isOpen]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       if (account?.id) {
//         await db.updateBankAccount(account.id, formData);
//         toast.success('Compte bancaire mis à jour avec succès');
//       } else {
//         await db.insertBankAccount(formData);
//         toast.success('Compte bancaire ajouté avec succès');
//       }
//       onSave();
//       onClose();
//     } catch (error: any) {
//       toast.error(error.message || 'Erreur lors de l\'enregistrement');
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>
//             {account ? 'Modifier le compte bancaire' : 'Nouveau compte bancaire'}
//           </DialogTitle>
//           <DialogDescription>
//             {account 
//               ? 'Modifiez les informations du compte bancaire ci-dessous.' 
//               : 'Ajoutez un nouveau compte bancaire en remplissant le formulaire ci-dessous.'}
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="name">Nom du compte</Label>
//             <Input
//               id="name"
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="bank">Banque</Label>
//             <Input
//               id="bank"
//               value={formData.bank}
//               onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="iban">IBAN</Label>
//             <Input
//               id="iban"
//               value={formData.iban}
//               onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
//               required
//               pattern="[A-Z]{2}[0-9]{2}[\s-]?[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}"
//               placeholder="FR76 1234 5678 9012 3456 7890 123"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="initial_balance">Solde initial</Label>
//             <Input
//               id="initial_balance"
//               type="number"
//               step="0.01"
//               value={formData.initial_balance}
//               onChange={(e) => setFormData({ ...formData, initial_balance: parseFloat(e.target.value) })}
//               required
//             />
//           </div>

//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={onClose}>
//               Annuler
//             </Button>
//             <Button type="submit">
//               {account ? 'Mettre à jour' : 'Enregistrer'}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default BankAccountModal;