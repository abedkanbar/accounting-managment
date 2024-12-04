import React from 'react';
import type { TransactionStats } from '../lib/db';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Flex } from "@/components/ui/flex";
import { Text } from "@/components/ui/text";

interface TransactionStatsProps {
  stats: TransactionStats[];
  loading?: boolean;
  error?: Error | null;
}

const TransactionStats: React.FC<TransactionStatsProps> = ({ stats, loading, error }) => {
  if (loading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertDescription>
          Une erreur est survenue lors du chargement des statistiques
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats?.length) {
    return (
      <Alert className="mt-4">
        <AlertDescription>
          Aucune statistique disponible pour la période sélectionnée
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Flex direction="row" gap={4} className="mt-4 flex-wrap">
      {stats.map((stat, index) => (
        index < 3 && (
          <Card key={index} className="flex-1 min-w-[250px]">
            <CardContent className="p-4">
              <Text variant="h4" className="mb-2">
                {Object.entries(stat.group_values).map(([key, value]) => (
                  `${key}: ${value}`
                )).join(' - ')}
              </Text>
              <Flex direction="col" gap={1}>
                <Text>
                  Nombre des transactions: <Text as="span" className="font-medium">{stat.count}</Text>
                </Text>
                <Text>
                  Crédit: <Text as="span" className="text-green-600 font-medium">
                    {stat.total_credit.toLocaleString('fr-FR')} €
                  </Text>
                </Text>
                <Text>
                  Débit: <Text as="span" className="text-red-600 font-medium">
                    {stat.total_debit.toLocaleString('fr-FR')} €
                  </Text>
                </Text>
                <Text>
                  Balance: <Text as="span" className={`font-medium ${stat.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.balance.toLocaleString('fr-FR')} €
                  </Text>
                </Text>
              </Flex>
            </CardContent>
          </Card>
        )
      ))}
    </Flex>
  );
};

export default TransactionStats;