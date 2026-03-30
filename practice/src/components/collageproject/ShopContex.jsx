import React, { createContext, useEffect, useState } from "react";


export const ShopContext = createContext(null);
const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < 300+ 1; index++) {
        cart[index] = 0;
    }
    return cart;
}

const ShopContextProvider = (props) => {

    const [all_product,setAll_product] = useState([]);
    const [cartItems, setCartItems] = useState(getDefaultCart());
    const [discount, setDiscount] = useState(0);
    const [promoMessage, setPromoMessage] = useState('');

    useEffect(()=>{
        fetch('https://shopper-frontend-1548.onrender.com/allproducts')
        .then((response)=>response.json())
        .then((data)=>setAll_product(data))
        if(localStorage.getItem('auth-token')){
            fetch('https://shopper-frontend-1548.onrender.com/getcart',{
                method:'POST',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:"",
            }).then((response)=>response.json())
            .then((data)=>setCartItems(data));
        }
     },[])

    const addToCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }))
        if(localStorage.getItem('auth-token')){
            fetch('https://shopper-frontend-1548.onrender.com/addtocart',{
                method:'POST',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({"itemId":itemId}),
            })
            .then((response)=>response.json())
            .then((data)=>console.log(data));
        }
    }
    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
        if(localStorage.getItem('auth-token')){
            fetch('https://shopper-frontend-1548.onrender.com/removefromcart',{
                method:'POST',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({"itemId":itemId}),
            })
            .then((response)=>response.json())
            .then((data)=>console.log(data));
        }
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = all_product.find((product) => product.id === Number(item));
                if(itemInfo){
                    totalAmount += itemInfo.new_price * cartItems[item];
                }
            }
        }
        return totalAmount;
    }


    const getTotalCartItems = () =>{
        let totalItem = 0;
        for(const item in cartItems){
            if(cartItems[item]>0)
            {
                totalItem+= cartItems[item];
            }
        }
        return totalItem;
    }

    const applyPromo = (code) => {
        const promoCodes = {
            SAVE10: 10,
            OFF20: 20,
            CASHBACK50: 50,
        };
        if (promoCodes[code]) {
            setDiscount(promoCodes[code]);
            setPromoMessage(`✅ ${promoCodes[code]}% discount applied`);
        } else {
            setDiscount(0);
            setPromoMessage('❌ Invalid promo code');
        }
    };

    const contextValue = {
        getTotalCartAmount,
        getTotalCartItems,
        all_product,
        cartItems,
        addToCart,
        removeFromCart,
        discount,
        promoMessage,
        applyPromo,
    };
    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>

    )
}
export default ShopContextProvider; 
