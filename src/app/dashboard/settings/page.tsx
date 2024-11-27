'use client';

import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <div className="grid gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Site Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border rounded-md"
                defaultValue="Crypto Portfolio Dashboard"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Email</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 border rounded-md"
                defaultValue="admin@example.com"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">API Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">API Key</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 border rounded-md"
                defaultValue="************************"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Webhook URL</label>
              <input 
                type="url" 
                className="w-full px-3 py-2 border rounded-md"
                defaultValue="https://api.example.com/webhook"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
} 