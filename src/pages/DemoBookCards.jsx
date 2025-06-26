import React from 'react';
import { DemoBookCard } from '../components/ui/demo-book-card';
import { Aurora } from '../components/ui/aurora';
import Sidebar from '../components/Sidebar';

const DemoBookCards = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Aurora />
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <DemoBookCard />
      </div>
    </div>
  );
};

export default DemoBookCards;
