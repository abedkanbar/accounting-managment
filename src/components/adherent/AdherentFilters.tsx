import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Flex } from "@/components/ui/flex";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface AdherentFiltersProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  searchValue: string;
}

export function AdherentFilters({
  selectedYear,
  onYearChange,
  onSearchChange,
  onClearFilters,
  hasActiveFilters,
  searchValue,
}: AdherentFiltersProps) {
  const years = Array.from({ length: 3 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return year.toString();
  });

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <h2 className="text-lg font-semibold">Filtres</h2>
          <Flex justify="between" align="center" className="w-full">
            {hasActiveFilters && (
              <Flex gap={2}>
                <Separator orientation="vertical" className="h-4" />
                <Button variant="ghost" size="sm" onClick={onClearFilters}>
                  Réinitialiser
                </Button>
              </Flex>
            )}
          </Flex>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="Rechercher par nom ou prénom..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div>
            <Select value={selectedYear} onValueChange={onYearChange}>
              <SelectTrigger>
                <SelectValue placeholder="Année scolaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les années</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}-{parseInt(year) + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}