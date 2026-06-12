import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminService } from '../../services/dashboardService';

const CategoryManagement = ({ setToast }) => {
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  
  // Inline Add row state
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState({
    name: '',
    description: '',
    appliesTo: 'Ticket',
    parentId: ''
  });

  // Inline Edit row state
  const [editingId, setEditingId] = useState(null);
  const [editCat, setEditCat] = useState({
    name: '',
    description: '',
    appliesTo: 'Ticket',
    parentId: ''
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCategories();
      setCategories(res.data.data || []);
    } catch (e) {
      console.error(e);
      setToast?.({ message: 'Failed to load categories', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleToggleActive = async (cat) => {
    try {
      await adminService.updateCategory(cat.id, {
        ...cat,
        isActive: !cat.isActive
      });
      setToast?.({ message: `Category ${cat.name} ${!cat.isActive ? 'activated' : 'deactivated'}`, variant: 'success' });
      loadCategories();
    } catch (e) {
      console.error(e);
      setToast?.({ message: 'Failed to toggle status', variant: 'error' });
    }
  };

  const handleAddSave = async () => {
    if (!newCat.name.trim()) {
      setToast?.({ message: 'Category Name is required', variant: 'warning' });
      return;
    }
    try {
      await adminService.saveCategory(newCat);
      setToast?.({ message: 'Category added successfully', variant: 'success' });
      setIsAdding(false);
      setNewCat({ name: '', description: '', appliesTo: 'Ticket', parentId: '' });
      loadCategories();
    } catch (e) {
      console.error(e);
      setToast?.({ message: 'Failed to create category', variant: 'error' });
    }
  };

  const handleEditStart = (cat) => {
    setEditingId(cat.id);
    setEditCat({
      name: cat.name,
      description: cat.description || '',
      appliesTo: cat.appliesTo,
      parentId: cat.parentId || ''
    });
  };

  const handleEditSave = async (id) => {
    if (!editCat.name.trim()) {
      setToast?.({ message: 'Category Name is required', variant: 'warning' });
      return;
    }
    try {
      await adminService.updateCategory(id, editCat);
      setToast?.({ message: 'Category updated successfully', variant: 'success' });
      setEditingId(null);
      loadCategories();
    } catch (e) {
      console.error(e);
      setToast?.({ message: 'Failed to update category', variant: 'error' });
    }
  };

  const tabs = ['All', 'Ticket', 'Asset', 'KnowledgeBase'];
  
  const filteredCategories = activeTab === 'All'
    ? categories
    : categories.filter(c => c.appliesTo === activeTab);

  // List of other categories that can act as parent categories
  const parentCandidates = categories.filter(c => c.isActive);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white">Category Management</h3>
          <p className="text-xs text-slate-450 dark:text-slate-400">Manage support ticket, asset catalog, and knowledge base categories.</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setEditingId(null); }}
          className="flex items-center gap-1.5 self-start sm:self-auto text-xs font-bold text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 py-2.5 px-4 rounded-xl shadow-md transition-all"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setIsAdding(false); setEditingId(null); }}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all outline-none ${
                isActive 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-650'
              }`}
            >
              {tab === 'KnowledgeBase' ? 'Knowledge Base' : tab}
            </button>
          );
        })}
      </div>

      {/* Grid workspace */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-950/30 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850">
              <th className="px-6 py-4 w-1/4">Category Name</th>
              <th className="px-6 py-4 w-1/3">Description</th>
              <th className="px-6 py-4">Applies To</th>
              <th className="px-6 py-4">Parent Category</th>
              <th className="px-6 py-4">Active</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {/* Inline Add Row */}
            {isAdding && (
              <tr className="bg-blue-50/10 dark:bg-blue-950/5">
                <td className="px-6 py-3">
                  <input
                    type="text"
                    value={newCat.name}
                    onChange={(e) => setNewCat(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name..."
                    className="w-full px-2.5 py-1.5 border border-blue-300 dark:border-blue-900 rounded text-xs bg-white dark:bg-slate-950 outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-3">
                  <input
                    type="text"
                    value={newCat.description}
                    onChange={(e) => setNewCat(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description..."
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded text-xs bg-white dark:bg-slate-950 outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-3">
                  <select
                    value={newCat.appliesTo}
                    onChange={(e) => setNewCat(prev => ({ ...prev, appliesTo: e.target.value }))}
                    className="px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded text-xs bg-white dark:bg-slate-950 outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Ticket">Ticket</option>
                    <option value="Asset">Asset</option>
                    <option value="KnowledgeBase">Knowledge Base</option>
                  </select>
                </td>
                <td className="px-6 py-3">
                  <select
                    value={newCat.parentId}
                    onChange={(e) => setNewCat(prev => ({ ...prev, parentId: e.target.value }))}
                    className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded text-xs bg-white dark:bg-slate-950 outline-none"
                  >
                    <option value="">None</option>
                    {parentCandidates
                      .filter(c => c.appliesTo === newCat.appliesTo)
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                  </select>
                </td>
                <td className="px-6 py-3">
                  <span className="text-xs text-slate-400">Yes</span>
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={handleAddSave}
                      className="p-1 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                      title="Save"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
                      title="Cancel"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* List Rows */}
            {loading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 dark:bg-slate-850 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredCategories.length === 0 && !isAdding ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                  No categories found in this tab. Click "Add Category" to create one.
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => {
                const isEditing = editingId === cat.id;
                return (
                  <tr key={cat.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors">
                    {isEditing ? (
                      <>
                        <td className="px-6 py-3">
                          <input
                            type="text"
                            value={editCat.name}
                            onChange={(e) => setEditCat(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-2.5 py-1.5 border border-blue-300 dark:border-blue-900 rounded text-xs bg-white dark:bg-slate-950 outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <input
                            type="text"
                            value={editCat.description}
                            onChange={(e) => setEditCat(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded text-xs bg-white dark:bg-slate-950 outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <select
                            value={editCat.appliesTo}
                            onChange={(e) => setEditCat(prev => ({ ...prev, appliesTo: e.target.value }))}
                            className="px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded text-xs bg-white dark:bg-slate-950 outline-none"
                          >
                            <option value="Ticket">Ticket</option>
                            <option value="Asset">Asset</option>
                            <option value="KnowledgeBase">Knowledge Base</option>
                          </select>
                        </td>
                        <td className="px-6 py-3">
                          <select
                            value={editCat.parentId}
                            onChange={(e) => setEditCat(prev => ({ ...prev, parentId: e.target.value }))}
                            className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded text-xs bg-white dark:bg-slate-950 outline-none"
                          >
                            <option value="">None</option>
                            {parentCandidates
                              .filter(c => c.appliesTo === editCat.appliesTo && c.id !== cat.id)
                              .map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                          </select>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-xs text-slate-400">{cat.isActive ? 'Yes' : 'No'}</span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleEditSave(cat.id)}
                              className="p-1 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {cat.name}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate" title={cat.description}>
                          {cat.description || '—'}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                            {cat.appliesTo === 'KnowledgeBase' ? 'Knowledge Base' : cat.appliesTo}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-550 dark:text-slate-350">
                          {cat.parentName || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(cat)}
                            className="transition-colors focus:outline-none"
                          >
                            {cat.isActive ? (
                              <ToggleRight className="text-blue-600 dark:text-blue-500" size={32} />
                            ) : (
                              <ToggleLeft className="text-slate-300 dark:text-slate-700" size={32} />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleEditStart(cat)}
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
                            title="Edit Inline"
                          >
                            <Edit2 size={14} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryManagement;
