import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';

const Cart = () => {
    const { cartItems, addToCart, removeFromCart } = useCart();
    const navigate = useNavigate();

    const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Your cart is empty</h2>
                <Link to="/" className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition shadow-sm">
                    Return to home
                </Link>
            </div>
        );
    }

    return (
        <div className="py-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                    {cartItems.map((item) => (
                        <li key={item.menuItem} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-grow">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">From: {item.restaurantName}</p>
                                <p className="font-bold text-orange-600 mt-1">₹{item.price}</p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
                                    <button onClick={() => item.quantity > 1 ? addToCart(item, -1) : removeFromCart(item.menuItem)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition text-gray-600 dark:text-gray-300">
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <span className="w-10 text-center font-bold dark:text-white">{item.quantity}</span>
                                    <button onClick={() => addToCart(item, 1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition text-gray-600 dark:text-gray-300">
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                <p className="font-extrabold text-lg text-gray-900 dark:text-white w-24 text-right">₹{item.price * item.quantity}</p>

                                <button
                                    onClick={() => removeFromCart(item.menuItem)}
                                    className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                                    title="Remove item"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 sm:p-8 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xl font-medium text-gray-600 dark:text-gray-400">Subtotal</span>
                        <span className="text-3xl font-extrabold text-gray-900 dark:text-white">₹{totalAmount}</span>
                    </div>

                    <button
                        onClick={() => navigate('/checkout')}
                        className="w-full bg-orange-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-orange-700 transition shadow-md"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
