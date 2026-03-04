import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Minus, Star, Trash2, X } from 'lucide-react';

const RestaurantDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [menuForm, setMenuForm] = useState({ name: '', description: '', price: '', isVeg: true, image: null });
    const [uploadingImage, setUploadingImage] = useState(false);
    const [keepMenuModalOpen, setKeepMenuModalOpen] = useState(true);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const { data } = await api.post('/upload', formData, config);
            setMenuForm(prev => ({ ...prev, imageUrl: data.imageUrl }));
            setUploadingImage(false);
        } catch (error) {
            console.error(error);
            alert('Image upload failed');
            setUploadingImage(false);
        }
    };

    const handleCreateMenu = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...menuForm, price: Number(menuForm.price) };
            await api.post(`/menus/${restaurant._id}`, payload);

            const menuRes = await api.get(`/menus/${restaurant._id}`);
            setMenus(menuRes.data);

            if (!keepMenuModalOpen) {
                setIsMenuModalOpen(false);
            }
            setMenuForm({ name: '', description: '', price: '', isVeg: true, imageUrl: null });
        } catch (error) {
            console.error('Failed to create menu item', error);
            alert(error.response?.data?.message || 'Failed to add menu item');
        }
    };

    const handleDeleteMenu = async (menuId) => {
        if (window.confirm('Are you sure you want to delete this menu item?')) {
            try {
                await api.delete(`/menus/${menuId}`);
                setMenus(menus.filter(m => m._id !== menuId));
            } catch (error) {
                console.error(error);
                alert(error.response?.data?.message || 'Failed to delete menu item');
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resRes, menuRes] = await Promise.all([
                    api.get(`/restaurants/${id}`),
                    api.get(`/menus/${id}`)
                ]);
                setRestaurant(resRes.data);
                setMenus(menuRes.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="text-center py-20 animate-pulse text-lg font-semibold text-gray-600">Loading deliciousness...</div>;
    if (!restaurant) return <div className="text-center py-20 text-red-500">Restaurant not found</div>;

    const isOwnerOrAdmin = user && (user._id === restaurant.owner || user.role === 'admin');

    const handleDeleteRestaurant = async () => {
        if (window.confirm('Are you sure you want to delete this restaurant? This cannot be undone.')) {
            try {
                await api.delete(`/restaurants/${restaurant._id}`);
                alert('Restaurant deleted successfully.');
                navigate('/dashboard');
            } catch (error) {
                console.error(error);
                alert(error.response?.data?.message || 'Failed to delete restaurant');
            }
        }
    };

    return (
        <div className="py-8">
            {/* Restaurant Header */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-12 relative">
                {isOwnerOrAdmin && (
                    <button
                        onClick={handleDeleteRestaurant}
                        className="absolute top-4 right-4 z-10 bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-red-700 transition flex items-center"
                    >
                        <Trash2 className="w-5 h-5 mr-2" /> Delete Restaurant
                    </button>
                )}
                <div className="h-64 sm:h-80 w-full relative">
                    <img
                        src={restaurant.imageUrl || 'https://placehold.co/800x400?text=No+Image+Uploaded'}
                        alt={restaurant.name}
                        className="w-full h-full object-cover bg-gray-200"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x400?text=Image+Load+Failed'; }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <div className="text-center px-4 mt-8">
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 drop-shadow-md">{restaurant.name}</h1>
                            <p className="text-xl text-gray-100 max-w-2xl mx-auto drop-shadow-sm">{restaurant.description}</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900">
                    <div>
                        <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
                            {restaurant.address} {restaurant.pinCode && `- ${restaurant.pinCode}`}
                        </p>
                        <div className="flex gap-2">
                            {restaurant.categories.map((cat, i) => (
                                <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full font-medium">{cat}</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-xl mb-1">
                            <Star className="w-6 h-6 mr-2 fill-current" />
                            <span className="text-2xl font-bold">{restaurant.rating.toFixed(1)}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{restaurant.numReviews} Reviews</p>
                    </div>
                </div>
            </div>

            {/* Google Map Embedded Location */}
            <div className="mb-12 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Location Map</h2>
                </div>
                <div className="w-full h-72">
                    <iframe
                        title="Google Map Location"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(restaurant.address + ' ' + (restaurant.pinCode || ''))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        allowFullScreen
                        className="bg-gray-200 dark:bg-gray-800"
                    ></iframe>
                </div>
            </div>

            {/* Menu List */}
            <div className="flex justify-between items-center mb-8 border-b dark:border-gray-800 pb-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Menu Items</h2>
                {isOwnerOrAdmin && (
                    <button
                        onClick={() => setIsMenuModalOpen(true)}
                        className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-lg font-bold hover:bg-orange-200 dark:hover:bg-orange-900/50 transition"
                    >
                        + Add Menu Item
                    </button>
                )}
            </div>

            {menus.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No menu items have been added to this restaurant yet.</p>
                    {isOwnerOrAdmin && (
                        <button
                            onClick={() => setIsMenuModalOpen(true)}
                            className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700 transition"
                        >
                            + Add Menu Item Now
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {menus.map((item) => (
                        <div key={item._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-6 hover:shadow-md transition">
                            <div className="w-32 h-32 flex-shrink-0">
                                <img
                                    src={item.imageUrl || 'https://placehold.co/400x400?text=No+Image'}
                                    alt={item.name}
                                    className="w-full h-full object-cover rounded-xl bg-gray-100"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400?text=Load+Failed'; }}
                                />
                            </div>
                            <div className="flex-grow flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.name}</h3>
                                        <span className={`w-4 h-4 rounded-sm border-2 ${item.isVeg ? 'border-green-600 bg-green-100 dark:bg-green-900/30' : 'border-red-600 bg-red-100 dark:bg-red-900/30'} flex items-center justify-center`}>
                                            <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{item.description}</p>
                                    <p className="font-extrabold text-lg text-gray-900 dark:text-white">₹{item.price}</p>
                                </div>
                                <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
                                    {isOwnerOrAdmin && (
                                        <button
                                            onClick={() => handleDeleteMenu(item._id)}
                                            className="px-4 py-2 rounded-lg font-bold flex items-center justify-center bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition"
                                            title="Delete Menu Item"
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                                        </button>
                                    )}
                                    <button
                                        onClick={() => addToCart({
                                            menuItem: item._id,
                                            name: item.name,
                                            price: item.price,
                                            restaurantId: restaurant._id,
                                            restaurantName: restaurant.name
                                        }, 1)}
                                        disabled={!item.isAvailable}
                                        className={`px-6 py-2 rounded-lg font-bold flex items-center justify-center ${item.isAvailable ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-600 hover:text-white transition' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}
                                    >
                                        {item.isAvailable ? <><Plus className="w-4 h-4 mr-1" /> Add to Cart</> : 'Unavailable'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Menu Modal Embedded */}
            {isMenuModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setIsMenuModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Add Menu Item</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Adding to: <span className="font-bold text-gray-800 dark:text-gray-200">{restaurant.name}</span></p>

                        <form onSubmit={handleCreateMenu} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Food Image</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 border file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-100 dark:hover:file:bg-gray-600" />
                                {uploadingImage && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Uploading locally...</p>}
                                {menuForm.imageUrl && <p className="text-sm text-green-500 mt-1">Image uploaded successfully</p>}
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
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rapid Mode: Keep open to add another</span>
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

export default RestaurantDetails;
