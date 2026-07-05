'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpTooltip } from '@/components/help/HelpTooltip';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/lib/database.types';
import { format } from 'date-fns';
import { FileText, Send, CheckCircle, XCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import {
  WORKFLOW_STAGES,
  REVIEW_STATUS,
  ACTION_TYPES,
} from '@/lib/workflow-constants';

type Document = Database['public']['Tables']['corporate_matter_documents']['Row'];
type Review = Database['public']['Tables']['corporate_matter_reviews']['Row'];
type Matter = Database['public']['Tables']['corporate_matters']['Row'];

interface ReviewWorkflowTabProps {
  matterId: string;
  matter: Matter;
  onMatterUpdate: () => void;
}

export function ReviewWorkflowTab({ matterId, matter, onMatterUpdate }: ReviewWorkflowTabProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [reviewDecision, setReviewDecision] = useState<string>('');

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [matterId]);

  const fetchData = async () => {
    try {
      // Fetch draft documents
      const { data: docsData, error: docsError } = await supabase
        .from('corporate_matter_documents')
        .select('*')
        .eq('matter_id', matterId)
        .eq('is_draft', true)
        .order('uploaded_at', { ascending: false });

      if (docsError) throw docsError;
      setDocuments(docsData || []);

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('corporate_matter_reviews')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error fetching review data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async (documentId: string) => {
    setSubmitting(true);
    try {
      // Update document review status
      await supabase
        .from('corporate_matter_documents')
        .update({ review_status: REVIEW_STATUS.PENDING } as any)
        .eq('id', documentId);

      // Update matter workflow stage
      await supabase
        .from('corporate_matters')
        .update({
          workflow_stage: WORKFLOW_STAGES.PENDING_REVIEW,
          review_status: REVIEW_STATUS.PENDING,
        } as any)
        .eq('id', matterId);

      // Create review record
      await supabase.from('corporate_matter_reviews').insert({
        matter_id: matterId,
        document_id: documentId,
        review_type: 'draft',
        review_status: REVIEW_STATUS.PENDING,
      } as any);

      // Create activity log
      await supabase.from('corporate_matter_activity_logs').insert({
        matter_id: matterId,
        user_id: user?.id,
        action_type: ACTION_TYPES.REVIEW_SUBMITTED,
        action_description: 'Draft submitted for review',
        new_value: WORKFLOW_STAGES.PENDING_REVIEW,
      } as any);

      // Create notification for manager/director
      // TODO: Implement manager/director role detection

      fetchData();
      onMatterUpdate();
      alert('Draft submitted for review!');
    } catch (error) {
      console.error('Error submitting for review:', error);
      alert('Failed to submit for review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedDocument || !reviewDecision) return;

    setSubmitting(true);
    try {
      const reviewId = reviews.find(r => r.document_id === selectedDocument.id)?.id;

      if (reviewId) {
        // Update existing review
        await supabase
          .from('corporate_matter_reviews')
          .update({
            reviewer: user?.id,
            review_status: reviewDecision,
            review_comments: reviewComments,
            reviewed_at: new Date().toISOString(),
          } as any)
          .eq('id', reviewId);
      }

      // Update document
      await supabase
        .from('corporate_matter_documents')
        .update({ review_status: reviewDecision } as any)
        .eq('id', selectedDocument.id);

      // Update matter based on decision
      let newWorkflowStage = matter.workflow_stage;
      let revisionCount = matter.returned_for_revision_count || 0;

      if (reviewDecision === REVIEW_STATUS.APPROVED) {
        newWorkflowStage = WORKFLOW_STAGES.APPROVED_FOR_FINALIZATION;
      } else if (reviewDecision === REVIEW_STATUS.RETURNED) {
        newWorkflowStage = WORKFLOW_STAGES.RETURNED_FOR_REVISION;
        revisionCount += 1;
      } else if (reviewDecision === REVIEW_STATUS.ESCALATED) {
        newWorkflowStage = WORKFLOW_STAGES.PENDING_REVIEW;
      }

      await supabase
        .from('corporate_matters')
        .update({
          workflow_stage: newWorkflowStage,
          review_status: reviewDecision,
          returned_for_revision_count: revisionCount,
        } as any)
        .eq('id', matterId);

      // Create activity log
      const actionType =
        reviewDecision === REVIEW_STATUS.APPROVED
          ? ACTION_TYPES.REVIEW_APPROVED
          : reviewDecision === REVIEW_STATUS.RETURNED
          ? ACTION_TYPES.REVIEW_RETURNED
          : 'review_escalated';

      await supabase.from('corporate_matter_activity_logs').insert({
        matter_id: matterId,
        user_id: user?.id,
        action_type: actionType,
        action_description: reviewComments || `Review ${reviewDecision}`,
        old_value: matter.workflow_stage,
        new_value: newWorkflowStage,
      } as any);

      // Create notification for action officer
      if (matter.assigned_officer) {
        let notifTitle = 'Draft Approved';
        let notifMessage = 'Your draft has been approved!';

        if (reviewDecision === REVIEW_STATUS.RETURNED) {
          notifTitle = 'Draft Returned for Revision';
          notifMessage = 'Please review the comments and revise your draft.';
        }

        await supabase.from('corporate_matter_notifications').insert({
          matter_id: matterId,
          user_id: matter.assigned_officer,
          notification_type: reviewDecision === REVIEW_STATUS.APPROVED ? 'draft_approved' : 'draft_returned',
          title: notifTitle,
          message: notifMessage,
          priority: matter.priority?.toLowerCase() || 'normal',
          action_url: `/matters/${matterId}`,
        } as any);
      }

      setReviewDialogOpen(false);
      setReviewComments('');
      setReviewDecision('');
      setSelectedDocument(null);
      fetchData();
      onMatterUpdate();
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case REVIEW_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case REVIEW_STATUS.APPROVED:
        return 'bg-green-100 text-green-800 border-green-300';
      case REVIEW_STATUS.RETURNED:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case REVIEW_STATUS.ESCALATED:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-slate-600">Loading reviews...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Draft Review Workflow</CardTitle>
        <CardDescription>
          Submit drafts for review or review submitted drafts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No draft documents yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Upload draft documents in the Documents tab and mark them as drafts
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => {
              const docReviews = reviews.filter((r) => r.document_id === doc.id);
              const latestReview = docReviews[0];

              return (
                <div
                  key={doc.id}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <FileText className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{doc.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {doc.review_status && (
                            <Badge
                              variant="outline"
                              className={getReviewStatusColor(doc.review_status)}
                            >
                              {doc.review_status}
                            </Badge>
                          )}
                          <span className="text-xs text-slate-500">
                            Version {doc.version} • {format(new Date(doc.uploaded_at), 'MMM dd, yyyy')}
                          </span>
                        </div>

                        {latestReview?.review_comments && (
                          <div className="mt-2 p-2 bg-slate-50 rounded text-sm text-slate-700">
                            <div className="flex items-center gap-1 mb-1">
                              <MessageSquare className="h-3 w-3" />
                              <span className="font-medium">Review Comments:</span>
                            </div>
                            <p>{latestReview.review_comments}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!doc.review_status && (
                        <>
                          <HelpTooltip id="submit-review" />
                          <Button
                            size="sm"
                            onClick={() => handleSubmitForReview(doc.id)}
                            disabled={submitting}
                            data-tour="review-submit"
                            className="flex items-center gap-2"
                          >
                            <Send className="h-3 w-3" />
                            Submit for Review
                          </Button>
                        </>
                      )}

                      {doc.review_status === REVIEW_STATUS.PENDING && (
                        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedDocument(doc)}
                            >
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Review Draft Document</DialogTitle>
                              <DialogDescription>{doc.title}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Review Decision</Label>
                                <Select value={reviewDecision} onValueChange={setReviewDecision}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select decision" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={REVIEW_STATUS.APPROVED}>
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        Approve
                                      </div>
                                    </SelectItem>
                                    <SelectItem value={REVIEW_STATUS.RETURNED}>
                                      <div className="flex items-center gap-2">
                                        <XCircle className="h-4 w-4 text-orange-600" />
                                        Return for Revision
                                      </div>
                                    </SelectItem>
                                    <SelectItem value={REVIEW_STATUS.ESCALATED}>
                                      <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                        Escalate to Director
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Review Comments</Label>
                                <Textarea
                                  value={reviewComments}
                                  onChange={(e) => setReviewComments(e.target.value)}
                                  placeholder="Provide feedback, suggestions, or reasons for your decision..."
                                  rows={5}
                                />
                              </div>

                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setReviewDialogOpen(false);
                                    setReviewComments('');
                                    setReviewDecision('');
                                    setSelectedDocument(null);
                                  }}
                                  disabled={submitting}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleReviewSubmit}
                                  disabled={submitting || !reviewDecision}
                                >
                                  {submitting ? 'Submitting...' : 'Submit Review'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>

                  {docReviews.length > 1 && (
                    <div className="mt-3 pt-3 border-t border-slate-200" data-tour="review-history">
                      <p className="text-xs font-medium text-slate-600 mb-2">
                        Review History ({docReviews.length} reviews)
                      </p>
                      <div className="space-y-1">
                        {docReviews.slice(0, 3).map((review) => (
                          <div key={review.id} className="text-xs text-slate-500 flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${getReviewStatusColor(review.review_status || '')}`}>
                              {review.review_status}
                            </Badge>
                            <span>{format(new Date(review.created_at), 'MMM dd, yyyy')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
