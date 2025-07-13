import React, { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  assigned_to: {
    name: string;
  };
  project: {
    name: string;
  };
  estimated_hours: number;
  actual_hours: number;
}

export const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // Simulerer API-kall med mock-data
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'Sikkerhetskontroll Bedrift AS',
          description: 'Gjennomføre årlig sikkerhetskontroll hos Bedrift AS',
          status: 'in_progress',
          priority: 'high',
          due_date: new Date(Date.now() + 86400000).toISOString(),
          assigned_to: { name: 'Ola Nordmann' },
          project: { name: 'Sikkerhetskontroller 2024' },
          estimated_hours: 8,
          actual_hours: 4
        },
        {
          id: 2,
          title: 'Oppdatering av sikkerhetsrutiner',
          description: 'Oppdatere sikkerhetsrutiner i henhold til nye forskrifter',
          status: 'todo',
          priority: 'medium',
          due_date: new Date(Date.now() + 172800000).toISOString(),
          assigned_to: { name: 'Kari Hansen' },
          project: { name: 'Rutineoppdateringer' },
          estimated_hours: 6,
          actual_hours: 0
        },
        {
          id: 3,
          title: 'Kundemøte - Bedrift XYZ',
          description: 'Oppfølgingsmøte med Bedrift XYZ om sikkerhetskontroll',
          status: 'done',
          priority: 'low',
          due_date: new Date(Date.now() - 86400000).toISOString(),
          assigned_to: { name: 'Per Olsen' },
          project: { name: 'Kundeforhold' },
          estimated_hours: 2,
          actual_hours: 2
        }
      ];
      
      setTasks(mockTasks);
    } catch (error) {
      console.error('Feil ved henting av oppgaver:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laster oppgaver...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Oppgaver</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Ny oppgave
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Prosjekt:</span>
                  <span>{task.project.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tildelt:</span>
                  <span>{task.assigned_to.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Frist:</span>
                  <span>{formatDate(task.due_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Timer:</span>
                  <span>{task.actual_hours || 0} / {task.estimated_hours || 0}</span>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                  Rediger
                </button>
                <button className="px-3 py-1 text-sm bg-blue-200 text-blue-700 rounded hover:bg-blue-300">
                  Tidsregistrering
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Ingen oppgaver funnet</p>
          <p className="text-gray-400 text-sm">Opprett din første oppgave</p>
        </div>
      )}
    </div>
  );
};