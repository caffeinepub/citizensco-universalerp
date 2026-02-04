import { useGetPipelineDashboard, useGetAllLeads } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { LeadStage } from '../../types/erp-types';

export default function PipelineOverview() {
  const { data: pipelineData, isLoading } = useGetPipelineDashboard();
  const { data: allLeads } = useGetAllLeads();

  const getStageColor = (stage: LeadStage) => {
    switch (stage) {
      case LeadStage.New: return 'bg-blue-500';
      case LeadStage.Contacted: return 'bg-yellow-500';
      case LeadStage.Qualified: return 'bg-purple-500';
      case LeadStage.Closed: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const stages: LeadStage[] = [LeadStage.New, LeadStage.Contacted, LeadStage.Qualified, LeadStage.Closed];
  const stageData = stages.map(stage => {
    const count = pipelineData?.stageCount.find(([s]) => s === stage)?.[1] || BigInt(0);
    const leads = allLeads?.filter(lead => lead.stage === stage) || [];
    return { stage, count: Number(count), leads };
  });

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <img src="/assets/generated/sales-pipeline.dim_600x400.png" alt="Sales Pipeline" className="w-full h-auto rounded-lg mb-4" />
            <div className="space-y-4">
              {stageData.map(({ stage, count }) => (
                <div key={stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stage}</span>
                    <Badge variant="outline">{count} leads</Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStageColor(stage)} transition-all`}
                      style={{ width: `${pipelineData && Number(pipelineData.totalLeads) > 0 ? (count / Number(pipelineData.totalLeads)) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Contacts</p>
                <p className="text-3xl font-bold">{Number(pipelineData?.totalContacts || 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-3xl font-bold">{Number(pipelineData?.totalLeads || 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Opportunities</p>
                <p className="text-3xl font-bold">{Number(pipelineData?.totalOpportunities || 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Expected Revenue</p>
                <p className="text-3xl font-bold text-primary">
                  ${((Number(pipelineData?.totalExpectedRevenue || 0)) / 100).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Conversion Rates</h4>
              <div className="space-y-2">
                {stageData.map(({ stage, count }, index) => {
                  if (index === 0) return null;
                  const prevCount = stageData[index - 1].count;
                  const rate = prevCount > 0 ? ((count / prevCount) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={stage} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {stageData[index - 1].stage} → {stage}
                      </span>
                      <span className="font-medium">{rate}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Stages Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {stageData.map(({ stage, count, leads }) => (
              <Card key={stage} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{stage}</CardTitle>
                    <Badge className={`${getStageColor(stage)} text-white`}>{count}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {leads.length > 0 ? (
                    <div className="space-y-2">
                      {leads.slice(0, 3).map(lead => (
                        <div key={lead.id} className="text-sm p-2 bg-muted rounded">
                          <p className="font-medium truncate">Lead #{lead.id.slice(-8)}</p>
                          {lead.expectedRevenue && (
                            <p className="text-xs text-muted-foreground">
                              ${(Number(lead.expectedRevenue) / 100).toFixed(2)}
                            </p>
                          )}
                        </div>
                      ))}
                      {leads.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{leads.length - 3} more
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No leads</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
