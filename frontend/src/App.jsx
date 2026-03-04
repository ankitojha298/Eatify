import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import RestaurantDetails from './pages/RestaurantDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen flex flex-col font-sans bg-gray-50 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-200">
                <Toaster position="top-right" />
                <Navbar />
                <main className="flex-grow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/restaurant/:id" element={<RestaurantDetails />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/admin/dashboard" element={<Dashboard />} />
                            <Route path="/profile" element={<Profile />} />
                        </Routes>
                    </div>
                </main>
                <footer className="bg-gray-900 text-gray-400 py-8 text-center mt-12">
                    <p>&copy; {new Date().getFullYear()} Eatify. Curating the best local tastes.</p>
                </footer>
            </div>
        </BrowserRouter>
    );
}

export default App;
