import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                let endpoint = '/restaurants';
                if (user && user.role === 'owner') {
                    endpoint = '/restaurants/myrestaurants';
                }
                const { data } = await api.get(endpoint);

                // myrestaurants returns an array directly, whereas /restaurants returns { restaurants: [], ... }
                const fetchedRestaurants = (user && user.role === 'owner') ? data : data.restaurants;

                setRestaurants(fetchedRestaurants || []);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchRestaurants();
    }, [user]);

    return (
        <div className="py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Discover Local Culinary Delights</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">Find the best vegetarian, non-veg, fast food, and desserts near you.</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-4 h-64" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {restaurants.map((restaurant) => (
                        <div key={restaurant._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                            <img
                                src={restaurant.imageUrl}
                                alt={restaurant.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">{restaurant.name}</h3>
                                    <div className="flex items-center bg-green-100 px-2 py-1 rounded-md">
                                        <Star className="w-4 h-4 text-green-700 mr-1 fill-current" />
                                        <span className="text-sm font-semibold text-green-700">{restaurant.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{restaurant.description}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {restaurant.categories.map((cat, index) => (
                                        <span key={index} className="px-3 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium rounded-full">
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                                <Link
                                    to={`/restaurant/${restaurant._id}`}
                                    className="block w-full text-center bg-gray-900 dark:bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-green-700 transition"
                                >
                                    View Menu
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
