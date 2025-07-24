import React, { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Mail, Send, Edit, Trash2, Calendar, BarChart3 } from 'lucide-react';
import { useEmailCampaigns } from '@/hooks/useEmailCampaigns';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { EmailBuilderDialog } from '@/components/email/EmailBuilderDialog';
import { CreateCampaignDialog } from '@/components/email/CreateCampaignDialog';
import { format } from 'date-fns';

const EmailMarketing = () => {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  
  const { campaigns, isLoading: campaignsLoading, deleteCampaign } = useEmailCampaigns();
  const { templates, isLoading: templatesLoading } = useEmailTemplates();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditCampaign = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    setIsBuilderOpen(true);
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Marketing</h1>
          <p className="text-muted-foreground mt-2">Create and manage your email campaigns</p>
        </div>
        {/* Quick Actions */}
        <div className="flex gap-4">
          <Button onClick={() => setIsCampaignDialogOpen(true)} className="gap-2">
            <Plus size={16} />
            New Campaign
          </Button>
          <Button variant="outline" onClick={() => setIsBuilderOpen(true)} className="gap-2">
            <Edit size={16} />
            Email Builder
          </Button>
        </div>

        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-4">
            <div className="grid gap-4">
              {campaignsLoading ? (
                <div className="text-center py-8">Loading campaigns...</div>
              ) : campaigns.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Mail size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first email campaign to start engaging with your customers.
                    </p>
                    <Button onClick={() => setIsCampaignDialogOpen(true)}>
                      Create Campaign
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                campaigns.map((campaign) => (
                  <Card key={campaign.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          <CardDescription>{campaign.subject}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCampaign(campaign.id)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCampaign(campaign.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Recipients</p>
                          <p className="font-semibold">{campaign.recipient_count}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Delivered</p>
                          <p className="font-semibold">{campaign.delivered_count}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Opened</p>
                          <p className="font-semibold">{campaign.opened_count}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Created</p>
                          <p className="font-semibold">
                            {format(new Date(campaign.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      {campaign.status === 'draft' && (
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" className="gap-2">
                            <Send size={14} />
                            Send Campaign
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Calendar size={14} />
                            Schedule
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templatesLoading ? (
                <div className="col-span-full text-center py-8">Loading templates...</div>
              ) : templates.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-8 text-center">
                    <Edit size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create email templates to speed up your campaign creation.
                    </p>
                    <Button onClick={() => setIsBuilderOpen(true)}>
                      Create Template
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      {template.description && (
                        <CardDescription>{template.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 h-32 rounded mb-3 flex items-center justify-center">
                        <Mail size={24} className="text-muted-foreground" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(template.created_at), 'MMM d, yyyy')}
                        </span>
                        <Button size="sm" variant="outline">
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={20} />
                  Email Marketing Analytics
                </CardTitle>
                <CardDescription>
                  Track your email campaign performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Analytics dashboard coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <EmailBuilderDialog 
        open={isBuilderOpen}
        onOpenChange={setIsBuilderOpen}
        campaignId={selectedCampaign}
      />

      <CreateCampaignDialog
        open={isCampaignDialogOpen}
        onOpenChange={setIsCampaignDialogOpen}
      />
    </PageLayout>
  );
};

export default EmailMarketing;