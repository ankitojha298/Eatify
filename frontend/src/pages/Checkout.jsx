import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { CreditCard, CheckCircle } from 'lucide-react';

const Checkout = () => {
    const { cartItems, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const placeOrder = async () => {
        if (!user) {
            alert('Please login to place order');
            navigate('/login');
            return;
        }

        const restaurantId = cartItems[0]?.restaurantId;
        if (!restaurantId) {
            alert('Your cart contains items from an older session that are missing restaurant details. Please clear your cart and add items again to place an order.');
            return;
        }

        setLoading(true);
        try {
            // Grouping items by restaurant (Assuming all items are from same restaurant for simplicity of schema)
            // For Eatify, user can order from one restaurant at a time ideally
            const restaurantId = cartItems[0]?.restaurantId;

            const orderData = {
                orderItems: cartItems,
                restaurant: restaurantId,
                totalAmount,
                paymentDetails: {
                    id: 'test_stripe_id_' + Date.now(),
                    status: 'Paid',
                    update_time: new Date().toISOString(),
                    email_address: user.email
                }
            };

            await api.post('/orders', orderData);
            setSuccess(true);
            clearCart();
        } catch (error) {
            console.error(error);
            alert('Failed to place order.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Order Confirmed!</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">Your delicious food is being prepared and will be out for delivery soon.</p>
                <button onClick={() => navigate('/')} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition">
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="py-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Checkout</h1>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                <h2 className="text-xl font-bold mb-4 border-b dark:border-gray-700 pb-2 dark:text-white">Order Summary</h2>
                <div className="space-y-3 mb-6">
                    {cartItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-gray-700 dark:text-gray-300">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="font-medium">₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">Total to Pay</span>
                    <span className="text-2xl font-extrabold text-orange-600">₹{totalAmount}</span>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-6 flex items-center dark:text-white"><CreditCard className="mr-2" /> Payment Method</h2>
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 p-4 rounded-xl text-blue-800 dark:text-blue-300 text-sm font-medium mb-6">
                    You are currently in test mode. A mock Stripe payment will be simulated.
                </div>

                <button
                    onClick={placeOrder}
                    disabled={loading || cartItems.length === 0}
                    className={`w-full py-4 rounded-xl text-lg font-bold text-white transition shadow-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {loading ? 'Processing Payment...' : `Pay ₹${totalAmount}`}
                </button>
            </div>
        </div>
    );
};

export default Checkout;
