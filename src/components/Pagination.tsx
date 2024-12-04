import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { Flex } from '@/components/ui/flex';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const pageSizeOptions = [10, 20, 50, 100];

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="border-t border-border bg-background px-4 py-3">
      <Flex justify="between" align="center">
        <Text variant="muted">
          Affichage de{' '}
          <Text as="span" weight="medium">{startItem}</Text>
          {' à '}
          <Text as="span" weight="medium">{endItem}</Text>
          {' sur '}
          <Text as="span" weight="medium">{totalItems}</Text>
          {' résultats'}
        </Text>
        
        <Flex gap={4} align="center">
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size} par page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Flex gap={2}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" className="min-w-[80px]" disabled>
              {currentPage} / {totalPages}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
};

export default Pagination;