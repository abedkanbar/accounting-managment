import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { DraggableGrouping } from "./DraggableGrouping";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GroupingOption {
  value: string;
  label: string;
}

interface GroupingZoneProps {
  options: GroupingOption[];
  activeGroups: string[];
  onGroupsChange: (groups: string[]) => void;
}

export function GroupingZone({
  options,
  activeGroups,
  onGroupsChange,
}: GroupingZoneProps) {
  const [isAdding, setIsAdding] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = activeGroups.indexOf(active.id.toString());
      const newIndex = activeGroups.indexOf(over.id.toString());
      onGroupsChange(arrayMove(activeGroups, oldIndex, newIndex));
    }
  };

  const handleAddGroup = (value: string) => {
    if (!activeGroups.includes(value)) {
      onGroupsChange([...activeGroups, value]);
    }
    setIsAdding(false);
  };

  const handleRemoveGroup = (value: string) => {
    onGroupsChange(activeGroups.filter((group) => group !== value));
  };

  const availableOptions = options.filter(
    (option) => !activeGroups.includes(option.value)
  );

  return (
    <div className="flex items-center gap-4 min-h-[48px] p-4 bg-muted/50 rounded-lg">
      {activeGroups.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={activeGroups}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-2 flex-wrap">
              {activeGroups.map((group) => (
                <DraggableGrouping
                  key={group}
                  id={group}
                  label={options.find((opt) => opt.value === group)?.label || group}
                  onRemove={() => handleRemoveGroup(group)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-sm text-muted-foreground">
          Faites glisser les colonnes ici pour grouper les opérations
        </div>
      )}

      {availableOptions.length > 0 && (
        <div className="ml-auto flex items-center gap-2">
          {isAdding ? (
            <Select onValueChange={handleAddGroup}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Choisir un groupement" />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un groupement
            </Button>
          )}
        </div>
      )}
    </div>
  );
}