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

export default function CryptosPage() {
  const [cryptos] = useState([
    { 
      id: 1, 
      name: 'Bitcoin', 
      symbol: 'BTC',
      currentPrice: 45000,
      priceChange24h: 2.5,
      marketCap: 800000000000,
      portfolioCount: 150
    },
    // Add more mock data
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cryptocurrencies</h2>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Search crypto..." 
            className="px-4 py-2 border rounded-md"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add Crypto
          </button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>24h Change</TableHead>
              <TableHead>Market Cap</TableHead>
              <TableHead>In Portfolios</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cryptos.map((crypto) => (
              <TableRow key={crypto.id}>
                <TableCell>{crypto.name}</TableCell>
                <TableCell>{crypto.symbol}</TableCell>
                <TableCell>${crypto.currentPrice.toLocaleString()}</TableCell>
                <TableCell className={crypto.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {crypto.priceChange24h}%
                </TableCell>
                <TableCell>${(crypto.marketCap / 1e9).toFixed(2)}B</TableCell>
                <TableCell>{crypto.portfolioCount}</TableCell>
                <TableCell>
                  <button className="text-blue-600 hover:text-blue-800 mr-2">Details</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 