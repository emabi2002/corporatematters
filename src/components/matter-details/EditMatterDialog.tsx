'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import type { Database } from '@/lib/database.types';
import { MATTER_STATUS } from '@/lib/constants';
import { Edit } from 'lucide-react';

type Matter = Database['public']['Tables']['corporate_matters']['Row'];

interface EditMatterDialogProps {
  matter: Matter;
  onUpdate: () => void;
}

export function EditMatterDialog({ matter, onUpdate }: EditMatterDialogProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(matter.status);
  const [updating, setUpdating] = useState(false);

  const supabase = createClient();

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('corporate_matters')
        // @ts-ignore - Supabase type inference issue
        .update({ status })
        .eq('id', matter.id);

      if (error) throw error;

      setOpen(false);
      onUpdate();
    } catch (error: any) {
      console.error('Error updating matter:', error);
      alert(error.message || 'Failed to update matter');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Matter Status</DialogTitle>
          <DialogDescription>
            Change the status of this matter
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus} disabled={updating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATTER_STATUS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updating || status === matter.status}>
              {updating ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
