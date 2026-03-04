import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const items = localStorage.getItem('cartItems');
        if (items) {
            const parsedItems = JSON.parse(items);
            // Check if items are from an older session without a restaurantId
            const hasInvalidItems = parsedItems.some(item => !item.restaurantId);
            if (hasInvalidItems) {
                console.warn('Legacy cart items found without restaurantId. Clearing cart to prevent orphan orders.');
                localStorage.removeItem('cartItems');
                setCartItems([]);
            } else {
                setCartItems(parsedItems);
            }
        }
    }, []);

    const addToCart = (item, qty) => {
        const existItem = cartItems.find((x) => x.menuItem === item.menuItem);
        let updatedCart;
        if (existItem) {
            updatedCart = cartItems.map((x) =>
                x.menuItem === existItem.menuItem ? { ...x, quantity: x.quantity + qty } : x
            );
        } else {
            updatedCart = [...cartItems, { ...item, quantity: qty }];
        }
        setCartItems(updatedCart);
        localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    };

    const removeFromCart = (id) => {
        const updatedCart = cartItems.filter((x) => x.menuItem !== id);
        setCartItems(updatedCart);
        localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cartItems');
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
