import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flex } from "@/components/ui/flex";
import { Text } from "@/components/ui/text";
import { AuditReport, AuditFinding } from "@/lib/types/audit";
import { ClipboardCheck, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface AuditMetricsProps {
  reports: AuditReport[];
}

export function AuditMetrics({ reports }: AuditMetricsProps) {
  const getAllFindings = () => reports.flatMap(report => report.findings);
  const findings = getAllFindings();

  const metrics = {
    total: findings.length,
    critical: findings.filter(f => f.severity === 'critical').length,
    completed: findings.filter(f => f.status === 'completed').length,
    inProgress: findings.filter(f => f.status === 'in_progress').length,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <Flex justify="between" align="center">
            <div>
              <Text variant="muted">Total Findings</Text>
              <Text variant="h2">{metrics.total}</Text>
            </div>
            <ClipboardCheck className="h-8 w-8 text-blue-500" />
          </Flex>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Flex justify="between" align="center">
            <div>
              <Text variant="muted">Critical Issues</Text>
              <Text variant="h2">{metrics.critical}</Text>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </Flex>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Flex justify="between" align="center">
            <div>
              <Text variant="muted">Completed</Text>
              <Text variant="h2">{metrics.completed}</Text>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </Flex>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Flex justify="between" align="center">
            <div>
              <Text variant="muted">In Progress</Text>
              <Text variant="h2">{metrics.inProgress}</Text>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </Flex>
        </CardContent>
      </Card>
    </div>
  );
}