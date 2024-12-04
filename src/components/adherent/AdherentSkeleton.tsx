import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Flex } from "@/components/ui/flex";

export function AdherentSkeleton() {
  return (
    <Container size="full" className="h-full flex flex-col p-0">
      <Card>
        <CardHeader>
          <Flex justify="between" align="center">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-10 w-[150px]" />
          </Flex>
        </CardHeader>
        <CardContent>
          <Card className="mb-6">
            <CardContent className="p-6">
              <Flex className="mb-4" gap={2}>
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-6 w-[100px]" />
              </Flex>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}