import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiArrowRight,
  HiArrowLeft,
  HiCheck,
  HiOutlineClipboardCopy,
  HiX,
  HiOutlineCloudUpload,
  HiLockClosed,
} from 'react-icons/hi';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { submitOrder, uploadPaymentProof } from '../lib/supabase';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const CLASSES = [
  '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade',
  '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade',
  'Staff',
];

const PAYMENT_METHODS = [
  { id: 'cash', name: 'Cash', desc: 'Pay at the counter', icon: '💵' },
  {
    id: 'instapay',
    name: 'InstaPay',
    desc: 'Bank instant transfer',
    icon: '🏦',
    transfer: {
      label: 'InstaPay Number',
      value: '01067216723',
      note: 'Send the payment to this number, then place your order.',
    },
  },
  {
    id: 'telda',
    name: 'Telda',
    desc: 'Pay via Telda app',
    icon: '💳',
    transfer: {
      label: 'Telda Username',
      value: '@bodyyasser10',
      note: 'Send the payment to this username, then place your order.',
    },
  },
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (success) {
      const end = Date.now() + 800;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [success]);

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  // Errors
  const [errors, setErrors] = useState({});

  // Copy-to-clipboard feedback for transfer details
  const [copiedId, setCopiedId] = useState(null);

  // Payment-proof confirmation modal
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [modalErrors, setModalErrors] = useState({});

  const handleCopy = async (value, id) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1500);
    } catch {
      toast.error('Could not copy — please copy it manually.');
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Enter a valid phone number (digits only)';
    }
    if (!studentClass) {
      newErrors.class = 'Please select your class';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToStep2 = () => {
    if (validateStep1()) {
      setDirection(1);
      setStep(2);
      setErrors({});
    }
  };

  const goToStep1 = () => {
    setDirection(-1);
    setStep(1);
    setErrors({});
  };

  // Methods that require the customer to send a transfer first need a proof screenshot.
  const selectedMethod = PAYMENT_METHODS.find((p) => p.id === paymentMethod);
  const requiresProof = !!selectedMethod?.transfer;

  // Core order submission. `proofUrl` is the uploaded screenshot URL (or null for cash).
  const placeOrder = async (proofUrl) => {
    const order = await submitOrder({
      full_name: fullName.trim(),
      phone_number: phone.replace(/[\s-]/g, ''),
      class: studentClass,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
      })),
      payment_method: paymentMethod,
      payment_proof_url: proofUrl || null,
    });
    clearCart();
    setOrderId(order?.id ? order.id.slice(0, 8).toUpperCase() : null);
    setSuccess(true);
    toast.success('Order placed successfully! 🎉');
  };

  // "Place Order" click — open the proof modal for transfer methods, submit directly for cash.
  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      setErrors({ payment: 'Please select a payment method' });
      return;
    }

    if (requiresProof) {
      setModalErrors({});
      setProofModalOpen(true);
      return;
    }

    try {
      setSubmitting(true);
      await placeOrder(null);
    } catch (err) {
      console.error('Order error:', err);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProofSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setModalErrors((prev) => ({ ...prev, proof: 'Please choose an image file' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setModalErrors((prev) => ({ ...prev, proof: 'Image must be 5MB or smaller' }));
      return;
    }
    setProofFile(file);
    setModalErrors((prev) => ({ ...prev, proof: null }));
    const reader = new FileReader();
    reader.onload = (ev) => setProofPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const closeProofModal = () => {
    if (submitting) return;
    setProofModalOpen(false);
  };

  // Modal "Confirm Order" — validate, upload the proof, then submit.
  const handleConfirmOrder = async () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Enter a valid phone number';
    }
    if (!proofFile) newErrors.proof = 'Payment proof screenshot is required';
    setModalErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSubmitting(true);
      const proofUrl = await uploadPaymentProof(proofFile);
      await placeOrder(proofUrl);
      setProofModalOpen(false);
    } catch (err) {
      console.error('Order error:', err);
      toast.error('Could not upload proof / place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        className="checkout-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="checkout-container">
          <motion.div
            className="checkout-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          >
            <motion.div
              className="checkout-success-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
            >
              ✅
            </motion.div>
            <h2>Order Placed!</h2>
            {orderId && (
              <div className="checkout-order-id">
                Order #{orderId}
              </div>
            )}
            <p>Your order has been submitted. Please head to the canteen to pick it up!</p>
            <Link to="/" className="btn btn-primary btn-lg">
              Back to Menu
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <motion.div
        className="checkout-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="checkout-container">
          <motion.div
            className="checkout-empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="checkout-empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some items from the menu before checking out.</p>
            <Link to="/" className="btn btn-primary">
              Browse Menu
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="checkout-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <h1>
            <span>Checkout</span>
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="checkout-steps">
          <div className={`checkout-step ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="checkout-step-number">
              {step > 1 ? <HiCheck /> : '1'}
            </div>
            Your Info
          </div>
          <div className={`checkout-step-divider ${step > 1 ? 'active' : ''}`} />
          <div className={`checkout-step ${step === 2 ? 'active' : ''}`}>
            <div className="checkout-step-number">2</div>
            Payment
          </div>
        </div>

        {/* Form Area */}
        <div className="checkout-form-area">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                className="checkout-form-card"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              >
                <h3>
                  <span className="icon">📱</span> Your Information
                </h3>

                <div className="form-group">
                  <label className="form-label" htmlFor="fullName">
                    Full Name
                  </label>
                  <motion.input
                    id="fullName"
                    type="text"
                    className={`form-input ${errors.fullName ? 'error' : ''}`}
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
                    }}
                    whileFocus={{ scale: 1.01 }}
                  />
                  <AnimatePresence>
                    {errors.fullName && (
                      <motion.div
                        className="form-error"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        ⚠️ {errors.fullName}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">
                    Phone Number
                  </label>
                  <motion.input
                    id="phone"
                    type="tel"
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setPhone(val);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                    }}
                    whileFocus={{ scale: 1.01 }}
                    maxLength={15}
                  />
                  <AnimatePresence>
                    {errors.phone && (
                      <motion.div
                        className="form-error"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        ⚠️ {errors.phone}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="class">
                    Class / Grade
                  </label>
                  <select
                    id="class"
                    className={`form-select ${errors.class ? 'error' : ''}`}
                    value={studentClass}
                    onChange={(e) => {
                      setStudentClass(e.target.value);
                      if (errors.class) setErrors((prev) => ({ ...prev, class: null }));
                    }}
                  >
                    <option value="">Select your class</option>
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <AnimatePresence>
                    {errors.class && (
                      <motion.div
                        className="form-error"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        ⚠️ {errors.class}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="form-actions">
                  <Link to="/" className="btn btn-secondary">
                    <HiArrowLeft /> Back
                  </Link>
                  <motion.button
                    className="btn btn-primary"
                    onClick={goToStep2}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue <HiArrowRight />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                className="checkout-form-card"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              >
                <h3>
                  <span className="icon">💳</span> Payment Method
                </h3>

                <div className="payment-methods">
                  {PAYMENT_METHODS.map((pm) => {
                    const isSelected = paymentMethod === pm.id;
                    return (
                      <div key={pm.id} className="payment-method-group">
                        <motion.div
                          className={`payment-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setPaymentMethod(pm.id);
                            if (errors.payment) setErrors({});
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="payment-card-icon">{pm.icon}</div>
                          <div className="payment-card-info">
                            <div className="payment-card-name">{pm.name}</div>
                            <div className="payment-card-desc">{pm.desc}</div>
                          </div>
                          <motion.div
                            className="payment-card-check"
                            animate={isSelected ? { scale: [1.2, 1] } : {}}
                            transition={{ type: 'spring', stiffness: 400 }}
                          >
                            {isSelected && <HiCheck size={14} />}
                          </motion.div>
                        </motion.div>

                        {/* Slide-down transfer details (InstaPay / Telda) */}
                        <AnimatePresence initial={false}>
                          {isSelected && pm.transfer && (
                            <motion.div
                              className="payment-transfer"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            >
                              <div className="payment-transfer-inner">
                                <div className="payment-transfer-label">
                                  {pm.transfer.label}
                                </div>
                                <div className="payment-transfer-row">
                                  <span className="payment-transfer-value">
                                    {pm.transfer.value}
                                  </span>
                                  <motion.button
                                    type="button"
                                    className="payment-transfer-copy"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(pm.transfer.value, pm.id);
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    title="Copy"
                                  >
                                    {copiedId === pm.id ? (
                                      <>
                                        <HiCheck size={15} /> Copied
                                      </>
                                    ) : (
                                      <>
                                        <HiOutlineClipboardCopy size={15} /> Copy
                                      </>
                                    )}
                                  </motion.button>
                                </div>
                                <p className="payment-transfer-note">{pm.transfer.note}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {errors.payment && (
                    <motion.div
                      className="form-error"
                      style={{ marginTop: '12px' }}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      ⚠️ {errors.payment}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="form-actions">
                  <motion.button
                    className="btn btn-secondary"
                    onClick={goToStep1}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <HiArrowLeft /> Back
                  </motion.button>
                  <motion.button
                    className="btn btn-primary"
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.02 }}
                    whileTap={{ scale: submitting ? 1 : 0.98 }}
                    style={{ opacity: submitting ? 0.7 : 1 }}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner" /> Placing Order...
                      </>
                    ) : (
                      <>
                        {requiresProof ? 'Continue' : 'Place Order'} <HiCheck />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="order-summary-items">
            {items.map((item) => (
              <div key={item.key} className="order-summary-item">
                <div className="order-summary-item-qty">{item.quantity}</div>
                <div>
                  <div className="order-summary-item-name">{item.name}</div>
                  {item.variant && (
                    <div className="order-summary-item-variant">{item.variant}</div>
                  )}
                </div>
                <div className="order-summary-item-price">{item.price * item.quantity} EGP</div>
              </div>
            ))}
          </div>
          <div className="order-summary-divider" />
          <div className="order-summary-total">
            <span className="order-summary-total-label">Total</span>
            <span className="order-summary-total-value">{totalPrice} EGP</span>
          </div>
        </div>
      </div>

      {/* ═══ Payment Proof Confirmation Modal ═══ */}
      <AnimatePresence>
        {proofModalOpen && (
          <motion.div
            className="proof-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProofModal}
          >
            <motion.div
              className="proof-modal"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="proof-modal-close" onClick={closeProofModal} aria-label="Close">
                <HiX />
              </button>

              <div className="proof-modal-icon">📋</div>
              <h2 className="proof-modal-title">Confirm Your Order</h2>
              <p className="proof-modal-subtitle">
                Please enter your details and upload your payment screenshot so we can
                verify your payment faster.
              </p>

              {/* Full name */}
              <div className="form-group">
                <label className="form-label" htmlFor="proofName">
                  Full Name <span className="req">*</span>
                </label>
                <input
                  id="proofName"
                  type="text"
                  className={`form-input ${modalErrors.fullName ? 'error' : ''}`}
                  placeholder="Enter your full name"
                  value={fullName}
                  maxLength={50}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (modalErrors.fullName) setModalErrors((p) => ({ ...p, fullName: null }));
                  }}
                />
                {modalErrors.fullName && (
                  <div className="form-error">⚠️ {modalErrors.fullName}</div>
                )}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label" htmlFor="proofPhone">
                  Phone Number <span className="req">*</span>
                </label>
                <input
                  id="proofPhone"
                  type="tel"
                  className={`form-input ${modalErrors.phone ? 'error' : ''}`}
                  placeholder="e.g. 01012345678"
                  value={phone}
                  maxLength={15}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/[^0-9]/g, ''));
                    if (modalErrors.phone) setModalErrors((p) => ({ ...p, phone: null }));
                  }}
                />
                {modalErrors.phone && (
                  <div className="form-error">⚠️ {modalErrors.phone}</div>
                )}
              </div>

              {/* Payment proof upload */}
              <div className="form-group">
                <label className="form-label">
                  Payment Proof (Screenshot) <span className="req">*</span>
                </label>
                <label
                  className={`proof-upload ${proofPreview ? 'has-image' : ''} ${modalErrors.proof ? 'error' : ''}`}
                  htmlFor="proof-upload-input"
                >
                  {proofPreview ? (
                    <img src={proofPreview} alt="Payment proof preview" className="proof-upload-preview" />
                  ) : (
                    <>
                      <div className="proof-upload-icon"><HiOutlineCloudUpload /></div>
                      <div className="proof-upload-title">Click to upload or drag and drop</div>
                      <div className="proof-upload-hint">PNG, JPG, JPEG, WEBP (Max 5MB)</div>
                    </>
                  )}
                  <span className="proof-upload-btn">
                    {proofPreview ? 'Change Image' : 'Choose Image'}
                  </span>
                  <input
                    id="proof-upload-input"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleProofSelect}
                  />
                </label>
                {modalErrors.proof && (
                  <div className="form-error">⚠️ {modalErrors.proof}</div>
                )}
              </div>

              <div className="proof-modal-secure">
                <HiLockClosed /> Your payment information is secure and will only be used to
                verify your order.
              </div>

              <div className="proof-modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={closeProofModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <motion.button
                  className="btn btn-primary"
                  onClick={handleConfirmOrder}
                  disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                  style={{ opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? (
                    <>
                      <span className="spinner" /> Confirming...
                    </>
                  ) : (
                    <>
                      Confirm Order <HiLockClosed size={15} />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
