import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard | DockManager</title>
      </Head>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">
                Welcome, {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick stats cards */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Pedidos Pendentes
                </h2>
                <p className="text-3xl font-bold text-primary-600">0</p>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Docas Ativas
                </h2>
                <p className="text-3xl font-bold text-primary-600">0</p>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Pedidos Hoje
                </h2>
                <p className="text-3xl font-bold text-primary-600">0</p>
              </div>
            </div>

            {/* Recent orders */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pedidos Recentes
              </h2>
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  <li className="px-6 py-4 flex items-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      Nenhum pedido recente encontrado.
                    </p>
                  </li>
                </ul>
              </div>
            </div>

            {/* Dock status */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Status das Docas
              </h2>
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  <li className="px-6 py-4 flex items-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      Nenhuma doca cadastrada.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
    </Layout>
  );
}