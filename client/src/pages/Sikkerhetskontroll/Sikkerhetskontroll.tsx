import React from 'react';
// import { useAuth } from '../../contexts'; // Currently unused
import AdminOversikt from './Admin/AdminOversikt';

const Sikkerhetskontroll: React.FC = () => {
  // const { bruker } = useAuth(); // Currently unused

  // For nå lenker vi til AdminOversikt
  return <AdminOversikt />;
};

export default Sikkerhetskontroll; 