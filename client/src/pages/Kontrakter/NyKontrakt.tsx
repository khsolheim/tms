import React from 'react';
import { PageSkeleton } from '../../components/ui/LoadingStates';

const NyKontrakt: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-2 py-1">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#003366] mb-8">Opprett ny kontrakt</h1>
        <PageSkeleton title={false} description={true} />
      </div>
    </div>
  );
};

export default NyKontrakt; 