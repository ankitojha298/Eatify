import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isOwner, setIsOwner] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        let result;
        if (isLogin) {
            result = await login(email, password);
        } else {
            const role = isOwner ? 'owner' : 'user';
            result = await register(name, email, password, role);
        }

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        {isLogin ? 'Welcome back to Eatify' : 'Create your account'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {isLogin ? 'Sign in to order your favorite food' : 'Join us for the best local food delivery'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-500 p-3 rounded-lg mb-4 text-sm font-medium border border-red-100 dark:border-red-800">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 transition"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    )}

                    {!isLogin && (
                        <div className="flex items-center">
                            <input
                                id="isOwner"
                                type="checkbox"
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                                checked={isOwner}
                                onChange={(e) => setIsOwner(e.target.checked)}
                            />
                            <label htmlFor="isOwner" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Register as a Restaurant Owner
                            </label>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                        <input
                            type="email"
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            type="password"
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-bold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition"
                    >
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300"
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
