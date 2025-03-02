import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline';

interface Dock {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  schedules: DockSchedule[];
  maintenances: DockMaintenance[];
  orders: Order[];
}

interface DockSchedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface DockMaintenance {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
}

interface Order {
  id: string;
  orderNumber: string;
  scheduledDate: string;
  customer: {
    name: string;
  };
}

export default function DocksPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [docks, setDocks] = useState<Dock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showDockModal, setShowDockModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [currentDock, setCurrentDock] = useState<Dock | null>(null);

  // Form states
  const [dockForm, setDockForm] = useState({
    name: '',
    description: '',
  });

  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  useEffect(() => {
    if (!user || !token) return;
    
    fetchDocks();
  }, [user, token]);

  const fetchDocks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/docks/company/${user?.companyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch docks');
      }

      const data = await response.json();
      setDocks(data);
      setError(null);
    } catch (err) {
      setError('Error loading docks. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/docks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...dockForm,
          companyId: user?.companyId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create dock');
      }

      setShowDockModal(false);
      setDockForm({ name: '', description: '' });
      fetchDocks();
    } catch (err) {
      console.error(err);
      setError('Error creating dock. Please try again.');
    }
  };

  const handleUpdateDock = async (id: string, active: boolean) => {
    try {
      const dock = docks.find(d => d.id === id);
      if (!dock) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/docks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: dock.name,
          description: dock.description,
          active,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update dock');
      }

      fetchDocks();
    } catch (err) {
      console.error(err);
      setError('Error updating dock. Please try again.');
    }
  };

  const handleEditDock = (dock: Dock) => {
    setCurrentDock(dock);
    setDockForm({
      name: dock.name,
      description: dock.description || '',
    });
    setShowDockModal(true);
  };

  const handleDeleteDock = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this dock?')) return;
    
    try {
      await handleUpdateDock(id, false);
    } catch (err) {
      console.error(err);
      setError('Error deactivating dock. Please try again.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-6">Docas</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Docas</h1>
          <button
            onClick={() => {
              setCurrentDock(null);
              setDockForm({ name: '', description: '' });
              setShowDockModal(true);
            }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nova Doca
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {docks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">Nenhuma doca encontrada. Crie uma nova doca para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docks.map((dock) => (
              <div
                key={dock.id}
                className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-lg font-medium">{dock.name}</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditDock(dock)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDock(dock.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  {dock.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{dock.description}</p>
                  )}
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Horários
                    </h3>
                    {dock.schedules.length === 0 ? (
                      <p className="text-sm text-gray-500">Nenhum horário definido</p>
                    ) : (
                      <ul className="text-sm space-y-1">
                        {dock.schedules.map((schedule) => (
                          <li key={schedule.id}>
                            {dayNames[schedule.dayOfWeek]}: {schedule.startTime} - {schedule.endTime}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                      <WrenchIcon className="h-4 w-4 mr-1" />
                      Manutenções
                    </h3>
                    {dock.maintenances.length === 0 ? (
                      <p className="text-sm text-gray-500">Nenhuma manutenção agendada</p>
                    ) : (
                      <ul className="text-sm space-y-1">
                        {dock.maintenances.map((maintenance) => (
                          <li key={maintenance.id}>
                            {new Date(maintenance.startDate).toLocaleDateString()} - {new Date(maintenance.endDate).toLocaleDateString()}: {maintenance.reason}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Pedidos Agendados</h3>
                    {dock.orders.length === 0 ? (
                      <p className="text-sm text-gray-500">Nenhum pedido agendado</p>
                    ) : (
                      <ul className="text-sm space-y-1">
                        {dock.orders.map((order) => (
                          <li key={order.id}>
                            {order.orderNumber} - {order.customer.name} - {new Date(order.scheduledDate).toLocaleDateString()}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dock Modal */}
        {showDockModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {currentDock ? 'Editar Doca' : 'Nova Doca'}
              </h2>
              <form onSubmit={handleCreateDock}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Nome</label>
                  <input
                    type="text"
                    value={dockForm.name}
                    onChange={(e) => setDockForm({ ...dockForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
                  <textarea
                    value={dockForm.description}
                    onChange={(e) => setDockForm({ ...dockForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDockModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {currentDock ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}