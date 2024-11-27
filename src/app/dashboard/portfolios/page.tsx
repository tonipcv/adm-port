'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default function PortfoliosPage() {
  const [portfolios] = useState([
    { 
      id: 1, 
      name: 'Main Portfolio', 
      totalValue: 15000, 
      totalProfit: 2500, 
      cryptoCount: 5,
      owner: 'John Doe'
    },
    // Add more mock data
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Portfolios</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Create Portfolio
        </button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Profit/Loss</TableHead>
              <TableHead>Cryptos</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {portfolios.map((portfolio) => (
              <TableRow key={portfolio.id}>
                <TableCell>{portfolio.name}</TableCell>
                <TableCell>${portfolio.totalValue.toLocaleString()}</TableCell>
                <TableCell className={portfolio.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ${portfolio.totalProfit.toLocaleString()}
                </TableCell>
                <TableCell>{portfolio.cryptoCount}</TableCell>
                <TableCell>{portfolio.owner}</TableCell>
                <TableCell>
                  <button className="text-blue-600 hover:text-blue-800 mr-2">View</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 