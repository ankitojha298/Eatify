import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { LayoutDashboard, Users, UtensilsCrossed, PackageOpen, PlusCircle, X, ExternalLink, Trash2 } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ restaurants: 0, orders: 0, revenue: 0, users: 0 });
    const [restaurants, setRestaurants] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const previousOrdersCountRef = useRef(null);

    const [isRestroModalOpen, setIsRestroModalOpen] = useState(false);
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

    const [restroForm, setRestroForm] = useState({ name: '', description: '', address: '', pinCode: '', categories: '', imageUrl: null });
    const [menuForm, setMenuForm] = useState({ restaurantId: '', name: '', description: '', price: '', isVeg: true, image: null });
    const [uploadingImage, setUploadingImage] = useState(false);
    const [keepMenuModalOpen, setKeepMenuModalOpen] = useState(true);

    const fetchStats = async () => {
        try {
            let restaurantQuery = '/restaurants';
            if (user && user.role === 'owner') {
                restaurantQuery = '/restaurants/myrestaurants';
            }

            const [ordersRes, restaurantsRes] = await Promise.all([
                api.get('/orders'),
                api.get(restaurantQuery)
            ]);

            const totalRevenue = ordersRes.data.reduce((acc, order) => acc + order.totalAmount, 0);

            let filteredRestaurants = [];

            if (user && user.role === 'owner') {
                // getMyRestaurants endpoint returns an array directly
                filteredRestaurants = restaurantsRes.data;
            } else {
                // Admin public endpoint returns { restaurants: [] } 
                filteredRestaurants = restaurantsRes.data.restaurants || restaurantsRes.data || [];
            }

            setRestaurants(filteredRestaurants);

            setOrders(ordersRes.data || []);

            setStats({
                restaurants: filteredRestaurants.length,
                orders: ordersRes.data.length,
                revenue: totalRevenue,
                users: 0 // Mock user count since no dedicated endpoint yet
            });

            // Check for new orders if this isn't the first fetch
            if (previousOrdersCountRef.current !== null) {
                const newOrdersCount = ordersRes.data.length - previousOrdersCountRef.current;
                if (newOrdersCount > 0) {
                    toast.success(`You have ${newOrdersCount} new order(s)!`, {
                        duration: 5000,
                        icon: '🔔',
                        style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                        },
                    });
                }
            }

            previousOrdersCountRef.current = ordersRes.data.length;
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || !['admin', 'owner'].includes(user.role)) {
            navigate('/');
            return;
        }
        fetchStats();

        // Polling for new orders every 10 seconds
        const intervalId = setInterval(() => {
            fetchStats();
        }, 10000);

        return () => clearInterval(intervalId);
    }, [user, navigate]);

    const handleImageUpload = async (e, setFormState) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const { data } = await api.post('/upload', formData, config);
            setFormState(prev => ({ ...prev, imageUrl: data.imageUrl }));
            setUploadingImage(false);
        } catch (error) {
            console.error(error);
            alert('Image upload failed');
            setUploadingImage(false);
        }
    };

    const handleCreateRestaurant = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...restroForm,
                categories: restroForm.categories.split(',').map(c => c.trim())
            };
            await api.post('/restaurants', payload);
            setIsRestroModalOpen(false);
            setRestroForm({ name: '', description: '', address: '', pinCode: '', categories: '', imageUrl: null });
            await fetchStats();
            alert('Restaurant created successfully!');
        } catch (error) {
            console.error('Failed to create restaurant', error);
            alert(error.response?.data?.message || 'Failed to create restaurant');
        }
    };

    const handleCreateMenu = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...menuForm,
                price: Number(menuForm.price)
            };
            await api.post(`/menus/${menuForm.restaurantId}`, payload);
            if (!keepMenuModalOpen) {
                setIsMenuModalOpen(false);
            }
            // Keep the restaurantId selected so they don't have to re-select it
            setMenuForm({ restaurantId: menuForm.restaurantId, name: '', description: '', price: '', isVeg: true, imageUrl: null });
            alert('Menu item added successfully!');
        } catch (error) {
            console.error('Failed to create menu item', error);
            alert(error.response?.data?.message || 'Failed to add menu item');
        }
    };

    const handleDeleteRestaurant = async (id) => {
        if (window.confirm('Are you sure you want to delete this restaurant? This cannot be undone.')) {
            try {
                await api.delete(`/restaurants/${id}`);
                await fetchStats();
                alert('Restaurant deleted');
            } catch (error) {
                console.error(error);
                alert(error.response?.data?.message || 'Failed to delete restaurant');
            }
        }
    };

    const handleUpdateOrderStatus = async (orderId, currentStatus, newStatus) => {
        if (currentStatus === newStatus) return;
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            // Update local state to reflect change instantly without full refetch
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            alert('Order status updated!');
        } catch (error) {
            console.error('Failed to update order status', error);
            alert(error.response?.data?.message || 'Failed to update status');
        }
    };

    if (!user || !['admin', 'owner'].includes(user.role)) return null;

    if (loading) return <div className="text-center py-20 animate-pulse font-semibold text-gray-500">Loading Dashboard...</div>;

    const titleText = user.role === 'admin' ? 'Admin Dashboard' : 'Restaurant Control';

    return (
        <div className="py-8 relative">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
                    <LayoutDashboard className="mr-3 w-8 h-8 text-orange-600" /> {titleText}
                </h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsRestroModalOpen(true)}
                        className="bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-orange-700 transition flex items-center shadow-sm"
                    >
                        <PlusCircle className="mr-2 w-5 h-5" /> Add Restaurant
                    </button>
                    {restaurants.length > 0 && (
                        <button
                            onClick={() => {
                                setMenuForm({ ...menuForm, restaurantId: restaurants[0]._id });
                                setIsMenuModalOpen(true);
                            }}
                            className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition flex items-center shadow-sm"
                        >
                            <UtensilsCrossed className="mr-2 w-5 h-5" /> Add Menu Item
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center hover:shadow-md transition">
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-xl mr-4">
                        <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">₹</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                        <p className="text-2xl font-extrabold text-gray-900 dark:text-white">₹{stats.revenue}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center hover:shadow-md transition">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl mr-4 text-blue-600 dark:text-blue-400">
                        <PackageOpen className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
                        <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.orders}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center hover:shadow-md transition">
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl mr-4 text-green-600 dark:text-green-400">
                        <UtensilsCrossed className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">My Restaurants</p>
                        <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.restaurants}</p>
                    </div>
                </div>

                {user.role === 'admin' && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center hover:shadow-md transition">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl mr-4 text-purple-600 dark:text-purple-400">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.users}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Restaurants List Display */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Restaurants</h2>
                </div>
                <div className="p-6">
                    {restaurants.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            You don't have any restaurants yet. Create one to get started!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {restaurants.map(restro => (
                                <div key={restro._id} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center relative overflow-hidden group">
                                    <button
                                        onClick={() => handleDeleteRestaurant(restro._id)}
                                        className="absolute top-2 right-2 bg-red-100 dark:bg-red-900/30 p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition shadow-sm z-10"
                                        title="Delete Restaurant"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="w-full h-40 relative rounded-lg mb-4 overflow-hidden">
                                        <img src={restro.imageUrl || '/images/sample.jpg'} alt={restro.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white text-center">{restro.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">{restro.address}</p>
                                    <div className="flex gap-2 flex-wrap justify-center mt-auto pt-4 mb-4">
                                        {restro.categories?.map(c => (
                                            <span key={c} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">{c}</span>
                                        ))}
                                    </div>
                                    <Link
                                        to={`/restaurant/${restro._id}`}
                                        className="w-full mt-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 py-2 rounded-lg font-bold hover:bg-orange-200 dark:hover:bg-orange-900/50 transition flex items-center justify-center text-sm"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" /> Manage Menus
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Orders List Display */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mt-12">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center"><PackageOpen className="w-5 h-5 mr-2 text-orange-600" /> Recent Orders</h2>
                </div>
                <div className="p-4 overflow-x-auto">
                    {orders.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            No orders have been placed yet.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-max">
                            <thead>
                                <tr className="text-sm text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700">
                                    <th className="pb-3 px-4 font-semibold uppercase tracking-wider">Order ID</th>
                                    <th className="pb-3 px-4 font-semibold uppercase tracking-wider">Customer</th>
                                    <th className="pb-3 px-4 font-semibold uppercase tracking-wider">Items Activity</th>
                                    <th className="pb-3 px-4 font-semibold uppercase tracking-wider">Total Amount</th>
                                    <th className="pb-3 px-4 font-semibold uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {orders.slice().reverse().map(order => (
                                    <tr key={order._id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition">
                                        <td className="py-4 px-4 font-mono text-gray-600 dark:text-gray-400">{order._id.substring(18)}</td>
                                        <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">{order.user?.name || 'Guest'}</td>
                                        <td className="py-4 px-4 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                                            {order.orderItems?.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                                        </td>
                                        <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">₹{order.totalAmount}</td>
                                        <td className="py-4 px-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleUpdateOrderStatus(order._id, order.status, e.target.value)}
                                                className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase cursor-pointer border-none outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white
                                                    ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                                                    ${order.status === 'Preparing' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                                                    ${order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                                                    ${order.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                                                    ${order.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                                                `}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Preparing">Preparing</option>
                                                <option value="Out for Delivery">Out for Delivery</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create Restaurant Modal */}
            {isRestroModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setIsRestroModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add New Restaurant</h2>
                        <form onSubmit={handleCreateRestaurant} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Banner Image</label>
                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setRestroForm)} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 border file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 dark:file:bg-orange-900/30 file:text-orange-700 dark:file:text-orange-400 hover:file:bg-orange-100 dark:hover:file:bg-orange-900/50" />
                                {uploadingImage && <p className="text-sm text-orange-500 mt-1">Uploading...</p>}
                                {restroForm.imageUrl && <p className="text-sm text-green-500 mt-1">Image uploaded successfully</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Restaurant Name</label>
                                <input type="text" required value={restroForm.name} onChange={e => setRestroForm({ ...restroForm, name: e.target.value })} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea required value={restroForm.description} onChange={e => setRestroForm({ ...restroForm, description: e.target.value })} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 border" rows="3"></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                    <input type="text" required value={restroForm.address} onChange={e => setRestroForm({ ...restroForm, address: e.target.value })} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pin Code</label>
                                    <input type="text" required value={restroForm.pinCode} onChange={e => setRestroForm({ ...restroForm, pinCode: e.target.value })} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 border" placeholder="e.g. 110001" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categories (comma separated)</label>
                                <input type="text" placeholder="e.g. veg, pizza, fast food" required value={restroForm.categories} onChange={e => setRestroForm({ ...restroForm, categories: e.target.value })} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 border" />
                            </div>
                            <button type="submit" disabled={uploadingImage} className={`w-full text-white font-bold py-3 rounded-lg transition ${uploadingImage ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}>Create Restaurant</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Menu Modal */}
            {isMenuModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setIsMenuModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add Menu Item</h2>
                        <form onSubmit={handleCreateMenu} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Food Image</label>
                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setMenuForm)} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 border file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-100 dark:hover:file:bg-gray-600" />
                                {uploadingImage && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Uploading...</p>}
                                {menuForm.imageUrl && <p className="text-sm text-green-500 mt-1">Image uploaded successfully</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Restaurant</label>
                                <select required value={menuForm.restaurantId} onChange={e => setMenuForm({ ...menuForm, restaurantId: e.target.value })} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 border bg-white dark:bg-gray-700">
                                    {restaurants.map(r => (
                                        <option key={r._id} value={r._id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name</label>
                                <input type="text" required value={menuForm.name} onChange={e => setMenuForm({ ...menuForm, name: e.target.value })} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <input type="text" required value={menuForm.description} onChange={e => setMenuForm({ ...menuForm, description: e.target.value })} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 border" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                                    <input type="number" required min="0" value={menuForm.price} onChange={e => setMenuForm({ ...menuForm, price: e.target.value })} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 border" />
                                </div>
                                <div className="flex flex-col justify-end pb-2">
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" checked={menuForm.isVeg} onChange={e => setMenuForm({ ...menuForm, isVeg: e.target.checked })} className="h-5 w-5 text-orange-600 rounded border-gray-300 dark:border-gray-600" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">Vegetarian?</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={keepMenuModalOpen}
                                        onChange={e => setKeepMenuModalOpen(e.target.checked)}
                                        className="h-4 w-4 text-orange-600 rounded border-gray-300 dark:border-gray-600"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Keep open to add another</span>
                                </label>
                            </div>

                            <button type="submit" disabled={uploadingImage} className={`w-full text-white font-bold py-3 rounded-lg transition mt-6 ${uploadingImage ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600'}`}>Add to Menu</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
