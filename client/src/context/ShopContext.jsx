import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = '$';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState([]); // Array of {productId, quantity, id}
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('')
    const navigate = useNavigate();

    // Helper to build auth headers
    const authHeaders = (tkn) => ({
        headers: { Authorization: `Bearer ${tkn || token}` }
    });

    // Normalize a product from the backend shape to the shape the UI expects
    const normalizeProduct = (p) => ({
        ...p,
        _id: p.id,
        image: p.images ? p.images.map(img => img.url) : [],
        categories: p.categories || [],
    });

    const addToCart = async (productId) => {
        if (!token) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post(
                backendUrl + '/api/cart/add',
                { productId, quantity: 1 },
                authHeaders()
            );
            if (response.data.success) {
                setCartItems(response.data.data.items || []);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message);
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const item of cartItems) {
            totalCount += item.quantity;
        }
        return totalCount;
    }

    const updateQuantity = async (productId, quantity) => {
        try {
            const response = await axios.put(
                backendUrl + '/api/cart/update',
                { productId, quantity },
                authHeaders()
            );
            if (response.data.success) {
                setCartItems(response.data.data.items || []);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message);
        }
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const item of cartItems) {
            const product = products.find((p) => p._id === item.productId);
            if (product) {
                totalAmount += product.price * item.quantity;
            }
        }
        return totalAmount;
    }

    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list');
            if (response.data.success) {
                const normalized = response.data.data.map(normalizeProduct);
                setProducts(normalized);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error('Backend not working. Please check server.');
        }
    }

    const getUserCart = async (tkn) => {
        try {
            const response = await axios.get(
                backendUrl + '/api/cart/get',
                authHeaders(tkn)
            );
            if (response.data.success) {
                setCartItems(response.data.data.items || []);
            }
        } catch (error) {
            console.log(error);
            // Don't toast on cart fetch failure (might be empty cart / new user)
        }
    }

    useEffect(() => {
        getProductsData()
    }, [])

    useEffect(() => {
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'))
            getUserCart(localStorage.getItem('token'))
        }
        if (token) {
            getUserCart(token)
        }
    }, [token])

    const value = {
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        setToken, token, authHeaders
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )

}

export default ShopContextProvider;