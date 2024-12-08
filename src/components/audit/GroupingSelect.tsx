import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GroupingSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function GroupingSelect({ value, onChange }: GroupingSelectProps) {
  const groupingOptions = [
    { value: 'none', label: 'Sans groupement' },
    { value: 'month', label: 'Par mois' },
    { value: 'contact', label: 'Par adhérent' },
    { value: 'type', label: 'Par type' },
    { value: 'bank_account', label: 'Par compte bancaire' }
  ];

  return (
    <Select
      value={value.length === 0 ? 'none' : value[0]}
      onValueChange={(newValue) => {
        if (newValue === 'none') {
          onChange([]);
        } else {
          onChange([newValue]);
        }
      }}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Choisir un groupement" />
      </SelectTrigger>
      <SelectContent>
        {groupingOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}