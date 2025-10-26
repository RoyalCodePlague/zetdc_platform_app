import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Allocation = {
  id?: number;
  token?: string;
  status?: string;
  amount?: number | string;
  message?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allocations: Allocation[];
};

const AllocationsModal: React.FC<Props> = ({ open, onOpenChange, allocations }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Auto Recharge Progress</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground">The system is attempting to allocate tokens and apply them to your meters. This modal will update as allocations complete.</p>

          <div className="space-y-2">
            {allocations.length === 0 && <div className="text-sm">No allocations yet.</div>}
            {allocations.map((a) => (
              <div key={a.id || a.token} className="p-2 border rounded">
                <div className="flex justify-between items-center">
                  <div className="font-medium">{a.token || 'Pending token'}</div>
                  <div className="text-xs">{a.status || 'pending'}</div>
                </div>
                <div className="text-xs text-muted-foreground">{a.message}</div>
                <div className="text-xs">Amount: {a.amount}</div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AllocationsModal;
