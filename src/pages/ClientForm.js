import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Layout from '../components/layout/Layout';
import { clientService } from '../services/client.service';
import toast from 'react-hot-toast';
import './ClientForm.css';

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
/* eslint-disable react-hooks/exhaustive-deps */

  useEffect(() => {
    if (isEditMode) {
      fetchClient();
    }
  }, [id]);

  const fetchClient = async () => {
    try {
      const response = await clientService.getById(id);
      console.log(response.data.data);
      reset(response.data.data);
    } catch (error) {
      toast.error('Failed to load client');
      navigate('/clients');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditMode) {
        await clientService.update(id, data);
        toast.success('Client updated successfully');
      } else {
        await clientService.create(data);
        toast.success('Client created successfully');
      }
      navigate('/clients');
    } catch (error) {
      toast.error(error.message || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Layout>
        <div className="loading">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="client-form-page">
        <h1 className="page-title">{isEditMode ? 'Edit Client' : 'Add New Client'}</h1>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="client-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  Client Name <span className="required">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name', { required: 'Client name is required' })}
                  placeholder="Enter client name"
                />
                {errors.name && <span className="error">{errors.name.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Please enter a valid email',
                    },
                  })}
                  placeholder="Enter email address"
                />
                {errors.email && <span className="error">{errors.email.message}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">
                  Phone <span className="required">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone', { required: 'Phone number is required' })}
                  placeholder="Enter phone number"
                />
                {errors.phone && <span className="error">{errors.phone.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  type="text"
                  {...register('company')}
                  placeholder="Enter company name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                rows="4"
                {...register('notes')}
                placeholder="Enter any additional notes..."
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/clients')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : isEditMode ? 'Update Client' : 'Create Client'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ClientForm;
