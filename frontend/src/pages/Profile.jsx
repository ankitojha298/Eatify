import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { User, Mail, ShieldCheck, Calendar, Package, Activity, Edit3, Save, X } from 'lucide-react';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        dob: '',
        country: '',
        state: '',
        district: '',
        policeStation: '',
        landmark: '',
        pinCode: ''
    });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchProfileAndOrders = async () => {
            try {
                const [profileRes, ordersRes] = await Promise.all([
                    api.get('/users/profile'),
                    api.get('/orders/myorders')
                ]);
                setProfile(profileRes.data);
                setEditFormData({
                    name: profileRes.data.name || '',
                    dob: profileRes.data.dob || '',
                    country: profileRes.data.country || '',
                    state: profileRes.data.state || '',
                    district: profileRes.data.district || '',
                    policeStation: profileRes.data.policeStation || '',
                    landmark: profileRes.data.landmark || '',
                    pinCode: profileRes.data.pinCode || ''
                });
                setOrders(ordersRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch profile", error);
                setLoading(false);
            }
        };
        fetchProfileAndOrders();
    }, [user, navigate]);

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        const result = await updateProfile(editFormData);
        if (result.success) {
            setProfile({ ...profile, ...editFormData });
            setIsEditing(false);
        } else {
            alert(result.error);
        }
        setUpdating(false);
    };

    if (loading) {
        return <div className="min-h-[60vh] flex items-center justify-center animate-pulse text-xl text-gray-500 font-semibold">Loading Profile...</div>;
    }

    if (!profile) {
        return <div className="text-center py-20 text-red-500">Failed to load profile data</div>;
    }

    return (
        <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Profile Details Sidebar */}
                <div className="lg:col-span-1 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-8 text-center relative overflow-hidden h-fit">
                    <div className="absolute top-0 left-0 w-full h-32 bg-orange-500"></div>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white transition backdrop-blur-md"
                        title={isEditing ? "Cancel Editing" : "Edit Profile"}
                    >
                        {isEditing ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                    </button>

                    <div className="relative z-10">
                        <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full mx-auto p-2 shadow-lg mb-6 mt-12 flex items-center justify-center">
                            <div className="w-full h-full bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 text-5xl font-bold">
                                {profile.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1 truncate">{profile.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-8">Food Explorer</p>

                        <div className="space-y-3 text-left">
                            <div className="flex items-center text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent dark:border-gray-700">
                                <Mail className="w-5 h-5 mr-3 text-orange-500 flex-shrink-0" />
                                <div className="overflow-hidden">
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">Email</p>
                                    <p className="font-semibold text-sm truncate">{profile.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent dark:border-gray-700">
                                <ShieldCheck className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">Account Role</p>
                                    <p className="font-semibold text-sm capitalize">{profile.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent dark:border-gray-700">
                                <Activity className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">Total Orders</p>
                                    <p className="font-semibold text-sm">{orders.length} placed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dynamic Content Area (Edit Form OR Order History) */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">

                        {isEditing ? (
                            // EDIT PROFILE FORM
                            <div>
                                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center border-b dark:border-gray-800 pb-4">
                                    <Edit3 className="mr-3 text-orange-600" /> Edit Your Details
                                </h3>
                                <form onSubmit={handleUpdateSubmit} className="space-y-6">

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                            <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                                            <input type="date" name="dob" value={editFormData.dob} onChange={handleEditChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-gray-700 dark:text-white dark:bg-gray-800" />
                                        </div>
                                    </div>

                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white pt-4 border-t dark:border-gray-800">Address Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Country</label>
                                            <input type="text" name="country" placeholder="e.g. India" value={editFormData.country} onChange={handleEditChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">State</label>
                                            <input type="text" name="state" placeholder="e.g. Maharashtra" value={editFormData.state} onChange={handleEditChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">District</label>
                                            <input type="text" name="district" placeholder="e.g. Mumbai" value={editFormData.district} onChange={handleEditChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Police Station</label>
                                            <input type="text" name="policeStation" placeholder="Nearby police station" value={editFormData.policeStation} onChange={handleEditChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Pin Code</label>
                                            <input type="text" name="pinCode" placeholder="e.g. 110001" value={editFormData.pinCode} onChange={handleEditChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nearest Landmark</label>
                                            <input type="text" name="landmark" placeholder="e.g. Opposite City Mall" value={editFormData.landmark} onChange={handleEditChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:text-white" />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end gap-4">
                                        <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={updating} className="px-6 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition flex items-center disabled:opacity-50">
                                            {updating ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            // VIEW MODES (Additional Details & Orders)
                            <div>
                                {/* Personal & Address Info Read-Only */}
                                <div className="mb-8">
                                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 flex items-center justify-between border-b dark:border-gray-800 pb-4">
                                        <span>Personal Details</span>
                                        <button onClick={() => setIsEditing(true)} className="text-sm font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg flex items-center transition">
                                            <Edit3 className="w-4 h-4 mr-1" /> Edit
                                        </button>
                                    </h3>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"><span className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">DOB</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{profile.dob || 'Not provided'}</span></div>
                                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"><span className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Country</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{profile.country || 'Not provided'}</span></div>
                                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"><span className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">State</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{profile.state || 'Not provided'}</span></div>
                                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"><span className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">District</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{profile.district || 'Not provided'}</span></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"><span className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Police Station</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{profile.policeStation || 'Not provided'}</span></div>
                                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"><span className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Pin Code</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{profile.pinCode || 'Not provided'}</span></div>
                                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"><span className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Landmark</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{profile.landmark || 'Not provided'}</span></div>
                                    </div>
                                </div>

                                {/* Orders */}
                                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center border-b dark:border-gray-800 pb-4">
                                    <Package className="mr-3 text-orange-600" /> My Order History
                                </h3>

                                {orders.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                        <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">You haven't placed any orders yet.</p>
                                        <button onClick={() => navigate('/')} className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition">
                                            Grap a Bite
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {orders.map((order) => (
                                            <div key={order._id} className="border border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:shadow-md transition bg-gray-50 dark:bg-gray-800/50">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 dark:border-gray-700 mb-4 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1">Order ID</p>
                                                        <p className="font-mono text-sm font-semibold text-gray-700 dark:text-gray-300">{order._id}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide
                                                ${order.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                                                                order.status === 'Preparing' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 mb-6">
                                                    {order.orderItems.map((item, index) => (
                                                        <div key={index} className="flex justify-between items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            <div className="flex items-center">
                                                                <span className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs mr-3 dark:text-gray-200">{item.quantity}x</span>
                                                                {item.name}
                                                            </div>
                                                            <span>₹{item.price * item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                                    <span className="font-bold text-gray-500 dark:text-gray-400">Total Amount</span>
                                                    <span className="text-xl font-extrabold text-gray-900 dark:text-white">₹{order.totalAmount}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
