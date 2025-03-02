import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface Customer {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  isFidelized: boolean;
  quotaMinutes: number;
  autoReserve: boolean;
  preferredDays: number[];
  preferredTime: string | null;
  active: boolean;
}

export default function CustomersPage() {
  const { user, token } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);

  // Form states
  const [customerForm, setCustomerForm] = useState({
    name: '',
    cnpj: '',
    address: '',
    phone: '',
    email: '',
    isFidelized: false,
    quotaMinutes: '0',
    autoReserve: false,
    preferredDays: [] as number[],
    preferredTime: '',
  });

  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  useEffect(() => {
    if (!user || !token) return;
    
    fetchCustomers();
  }, [user, token]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/company/${user?.companyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError('Error loading customers. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...customerForm,
          companyId: user?.companyId,
          quotaMinutes: parseInt(customerForm.quotaMinutes),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      setShowCustomerModal(false);
      resetCustomerForm();
      fetchCustomers();
    } catch (err) {
      console.error(err);
      setError('Error creating customer. Please try again.');
    }
  };

  const handleUpdateCustomer = async (id: string, active: boolean) => {
    try {
      const customer = customers.find(c => c.id === id);
      if (!customer) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...customer,
          active,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update customer');
      }

      fetchCustomers();
    } catch (err) {
      console.error(err);
      setError('Error updating customer. Please try again.');
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setCurrentCustomer(customer);
    setCustomerForm({
      name: customer.name,
      cnpj: customer.cnpj,
      address: customer.address,
      phone: customer.phone,
      email: customer.email,
      isFidelized: customer.isFidelized,
      quotaMinutes: customer.quotaMinutes.toString(),
      autoReserve: customer.autoReserve,
      preferredDays: customer.preferredDays,
      preferredTime: customer.preferredTime || '',
    });
    setShowCustomerModal(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this customer?')) return;
    
    try {
      await handleUpdateCustomer(id, false);
    } catch (err) {
      console.error(err);
      setError('Error deactivating customer. Please try again.');
    }
  };

  const resetCustomerForm = () => {
    setCustomerForm({
      name: '',
      cnpj: '',
      address: '',
      phone: '',
      email: '',
      isFidelized: false,
      quotaMinutes: '0',
      autoReserve: false,
      preferredDays: [],
      preferredTime: '',
    });
  };

  const togglePreferredDay = (day: number) => {
    setCustomerForm(prev => {
      const days = [...prev.preferredDays];
      const index = days.indexOf(day);
      
      if (index === -1) {
        days.push(day);
      } else {
        days.splice(index, 1);
      }
      
      return {
        ...prev,
        preferredDays: days,
      };
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-6">Clientes</h1>
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
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <button
            onClick={() => {
              setCurrentCustomer(null);
              resetCustomerForm();
              setShowCustomerModal(true);
            }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Cliente
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {customers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">Nenhum cliente encontrado. Crie um novo cliente para começar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CNPJ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fidelizado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{customer.cnpj}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{customer.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {customer.isFidelized ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          Sim
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Não
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditCustomer(customer)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Customer Modal */}
        {showCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">
                {currentCustomer ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <form onSubmit={handleCreateCustomer}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Nome</label>
                  <input
                    type="text"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">CNPJ</label>
                  <input
                    type="text"
                    value={customerForm.cnpj}
                    onChange={(e) => setCustomerForm({ ...customerForm, cnpj: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Endereço</label>
                  <input
                    type="text"
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
                    required
                  />
                </div>
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFidelized"
                      checked={customerForm.isFidelized}
                      onChange={(e) => setCustomerForm({ ...customerForm, isFidelized: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isFidelized" className="ml-2 block text-gray-700 dark:text-gray-300">
                      Cliente Fidelizado
                    </label>
                  </div>
                </div>
                
                {customerForm.isFidelized && (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">Cotas (minutos)</label>
                      <input
                        type="number"
                        value={customerForm.quotaMinutes}
                        onChange={(e) => setCustomerForm({ ...customerForm, quotaMinutes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
                      />
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="autoReserve"
                          checked={customerForm.autoReserve}
                          onChange={(e) => setCustomerForm({ ...customerForm, autoReserve: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="autoReserve" className="ml-2 block text-gray-700 dark:text-gray-300">
                          Reserva Automática
                        </label>
                      </div>
                    </div>
                    
                    {customerForm.autoReserve && (
                      <>
                        <div className="mb-4">
                          <label className="block text-gray-700 dark:text-gray-300 mb-2">Dias Preferidos</label>
                          <div className="grid grid-cols-4 gap-2">
                            {dayNames.map((day, index) => (
                              <div key={index} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`day-${index}`}
                                  checked={customerForm.preferredDays.includes(index)}
                                  onChange={() => togglePreferredDay(index)}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`day-${index}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                  {day}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-gray-700 dark:text-gray-300 mb-2">Horário Preferido</label>
                          <input
                            type="time"
                            value={customerForm.preferredTime}
                            onChange={(e) => setCustomerForm({ ...customerForm, preferredTime: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCustomerModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {currentCustomer ? 'Atualizar' : 'Criar'}
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