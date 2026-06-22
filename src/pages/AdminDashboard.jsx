import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineCube,
  HiOutlineClipboardList,
  HiOutlineLogout,
  HiOutlinePencil,
  HiOutlineTrash,
  HiPlus,
  HiOutlineX,
  HiOutlineMenu,
  HiOutlineSearch,
  HiOutlinePhotograph,
} from 'react-icons/hi';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchOrders,
  uploadProductImage,
} from '../lib/supabase';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image_url: '',
    variants: [],
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  // Auth check
  useEffect(() => {
    if (sessionStorage.getItem('munchies_admin') !== 'true') {
      navigate('/admins-only');
    }
  }, [navigate]);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [prods, ords] = await Promise.all([fetchProducts(), fetchOrders()]);
      setProducts(prods || []);
      setOrders(ords || []);
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const handleLogout = () => {
    sessionStorage.removeItem('munchies_admin');
    navigate('/admins-only');
  };

  // ─── Product Modal ───
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', category: '', price: '', description: '', image_url: '', variants: [] });
    setImageFile(null);
    setImagePreview('');
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    let variants = [];
    try {
      if (product.variants) {
        const parsed = typeof product.variants === 'string'
          ? JSON.parse(product.variants)
          : product.variants;
        variants = Array.isArray(parsed) ? parsed.map((v) => (typeof v === 'string' ? v : v.name || v.label || '')) : [];
      }
    } catch { variants = []; }

    setFormData({
      name: product.name || '',
      category: product.category || '',
      price: product.price?.toString() || '',
      description: product.description || '',
      image_url: product.image_url || '',
      variants,
    });
    setImageFile(null);
    setImagePreview(product.image_url || '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const addVariant = () => {
    setFormData((prev) => ({ ...prev, variants: [...prev.variants, ''] }));
  };

  const updateVariant = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? value : v)),
    }));
  };

  const removeVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.price || isNaN(Number(formData.price))) {
      toast.error('Valid price is required');
      return;
    }

    try {
      setSaving(true);
      let imageUrl = formData.image_url;

      if (imageFile) {
        try {
          imageUrl = await uploadProductImage(imageFile);
        } catch (err) {
          console.error('Image upload failed:', err);
          toast.error(`Image upload failed: ${err.message || 'Unknown error'}. Saving without image.`);
        }
      }

      const productData = {
        name: formData.name.trim(),
        category: formData.category.trim() || null,
        price: Number(formData.price),
        description: formData.description.trim() || null,
        image_url: imageUrl || null,
        variants: formData.variants.filter((v) => v.trim()),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success('Product updated!');
      } else {
        await createProduct(productData);
        toast.success('Product created!');
      }

      closeModal();
      await loadData();
    } catch (err) {
      console.error('Save error:', err);
      toast.error(`Failed to save: ${err?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ───
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteProduct(deleteConfirm.id);
      toast.success('Product deleted');
      setDeleteConfirm(null);
      await loadData();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete product');
    }
  };

  // ─── Render helpers ───
  const formatOrderItems = (itemsJson) => {
    try {
      const items = typeof itemsJson === 'string' ? JSON.parse(itemsJson) : itemsJson;
      if (!Array.isArray(items)) return '—';
      return items.map((i) => `${i.quantity}x ${i.name}`).join(', ');
    } catch {
      return '—';
    }
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile toggle */}
      <motion.button
        className="admin-mobile-toggle"
        onClick={() => setSidebarOpen(true)}
        whileTap={{ scale: 0.9 }}
      >
        <HiOutlineMenu />
      </motion.button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="admin-mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo-wrapper">
            <img src="/logo.png" alt="Munchies" className="admin-sidebar-logo" />
          </div>
          <span className="admin-sidebar-title">munchies</span>
        </div>

        <div className="admin-sidebar-label">Management</div>
        <nav className="admin-sidebar-nav">
          <button
            className={`admin-sidebar-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => { setActiveTab('products'); setSidebarOpen(false); }}
          >
            <span className="icon"><HiOutlineCube /></span> Products
          </button>
          <button
            className={`admin-sidebar-link ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => { setActiveTab('orders'); setSidebarOpen(false); }}
          >
            <span className="icon"><HiOutlineClipboardList /></span> Orders
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <HiOutlineLogout /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="admin-topbar">
              <h1>Products</h1>
              <div className="admin-topbar-actions">
                <div style={{ position: 'relative' }}>
                  <HiOutlineSearch
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-tertiary)',
                    }}
                  />
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: 36 }}
                  />
                </div>
                <motion.button
                  className="btn btn-primary"
                  onClick={openCreateModal}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <HiPlus /> Add Product
                </motion.button>
              </div>
            </div>

            {/* Stats */}
            <div className="admin-stats">
              <motion.div
                className="admin-stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="admin-stat-label">Total Products</div>
                <div className="admin-stat-value green">{products.length}</div>
              </motion.div>
              <motion.div
                className="admin-stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="admin-stat-label">Categories</div>
                <div className="admin-stat-value">
                  {new Set(products.map((p) => p.category).filter(Boolean)).size}
                </div>
              </motion.div>
              <motion.div
                className="admin-stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="admin-stat-label">Total Orders</div>
                <div className="admin-stat-value">{orders.length}</div>
              </motion.div>
            </div>

            {/* Product Table */}
            <div className="admin-products-table">
              {loading ? (
                <div className="admin-empty">
                  <div className="spinner" style={{ borderTopColor: 'var(--color-primary)', borderColor: 'var(--color-secondary-dark)' }} />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="admin-empty">
                  <div className="admin-empty-icon">📦</div>
                  <h3>{search ? 'No matching products' : 'No products yet'}</h3>
                  <p style={{ color: 'var(--color-text-tertiary)' }}>
                    {search ? 'Try a different search term' : 'Add your first product to get started'}
                  </p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product, idx) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        <td>
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="admin-product-thumb" />
                          ) : (
                            <div className="admin-product-thumb-placeholder">🍽️</div>
                          )}
                        </td>
                        <td>
                          <span className="admin-product-name">{product.name}</span>
                        </td>
                        <td>
                          {product.category ? (
                            <span className="admin-product-category">{product.category}</span>
                          ) : '—'}
                        </td>
                        <td>
                          <span className="admin-product-price">{product.price} EGP</span>
                        </td>
                        <td>
                          <div className="admin-table-actions">
                            <motion.button
                              className="admin-action-btn edit"
                              onClick={() => openEditModal(product)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Edit"
                            >
                              <HiOutlinePencil />
                            </motion.button>
                            <motion.button
                              className="admin-action-btn delete"
                              onClick={() => setDeleteConfirm(product)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Delete"
                            >
                              <HiOutlineTrash />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="admin-topbar">
              <h1>Orders</h1>
            </div>

            <div className="admin-orders-table">
              {loading ? (
                <div className="admin-empty">
                  <div className="spinner" style={{ borderTopColor: 'var(--color-primary)', borderColor: 'var(--color-secondary-dark)' }} />
                </div>
              ) : orders.length === 0 ? (
                <div className="admin-empty">
                  <div className="admin-empty-icon">📋</div>
                  <h3>No orders yet</h3>
                  <p style={{ color: 'var(--color-text-tertiary)' }}>
                    Orders will appear here when students place them
                  </p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Class</th>
                      <th>Items</th>
                      <th>Payment</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        <td style={{ fontWeight: 600 }}>{order.full_name || '—'}</td>
                        <td>{order.phone_number}</td>
                        <td>{order.class || '—'}</td>
                        <td>
                          <span className="order-items-preview">
                            {formatOrderItems(order.items ?? order.items_json)}
                          </span>
                        </td>
                        <td>
                          <span className={`order-payment-badge ${order.payment_method}`}>
                            {order.payment_method}
                          </span>
                        </td>
                        <td style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                          {formatDate(order.created_at)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* ═══ Product Create/Edit Modal ═══ */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="admin-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="admin-modal"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                <button className="admin-modal-close" onClick={closeModal}>
                  <HiOutlineX />
                </button>
              </div>

              <div className="admin-modal-body">
                {/* Image Upload */}
                <div className="form-group">
                  <label className="form-label">Product Image</label>
                  <label
                    className={`image-upload-area ${imagePreview ? 'has-image' : ''}`}
                    htmlFor="image-upload-input"
                  >
                    {imagePreview ? (
                      <>
                        <motion.img
                          src={imagePreview}
                          alt="Preview"
                          className="image-upload-preview"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                        />
                        <span className="image-upload-change">Change</span>
                      </>
                    ) : (
                      <>
                        <div className="image-upload-icon">
                          <HiOutlinePhotograph />
                        </div>
                        <div className="image-upload-text">Click to upload image</div>
                        <div className="image-upload-hint">PNG, JPG up to 5MB</div>
                      </>
                    )}
                    <input
                      id="image-upload-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageSelect}
                    />
                  </label>
                  <div className="image-url-divider">
                    <span>or paste image URL</span>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://example.com/image.jpg"
                    value={imageFile ? '' : (formData.image_url || '')}
                    disabled={!!imageFile}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, image_url: e.target.value }));
                      if (e.target.value) {
                        setImagePreview(e.target.value);
                        setImageFile(null);
                      }
                    }}
                  />
                </div>

                {/* Name */}
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Chocolate Muffin"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    placeholder="Short description of the product..."
                    rows={3}
                    style={{ resize: 'vertical' }}
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* Price & Category */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Price (EGP) *</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      min="0"
                      step="0.5"
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Snacks"
                      value={formData.category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Variants */}
                <div className="form-group">
                  <label className="form-label">Variants (Optional)</label>
                  <div className="variants-editor">
                    <AnimatePresence>
                      {formData.variants.map((variant, i) => (
                        <motion.div
                          key={i}
                          className="variant-row"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <input
                            type="text"
                            className="form-input"
                            placeholder={`Variant ${i + 1}`}
                            value={variant}
                            onChange={(e) => updateVariant(i, e.target.value)}
                          />
                          <motion.button
                            className="variant-remove-btn"
                            onClick={() => removeVariant(i)}
                            whileTap={{ scale: 0.9 }}
                          >
                            <HiOutlineX />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <button className="variant-add-btn" onClick={addVariant}>
                      <HiPlus /> Add Variant
                    </button>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <motion.button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                  whileHover={{ scale: saving ? 1 : 1.02 }}
                  whileTap={{ scale: saving ? 1 : 0.98 }}
                  style={{ opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? (
                    <>
                      <span className="spinner" /> Saving...
                    </>
                  ) : editingProduct ? (
                    'Update Product'
                  ) : (
                    'Create Product'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Delete Confirmation Modal ═══ */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="admin-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              className="admin-modal delete-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="delete-modal-body">
                <div className="delete-modal-icon">🗑️</div>
                <h3>Delete Product?</h3>
                <p>
                  Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
                  This action cannot be undone.
                </p>
                <div className="delete-modal-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    Cancel
                  </button>
                  <motion.button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    whileTap={{ scale: 0.97 }}
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
