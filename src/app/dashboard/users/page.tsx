'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  whatsapp: string | null;
  whatsappVerified: boolean;
  verificationCode: string | null;
  verificationCodeExpiry: Date | null;
  emailToken: string | null;
  emailTokenExpiry: Date | null;
  emailVerified: Date | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
  stripeCustomerId: string | null;
  subscriptionStatus: string | null;
  subscriptionId: string | null;
  subscriptionEndDate: string | null;
  level: string | null;
  exchange: string | null;
  traditional_investment: string | null;
  crypto_investment: string | null;
  discovery: string | null;
  onboardingCompleted: boolean;
  provider: string | null;
  portfoliosCount: number;
  conversationsCount: number;
}

// Primeiro, vamos definir os tipos possíveis para subscriptionStatus
type SubscriptionStatus = 'free' | 'premium';

interface FormData {
  name: string;
  email: string;
  subscriptionStatus: SubscriptionStatus; // Removendo o opcional e null
  subscriptionEndDate: string;
  autoDowngradeToFree?: boolean;
}

function UserStatus({ status }: { status: string }) {
  const styles = {
    verified: 'bg-emerald-900/20 text-emerald-300 border border-emerald-900/50',
    pending: 'bg-amber-900/20 text-amber-300 border border-amber-900/50',
    inactive: 'bg-red-900/20 text-red-300 border border-red-900/50'
  };

  const labels = {
    verified: 'Verified',
    pending: 'Pending',
    inactive: 'Inactive'
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium inline-block ${styles[status as keyof typeof styles]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  );
}

function UserPlan({ plan }: { plan: string }) {
  const styles = {
    free: 'bg-zinc-900/50 text-zinc-300 border border-zinc-800',
    premium: 'bg-violet-900/20 text-violet-300 border border-violet-900/50'
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium inline-block ${styles[plan as keyof typeof styles]}`}>
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </span>
  );
}

function AddUserModal({ isOpen, onClose, onUserAdded }: {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subscriptionStatus: 'free',
    subscriptionEndDate: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dataToSend = {
      ...formData,
      status: 'pending',
      subscriptionEndDate: formData.subscriptionStatus === 'premium' && formData.subscriptionEndDate 
        ? new Date(formData.subscriptionEndDate).toISOString()
        : null
    };

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) throw new Error('Failed to create user');

      const data = await response.json();
      
      const confirmResponse = await fetch('/api/users/send-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: data.id,
          email: formData.email
        }),
      });

      if (!confirmResponse.ok) {
        throw new Error('Failed to send confirmation email');
      }

      alert('User created successfully. A confirmation email has been sent.');
      onUserAdded();
      onClose();
      setFormData({
        name: '',
        email: '',
        subscriptionStatus: 'free',
        subscriptionEndDate: ''
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter email"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subscription Status</label>
          <select
            value={formData.subscriptionStatus}
            onChange={(e) => setFormData(prev => ({ ...prev, subscriptionStatus: e.target.value as SubscriptionStatus }))}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            required
          >
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        {formData.subscriptionStatus === 'premium' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Subscription End Date</label>
              <Input
                type="datetime-local"
                value={formData.subscriptionEndDate}
                onChange={(e) => setFormData(prev => ({ ...prev, subscriptionEndDate: e.target.value }))}
                required={formData.subscriptionStatus === 'premium'}
              />
            </div>
          </>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function EditUserModal({ isOpen, onClose, onUserUpdated, user }: {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: User;
}) {
  const [formData, setFormData] = useState<FormData>({
    name: user.name || '',
    email: user.email || '',
    subscriptionStatus: (user.subscriptionStatus as SubscriptionStatus) || 'free',
    subscriptionEndDate: user.subscriptionEndDate || '',
    autoDowngradeToFree: false
  });

  useEffect(() => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      subscriptionStatus: (user.subscriptionStatus as SubscriptionStatus) || 'free',
      subscriptionEndDate: user.subscriptionEndDate || '',
      autoDowngradeToFree: false
    });
  }, [user]);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subscriptionStatus: formData.subscriptionStatus,
          subscriptionEndDate: formData.subscriptionStatus === 'premium' && formData.subscriptionEndDate 
            ? new Date(formData.subscriptionEndDate).toISOString()
            : null,
          autoDowngradeToFree: formData.autoDowngradeToFree
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      onUserUpdated();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      alert(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter email"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subscription Status</label>
          <select
            value={formData.subscriptionStatus}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              subscriptionStatus: e.target.value as SubscriptionStatus 
            }))}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            required
          >
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        {formData.subscriptionStatus === 'premium' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Subscription End Date</label>
              <Input
                type="datetime-local"
                value={formData.subscriptionEndDate}
                onChange={(e) => setFormData(prev => ({ ...prev, subscriptionEndDate: e.target.value }))}
                required={formData.subscriptionStatus === 'premium'}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoDowngrade"
                checked={formData.autoDowngradeToFree}
                onChange={(e) => setFormData(prev => ({ ...prev, autoDowngradeToFree: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="autoDowngrade" className="text-sm text-gray-600 dark:text-gray-300">
                Automatically downgrade to free plan after subscription ends
              </label>
            </div>
          </>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div className="text-zinc-400">Loading users...</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;

  return (
    <>
      <Card className="border-0 bg-zinc-950 shadow-lg">
        <div className="relative w-full overflow-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-zinc-900 hover:bg-transparent">
                <TableHead className="w-[200px] font-medium text-zinc-400 h-10">Name</TableHead>
                <TableHead className="w-[200px] font-medium text-zinc-400">Email</TableHead>
                <TableHead className="w-[150px] font-medium text-zinc-400">Whatsapp</TableHead>
                <TableHead className="w-[100px] font-medium text-zinc-400">Whatsapp Verified</TableHead>
                <TableHead className="w-[150px] font-medium text-zinc-400">Email Verified</TableHead>
                <TableHead className="w-[100px] font-medium text-zinc-400">Plan</TableHead>
                <TableHead className="w-[180px] font-medium text-zinc-400">Subscription End</TableHead>
                <TableHead className="w-[100px] font-medium text-zinc-400">Level</TableHead>
                <TableHead className="w-[100px] font-medium text-zinc-400">Exchange</TableHead>
                <TableHead className="w-[150px] font-medium text-zinc-400">Traditional Investment</TableHead>
                <TableHead className="w-[150px] font-medium text-zinc-400">Crypto Investment</TableHead>
                <TableHead className="w-[100px] font-medium text-zinc-400">Discovery</TableHead>
                <TableHead className="w-[150px] font-medium text-zinc-400">Onboarding</TableHead>
                <TableHead className="w-[100px] font-medium text-zinc-400">Provider</TableHead>
                <TableHead className="w-[100px] font-medium text-zinc-400 text-center">Portfolios</TableHead>
                <TableHead className="w-[100px] font-medium text-zinc-400 text-center">Conversations</TableHead>
                <TableHead className="w-[150px] font-medium text-zinc-400">Created At</TableHead>
                <TableHead className="w-[250px] font-medium text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow 
                  key={user.id}
                  className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors duration-200"
                >
                  <TableCell className="font-medium text-zinc-200">{user.name}</TableCell>
                  <TableCell className="text-zinc-400">{user.email}</TableCell>
                  <TableCell className="text-zinc-400">{user.whatsapp}</TableCell>
                  <TableCell>
                    <span className={`inline-block w-2 h-2 rounded-full ${user.whatsappVerified ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {user.emailVerified ? new Date(user.emailVerified).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell><UserPlan plan={user.subscriptionStatus || 'free'} /></TableCell>
                  <TableCell className="text-zinc-400">
                    {user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell className="text-zinc-400">{user.level}</TableCell>
                  <TableCell className="text-zinc-400">{user.exchange}</TableCell>
                  <TableCell className="text-zinc-400">{user.traditional_investment}</TableCell>
                  <TableCell className="text-zinc-400">{user.crypto_investment}</TableCell>
                  <TableCell className="text-zinc-400">{user.discovery}</TableCell>
                  <TableCell>
                    <span className={`inline-block w-2 h-2 rounded-full ${user.onboardingCompleted ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  </TableCell>
                  <TableCell className="text-zinc-400">{user.provider}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-sm bg-zinc-900 text-zinc-300 font-medium border border-zinc-800">
                      {user.portfoliosCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-sm bg-zinc-900 text-zinc-300 font-medium border border-zinc-800">
                      {user.conversationsCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                        onClick={() => setEditingUser(user)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="bg-red-900/20 hover:bg-red-900/30 text-red-300 border border-red-900/50"
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this user?')) {
                            try {
                              const response = await fetch(`/api/users/${user.id}`, {
                                method: 'DELETE'
                              });
                              if (!response.ok) throw new Error('Failed to delete user');
                              setUsers(users.filter(u => u.id !== user.id));
                            } catch (err) {
                              alert('Failed to delete user');
                            }
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {editingUser && (
        <EditUserModal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={() => {
            setEditingUser(null);
            fetchUsers();
          }}
          user={editingUser}
        />
      )}
    </>
  );
}

function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const response = await fetch('/api/users/sync-to-make', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Sync failed');
      
      alert(`
        Sync successful!
        Users synced: ${data.message}
        Sample data: ${JSON.stringify(data.sampleData, null, 2)}
      `);
      
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync users to Make: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button 
      onClick={handleSync}
      disabled={isSyncing}
      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
    >
      {isSyncing ? 'Syncing...' : 'Sync to Make'}
    </Button>
  );
}

export default function UsersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [shouldRefetch, setShouldRefetch] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-zinc-100">Users</h2>
        <div className="flex gap-2">
          <Input 
            placeholder="Search users..." 
            className="w-64 bg-zinc-900 border-zinc-800 text-zinc-300 placeholder:text-zinc-500"
          />
          <SyncButton />
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
          >
            Add User
          </Button>
        </div>
      </div>

      <UsersTable key={String(shouldRefetch)} />

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={() => setShouldRefetch(prev => !prev)}
      />
    </div>
  );
} 