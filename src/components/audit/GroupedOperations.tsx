import { useState } from "react";
import { Operation } from "@/lib/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface GroupedOperationsProps {
  operations: Operation[];
  groupBy: string[];
  getContactName: (id?: number) => string;
  getBankAccountName: (id?: number) => string;
  getTypeOperationLabel: (id: number) => string;
  onExportSelection: (operations: Operation[]) => void;
}

interface GroupData {
  key: string;
  operations: Operation[];
  totalCredit: number;
  totalDebit: number;
  children?: GroupData[];
}

export function GroupedOperations({
  operations,
  groupBy,
  getContactName,
  getBankAccountName,
  getTypeOperationLabel,
  onExportSelection,
}: GroupedOperationsProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedOperations, setSelectedOperations] = useState<Set<number>>(new Set());

  const getGroupKey = (operation: Operation, groupType: string): string => {
    switch (groupType) {
      case 'month':
        return format(new Date(operation.dateoperation), 'MMMM yyyy', { locale: fr });
      case 'contact':
        return getContactName(operation.idcontactcotisant) || 'Sans adhérent';
      case 'type':
        return getTypeOperationLabel(operation.idtypeoperation);
      case 'bank_account':
        return getBankAccountName(operation.idcomptedestination) || 'Sans compte';
      default:
        return 'Autres';
    }
  };

  const groupOperations = (ops: Operation[], groupLevels: string[], currentPath: string = ''): GroupData[] => {
    if (groupLevels.length === 0) {
      return [];
    }

    const currentLevel = groupLevels[0];
    const remainingLevels = groupLevels.slice(1);
    const groups = new Map<string, Operation[]>();

    // Group operations by current level
    ops.forEach(operation => {
      const key = getGroupKey(operation, currentLevel);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(operation);
    });

    // Convert map to array and process each group
    return Array.from(groups.entries()).map(([key, groupOps]) => {
      const totalCredit = groupOps.reduce((sum, op) => sum + (parseFloat(op.credit) || 0), 0);
      const totalDebit = groupOps.reduce((sum, op) => sum + (parseFloat(op.debit) || 0), 0);
      const groupPath = `${currentPath}-${key}`;

      return {
        key,
        operations: groupOps,
        totalCredit,
        totalDebit,
        children: remainingLevels.length > 0 ? groupOperations(groupOps, remainingLevels, groupPath) : undefined
      };
    }).sort((a, b) => a.key.localeCompare(b.key));
  };

  const renderOperationsTable = (ops: Operation[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]"></TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Libellé</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Crédit</TableHead>
          <TableHead>Débit</TableHead>
          <TableHead>Solde</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ops.map((operation) => {
          const credit = operation.credit || 0;
          const debit = operation.debit || 0;
          const balance = credit + debit;

          return (
            <TableRow key={operation.idoperation}>
              <TableCell>
                <Checkbox
                  checked={selectedOperations.has(operation.idoperation!)}
                  onCheckedChange={() => {
                    const newSelected = new Set(selectedOperations);
                    if (newSelected.has(operation.idoperation!)) {
                      newSelected.delete(operation.idoperation!);
                    } else {
                      newSelected.add(operation.idoperation!);
                    }
                    setSelectedOperations(newSelected);
                  }}
                />
              </TableCell>
              <TableCell>
                {format(new Date(operation.dateoperation), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>{operation.libelle}</TableCell>
              <TableCell>{getTypeOperationLabel(operation.idtypeoperation)}</TableCell>
              <TableCell className="text-green-600">
                {credit > 0 ? `${credit} €` : '-'}
              </TableCell>
              <TableCell className="text-red-600">
                {debit < 0 ? `${Math.abs(debit)} €` : '-'}
              </TableCell>
              <TableCell className={balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                {parseFloat(balance).toFixed(2)} €
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  const renderGroup = (group: GroupData, level: number = 0, path: string = '') => {
    const currentPath = `${path}-${group.key}`;
    const isExpanded = expandedGroups.has(currentPath);
    const hasChildren = group.children && group.children.length > 0;
    const padding = level * 1.5;

    return (
      <Card key={currentPath} className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4" style={{ marginLeft: `${padding}rem` }}>
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto"
              onClick={() => {
                const newExpanded = new Set(expandedGroups);
                if (isExpanded) {
                  newExpanded.delete(currentPath);
                } else {
                  newExpanded.add(currentPath);
                }
                setExpandedGroups(newExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            <Checkbox
              checked={group.operations.every(op => selectedOperations.has(op.idoperation!))}
              onCheckedChange={(checked) => {
                const newSelected = new Set(selectedOperations);
                group.operations.forEach(op => {
                  if (checked) {
                    newSelected.add(op.idoperation!);
                  } else {
                    newSelected.delete(op.idoperation!);
                  }
                });
                setSelectedOperations(newSelected);
              }}
            />

            <span className="font-semibold">{group.key}</span>

            <div className="ml-auto flex gap-4">
              <Badge variant="success">
                Crédit: {group.totalCredit.toLocaleString('fr-FR')} €
              </Badge>
              <Badge variant="destructive">
                Débit: {group.totalDebit.toLocaleString('fr-FR')} €
              </Badge>
              <Badge>
                Solde: {(group.totalCredit + group.totalDebit).toLocaleString('fr-FR')} €
              </Badge>
            </div>
          </div>

          {isExpanded && (
            <div style={{ marginLeft: `${padding}rem` }}>
              {hasChildren ? (
                group.children!.map(child => renderGroup(child, level + 1, currentPath))
              ) : (
                renderOperationsTable(group.operations)
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const groupedData = groupOperations(operations, groupBy);

  return (
    <div className="space-y-4">
      {selectedOperations.size > 0 && (
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={() => onExportSelection(operations.filter(op => selectedOperations.has(op.idoperation!)))}
          >
            Exporter la sélection ({selectedOperations.size})
          </Button>
        </div>
      )}

      {groupedData.map(group => renderGroup(group))}
    </div>
  );
}