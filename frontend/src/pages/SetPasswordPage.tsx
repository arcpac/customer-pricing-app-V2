import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { acceptInvite, confirmPasswordReset } from '@/api/users';

interface Props {
  token: string;
  type: 'invite' | 'reset';
  onDone: () => void;
}

export function SetPasswordPage({ token, type, onDone }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      if (type === 'invite') {
        await acceptInvite(token, password);
      } else {
        await confirmPasswordReset(token, password);
      }
      toast.success('Password set — you can now sign in');
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to set password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="grid h-screen grid-cols-12"
      style={{ background: 'linear-gradient(135deg, #DCEAFF 0%, #147D73 100%)' }}
    >
      <div className="col-span-4 flex flex-col justify-center px-10 bg-white/10 backdrop-blur-md border-r border-white/20">
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <h1 className="text-xl font-semibold">
            {type === 'invite' ? 'Set your password' : 'Reset your password'}
          </h1>
          <div className="space-y-1">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              className="bg-white"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              className="bg-white"
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving…' : 'Set password'}
          </Button>
        </form>
      </div>
      <div className="col-span-8" />
    </div>
  );
}
