import React, { useState, useEffect } from 'react';
import { Mail, Server, Shield, Lock, Save } from 'lucide-react';
import { adminService } from '../../services/dashboardService';

const EmailConfiguration = ({ setToast }) => {
  const [formData, setFormData] = useState({
    smtpServer: '',
    smtpPort: '',
    emailAddress: '',
    password: '',
    enableSSL: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPasswordConfigured, setIsPasswordConfigured] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const res = await adminService.getEmailConfig();
        const data = res.data.data;
        if (data) {
          setFormData({
            smtpServer: data.smtpServer || '',
            smtpPort: data.smtpPort || '',
            emailAddress: data.emailAddress || '',
            password: '', // do not fill password to preserve security
            enableSSL: !!data.enableSSL
          });
          // If the server has a configuration, assume a password is set
          setIsPasswordConfigured(!!data.smtpServer);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.smtpServer.trim()) {
      setToast?.({ message: 'SMTP Server is required', variant: 'warning' });
      return;
    }
    if (!formData.smtpPort) {
      setToast?.({ message: 'SMTP Port is required', variant: 'warning' });
      return;
    }
    if (!formData.emailAddress.trim()) {
      setToast?.({ message: 'Sender Email Address is required', variant: 'warning' });
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData };
      
      // If password field is empty and it was already configured, do not overwrite it or send placeholder
      if (!payload.password && isPasswordConfigured) {
        // Retrieve and retain old password or let backend know not to change it
        delete payload.password;
      }

      await adminService.saveEmailConfig(payload);
      setToast?.({ message: 'Email configuration saved successfully!', variant: 'success' });
      if (formData.password) {
        setIsPasswordConfigured(true);
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (e) {
      console.error(e);
      setToast?.({ message: 'Failed to save configuration', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white">Email Configuration</h3>
        <p className="text-xs text-slate-450 dark:text-slate-400">Configure connection details for outgoing SMTP email alerts and notifications.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-850 flex items-center gap-3">
          <Mail className="text-blue-600 dark:text-blue-400" size={20} />
          <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-white">SMTP Server Configuration</h4>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase mb-1.5 flex items-center gap-1">
                <Server size={12} /> SMTP Server
              </label>
              <input
                type="text"
                name="smtpServer"
                value={formData.smtpServer}
                onChange={handleChange}
                placeholder="smtp.example.com"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950/40 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase mb-1.5 flex items-center gap-1">
                Port
              </label>
              <input
                type="number"
                name="smtpPort"
                value={formData.smtpPort}
                onChange={handleChange}
                placeholder="587"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950/40 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase mb-1.5 flex items-center gap-1">
              <Mail size={12} /> Sender Email Address
            </label>
            <input
              type="email"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleChange}
              placeholder="no-reply@company.com"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950/40 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase mb-1.5 flex items-center gap-1">
              <Lock size={12} /> SMTP Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isPasswordConfigured ? '••••••••' : 'Enter SMTP password'}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950/40 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/55 dark:border-slate-850 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="text-slate-450" size={16} />
              <div>
                <span className="text-xs font-semibold text-slate-750 dark:text-slate-250">Enable SSL/TLS Encryption</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Encrypts network connections for safety.</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, enableSSL: !prev.enableSSL }))}
              className={`w-11 h-6 rounded-full transition-all focus:outline-none flex items-center p-0.5 ${
                formData.enableSSL ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between flex-wrap gap-4">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
              * Note: Password is encrypted and never returned by the API.
            </span>
            
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 disabled:opacity-50 py-2.5 px-5 rounded-xl shadow-md shadow-blue-550/15 transition-all"
            >
              <Save size={14} /> {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailConfiguration;
