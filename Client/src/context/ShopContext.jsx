import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import axios from 'axios'

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {

    // const currency = '$';
    const currency = '₹';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState('');
    const [products, setProducts] = useState([]);
    const [aiResults, setAiResults] = useState(null); // null = no AI search active
    const [aiSearching, setAiSearching] = useState(false);
    const navigate = useNavigate();

    // AI-powered natural language product search (local TF-IDF + rule based, no API key)
    const smartSearch = async (query) => {
        if (!query || !query.trim()) {
            setAiResults(null);
            return;
        }
        setAiSearching(true);
        try {
            const res = await axios.post(backendUrl + "/api/ai/search", { query });
            if (res.data.success) {
                setAiResults(res.data.results.map((p) => p._id));
            } else {
                setAiResults(null);
            }
        } catch (error) {
            console.log(error);
            setAiResults(null);
        } finally {
            setAiSearching(false);
        }
    };

    const updateQuantity = async (id, size, quantity) => {
        const cartData = structuredClone(cartItems);
        cartData[id][size] = quantity;
        setCartItems(cartData);

        if (token) {
            try {
                await axios.post(backendUrl + "/api/cart/update", { quantity, id, size }, { headers: { token } })
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
    }

    const addToCart = async (itemId, size) => {

        let cartData = structuredClone(cartItems);

        if (!size) {
            toast.error("Select Product Size")
            return;
        }

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            }
            else {
                cartData[itemId][size] = 1;
            }
        }
        else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }

        setCartItems(() => (cartData));

        if (token) {
            try {
                await axios.post(backendUrl + "/api/cart/add", { itemId, size }, { headers: { token } })

            } catch (error) {
                console.log(error);
                toast.error(error.message)
            }
        }
    }

    const getCartCount = () => {
        let totalCount = 0;

        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalCount += cartItems[items][item];
                    }
                }
                catch (error) {

                }
            }
        }
        return totalCount;
    }


    const getCartAmount = () => {
        let totalAmount = 0;
        for (let items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            for (let item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalAmount += cartItems[items][item] * itemInfo.price;
                    }
                } catch (error) {

                }
            }

        }


        return totalAmount;

    }

    const getProductsData = async () => {

        try {
            let res = await axios.get(backendUrl + "/api/product/list")

            if (res.data.success) {
                setProducts(res.data.products)
            } else {
                toast.error(res.data.message)
            }
        } catch (e) {
            console.log(e);
            toast.error(e.message)
        }
    }


    const getUserCart = async (token) => {
        try {
            const res = await axios.post(backendUrl + "/api/cart/get", {}, { headers: { token } })
            setCartItems(res.data.cartData);
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }

    useEffect(() => {
        getProductsData();
    }, [])

    useEffect(() => {
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'))
            getUserCart(localStorage.getItem('token'))
        }

    }, [])

    const values = {
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, setCartItems, addToCart, navigate,
        getCartCount, updateQuantity, getCartAmount,
        backendUrl, token, setToken,
        smartSearch, aiResults, aiSearching
    }

    return (
        <ShopContext.Provider value={values}>
            {children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider; 