import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { reservationsApi, profileApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Payment() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [bookingData, setBookingData] = useState(location.state || {});
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    paymentMethod: 'BANK_TRANSFER',
    accountNumber: '',
    bankName: '',
    address: '',
    reservationDate: new Date().toISOString().split('T')[0],
    stallType: 'Standard',
    preferredStallSize: 'Medium',
    stallsRequired: 1,
    businessCategory: 'Food & Beverage',
    specialRequirements: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingData.stallIds) {
      // Allow redirect
    }
    profileApi.get()
      .then(setProfile)
      .catch(console.error);
  }, [bookingData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        eventId: bookingData.eventId,
        stallIds: bookingData.stallIds,
        genreIds: bookingData.genreIds || [],
        stallDescription: bookingData.stallDescription || 'Standard Setup',
        ...formData
      };

      await reservationsApi.book(payload);

      navigate('/reservations', {
        state: { message: 'Booking submitted successfully! Waiting for Admin approval.' }
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bookingData.stallIds) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 p-8">
        No booking in progress. Please select stalls first.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 text-gray-100">
      <h1 className="font-display text-4xl font-bold mb-8 text-gray-100">Review & Pay</h1>

      <div className="grid md:grid-cols-2 gap-8">

        {/* Section A: Event Summary */}
        <div className="bg-gray-800/90 p-6 rounded-xl border border-gray-700 shadow-lg h-fit">
          <h2 className="text-2xl font-bold mb-4 text-blue-300">Booking Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Event</span>
              <span className="font-medium text-right">{bookingData.eventName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Date</span>
              <span className="font-medium">{new Date(bookingData.eventDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Selected Stalls</span>
              <span className="font-medium">{bookingData.stallNames?.join(', ') || bookingData.stallIds?.length + ' stalls'}</span>
            </div>
            <div className="border-t border-gray-700 my-2 pt-2">
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total Amount</span>
                <span className="font-bold text-amber-400">Rs. {Number(bookingData.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-300 font-semibold mt-1">
                <span>Advance (10%)</span>
                <span>Rs. {(Number(bookingData.totalAmount) * 0.10).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section B & C: Payment Form */}
        <div>
          <div className="bg-gray-800/80 p-6 rounded-xl shadow-lg border border-gray-700 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-300">Vendor Profile Details</h2>
            <div className="space-y-2 text-gray-300 text-sm">
              <p><span className="font-semibold text-gray-100">Username (IDP):</span> {profile?.email || user?.email}</p>
              <p><span className="font-semibold text-gray-100">Name:</span> {profile?.name || user?.name}</p>
              <p><span className="font-semibold text-gray-100">Email Address:</span> {profile?.email || user?.email}</p>
              <p><span className="font-semibold text-gray-100">Contact Number:</span> {profile?.phone || 'N/A'}</p>
              <p><span className="font-semibold text-gray-100">Organization / Business:</span> {profile?.businessName || 'N/A'}</p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-gray-800/80 p-6 rounded-xl shadow-lg border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-6 text-blue-300">Stall Reservation & Payment</h2>

            {error && (
              <div className="p-3 mb-4 bg-red-900/80 text-red-300 rounded-lg border border-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* OIDC Assignment Required Fields */}
              <h3 className="text-lg font-semibold text-amber-300 border-b border-gray-700 pb-1 mt-2">Reservation Info</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reservation Date</label>
                <input
                  type="date"
                  name="reservationDate"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.reservationDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Stall Type</label>
                  <select
                    name="stallType"
                    value={formData.stallType}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="Standard">Standard Stall</option>
                    <option value="Premium">Premium Stall</option>
                    <option value="Corner Stall">Corner Stall</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Preferred Stall Size</label>
                  <select
                    name="preferredStallSize"
                    value={formData.preferredStallSize}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Number of Stalls Required</label>
                  <input
                    type="number"
                    name="stallsRequired"
                    required
                    min="1"
                    value={formData.stallsRequired}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Business Category</label>
                  <select
                    name="businessCategory"
                    value={formData.businessCategory}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Handicrafts">Handicrafts</option>
                    <option value="Services">Services</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Special Requirements or Comments</label>
                <textarea
                  name="specialRequirements"
                  rows="2"
                  value={formData.specialRequirements}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter any special requests..."
                />
              </div>

              <h3 className="text-lg font-semibold text-amber-300 border-b border-gray-700 pb-1 mt-6">Payment Info</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Account Number / Card Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  required
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter account or card number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bank Name / Provider</label>
                <input
                  type="text"
                  name="bankName"
                  required
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="e.g. Chase, Visa, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Billing Address</label>
                <textarea
                  name="address"
                  required
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter full address"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-6 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-lg transition-colors shadow-md ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Payment & Book'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}