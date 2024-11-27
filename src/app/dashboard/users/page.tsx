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
  name: string;
  email: string;
  status: string;
  plan: string;
  portfoliosCount: number;
  subscriptionEndDate?: string | null;
}

function UserStatus({ status }: { status: string }) {
  const styles = {
    verified: 'bg-emerald-950/20 text-emerald-200',
    pending: 'bg-amber-950/20 text-amber-200',
    inactive: 'bg-red-950/20 text-red-200'
  };

  const labels = {
    verified: 'Verified',
    pending: 'Pending Email Confirmation',
    inactive: 'Inactive'
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-medium inline-block ${styles[status as keyof typeof styles]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  );
}

function UserPlan({ plan }: { plan: string }) {
  const styles = {
    free: 'bg-gray-900 text-gray-300',
    premium: 'bg-violet-950/20 text-violet-200'
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-medium inline-block ${styles[plan as keyof typeof styles]}`}>
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </span>
  );
}

function AddUserModal({ isOpen, onClose, onUserAdded }: {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    subscriptionStatus: 'free',
    subscriptionEndDate: '',
    autoDowngradeToFree: false
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
        password: '',
        subscriptionStatus: 'free',
        subscriptionEndDate: '',
        autoDowngradeToFree: false
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
            value={formData.name}
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
          <label className="block text-sm font-medium mb-1">Password</label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Enter password"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subscription Status</label>
          <select
            value={formData.subscriptionStatus}
            onChange={(e) => setFormData(prev => ({ ...prev, subscriptionStatus: e.target.value }))}
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
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    subscriptionStatus: user.plan,
    subscriptionEndDate: user.subscriptionEndDate || '',
    autoDowngradeToFree: false
  });

  useEffect(() => {
    setFormData({
      name: user.name,
      email: user.email,
      subscriptionStatus: user.plan,
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
            value={formData.name}
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
            onChange={(e) => setFormData(prev => ({ ...prev, subscriptionStatus: e.target.value }))}
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

  const handleResendConfirmation = async (userId: string, email: string) => {
    try {
      const response = await fetch('/api/users/send-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resend confirmation email');
      }

      alert('Confirmation email has been resent successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend confirmation email';
      alert(errorMessage);
      console.error('Resend error:', error);
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <Card className="border-0 bg-gray-950 shadow-2xl">
        <div className="relative w-full overflow-auto p-2">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-900">
                <TableHead className="w-[200px] font-medium text-gray-400 h-12">Name</TableHead>
                <TableHead className="w-[200px] font-medium text-gray-400">Email</TableHead>
                <TableHead className="w-[150px] font-medium text-gray-400">Status</TableHead>
                <TableHead className="w-[100px] font-medium text-gray-400">Plan</TableHead>
                <TableHead className="w-[180px] font-medium text-gray-400">Subscription End</TableHead>
                <TableHead className="w-[100px] font-medium text-gray-400 text-center">Portfolios</TableHead>
                <TableHead className="w-[250px] font-medium text-gray-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow 
                  key={user.id}
                  className="border-b border-gray-900 hover:bg-gray-900/50 transition-colors duration-200"
                >
                  <TableCell className="font-medium text-gray-200">{user.name}</TableCell>
                  <TableCell className="text-gray-400">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <UserStatus status={user.status} />
                  </TableCell>
                  <TableCell>
                    <UserPlan plan={user.plan} />
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {user.subscriptionEndDate ? (
                      new Date(user.subscriptionEndDate).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-sm bg-gray-900 text-gray-300 font-medium">
                      {user.portfoliosCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="bg-gray-900 hover:bg-gray-800 text-gray-300"
                        onClick={() => setEditingUser(user)}
                      >
                        Edit
                      </Button>
                      {user.status === 'pending' && (
                        <Button
                          variant="secondary" 
                          size="sm"
                          className="border border-amber-950 bg-amber-950/20 hover:bg-amber-950/40 text-amber-200"
                          onClick={() => handleResendConfirmation(user.id, user.email || '')}
                        >
                          Resend Confirmation
                        </Button>
                      )}
                      <Button 
                        variant="danger" 
                        size="sm"
                        className="bg-red-950/20 hover:bg-red-950/40 text-red-200"
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

export default function UsersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [shouldRefetch, setShouldRefetch] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Users</h2>
        <div className="flex gap-2">
          <Input 
            placeholder="Search users..." 
            className="w-64"
          />
          <Button onClick={() => setIsAddModalOpen(true)}>
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