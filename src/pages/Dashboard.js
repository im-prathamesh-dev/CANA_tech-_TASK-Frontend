import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { clientService } from '../services/client.service';
import { userService } from '../services/user.service';
import toast from 'react-hot-toast';
import './Dashboard.css';
import { Users as UsersIcon } from 'lucide-react';
import { BarChart as BarChartIcon } from 'lucide-react';
import { CheckCircle as CheckCircleIcon } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [clientsRes, usersRes] = await Promise.all([
        clientService.getAll(),
        user?.role === 'admin' ? userService.getAll() : Promise.resolve({ data: { data: [] } }),
      ]);

      const clients = clientsRes.data.data;
      const activeClients = clients.filter((c) => c.status === 'active').length;
      console.log(clients);
      console.log(usersRes.data.data)
      setStats({
        totalClients: clients.length,
        activeClients,
        totalUsers: usersRes.data.data.length,
      });
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name}!</p>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue"><BarChartIcon size={24} /></div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.totalClients}</h3>
              <p className="stat-label">Total Clients</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-green"><CheckCircleIcon size={24} /></div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.activeClients}</h3>
              <p className="stat-label">Active Clients</p>
            </div>
          </div>

          {user?.role === 'admin' && (
            <div className="stat-card">
              <div className="stat-icon stat-icon-purple"><UsersIcon size={24} /></div>
              <div className="stat-content">
                <h3 className="stat-value">{stats.totalUsers}</h3>
                <p className="stat-label">Total Users</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
