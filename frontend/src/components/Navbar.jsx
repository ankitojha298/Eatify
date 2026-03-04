import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { ShoppingCart, User, LogOut, Sun, Moon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartItems } = useCart();
    const { isDarkMode, toggleTheme } = useTheme();

    const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="sticky top-0 z-50">
            {/* Sale Banner */}
            <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 text-center text-sm font-medium shadow-sm flex items-center justify-center gap-2">
                <span className="bg-white text-red-600 text-[10px] md:text-xs font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">Hot Deal 🔥</span>
                <span className="text-xs md:text-sm">Get <span className="font-bold underline decoration-white/70 underline-offset-4">30% OFF</span> when you order <span className="font-bold">Combo Items</span>!</span>
            </div>
            {/* Main Navbar */}
            <nav className="bg-white dark:bg-gray-900 shadow-md transition-colors duration-200 border-b dark:border-gray-800 relative z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="text-2xl font-extrabold text-orange-600 tracking-tight flex items-center gap-2">
                            <i className="fa-brands fa-pied-piper-alt text-4xl"></i>
                            Eatify
                        </Link>
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-500 transition-colors bg-gray-100 dark:bg-gray-800"
                                aria-label="Toggle Dark Mode"
                            >
                                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <Link to="/cart" className="relative text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors">
                                <ShoppingCart className="w-6 h-6" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <Link to={user.role === 'admin' || user.role === 'owner' ? '/admin/dashboard' : '/profile'} className="flex items-center text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition">
                                        <User className="w-5 h-5 mr-1" />
                                        <span className="font-medium">{user.name}</span>
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="flex items-center text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition"
                                    >
                                        <LogOut className="w-5 h-5 mr-1" /> Logout
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
