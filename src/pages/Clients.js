import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { clientService } from '../services/client.service';
import toast from 'react-hot-toast';
import './Clients.css';

const Clients = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await clientService.getAll();
      console.log(response.data.data);
      setClients(response.data.data);
    } catch (error) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) {
      return;
    }

    try {
      await clientService.delete(id);
      toast.success('Client deleted successfully');
      fetchClients();
    } catch (error) {
      toast.error(error.message || 'Failed to delete client');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-success',
      inactive: 'badge-danger',
      pending: 'badge-warning',
    };
    return badges[status] || '';
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="clients-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Clients</h1>
            <p className="page-subtitle">Manage your client records</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'staff') && (
            <Link to="/clients/new" className="btn btn-primary">
              Add New Client
            </Link>
          )}
        </div>

        <div className="clients-filters">
          <input
            type="text"
            placeholder="Search clients by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {filteredClients.length === 0 ? (
          <div className="empty-state">
            <p>No clients found</p>
            {(user?.role === 'admin' || user?.role === 'staff') && (
              <Link to="/clients/new" className="btn btn-primary" style={{ marginTop: '20px' }}>
                Add Your First Client
              </Link>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client._id}>
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td>{client.company || '-'}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => navigate(`/clients/${client._id}/edit`)}
                          className="btn btn-secondary btn-sm"
                          disabled={user?.role === 'viewer'}
                        >
                          {user?.role === 'viewer' ? 'View' : 'Edit'}
                        </button>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(client._id)}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Clients;
