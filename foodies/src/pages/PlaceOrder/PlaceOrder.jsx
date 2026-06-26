import React, {useContext, useState} from "react";
import './PlaceOrder.css';
import {assets} from "../../assets/assets.js";
import {StoreContext} from "../../context/StoreContext.jsx";
import {calculateCartTotals} from "../../util/cartUtils.js";
import axios from "axios";
import {toast} from "react-toastify";
import {RAZORPAY_KEY} from '../../util/contants.js';
import {useNavigate} from "react-router-dom";
//import Razorpay from "razorpay";


const PlaceOrder = () => {
    const {foodList, quantities, setQuantities, token} = useContext(StoreContext);
    const navigate = useNavigate();

    const [data, setData] = useState({
       firstName: '',
       lastName: '',
       email: '',
       phoneNumber: '',
       address: '',
       state: '',
       district: '',
       zip: ''
    });

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({...data, [name]: value}));
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        const orderData = {
            userAddress: `${data.firstName} ${data.lastName}, ${data.address}, ${data.state}, ${data.district}, ${data.zip}`,
            phoneNumber: data.phoneNumber,
            email: data.email,
            orderedItems: cartItems.map(item => ({
                foodId: item.id,
                quantity: quantities[item.id],
                price: item.price * quantities[item.id],
                category: item.category,
                imageUrl: item.imageUrl,
                description: item.description,
                name: item.name
            })),
            amount: total.toFixed(2),
            orderStatus: "Preparing"
        };

        try {
            const response = await axios.post('http://localhost:8080/api/orders/create', orderData, {headers: {'Authorization': `Bearer ${token}`}});
            if(response.status === 201 && response.data.razorpayOrderId){
                //Initiate the payment
                initiateRazorpayPayment(response.data);
            } else {
                toast.error("Unable to place order.Please try again.");
            }
        } catch (error) {
            toast.error("Unable to place order.Please try again.");
        }
    };

    const initiateRazorpayPayment = (data) => {
        const options = {
           key: RAZORPAY_KEY,
            amount: data.amount,
            currency: 'INR',
            name: "Food Land",
            description: "Food order payment",
            order_id: data.razorpayOrderId,
            handler: async function(razorpayResponse) {
               await verifyPayment(razorpayResponse);
        },
        prefill: {
               name: `${data.firstName} ${data.lastName}`,
               email: data.email,
               contact: data.phoneNumber
        },
            theme: {color: "#3399cc"},
            modal: {
               ondismiss: async function() {
                   toast.error("Payment cancelled");
                   await deleteOrder(data.id);
               },
            },
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
    };

    const verifyPayment = async (razorpayResponse) => {
        const paymentData = {
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_signature: razorpayResponse.razorpay_signature
        };

       try {
           const response = await axios.post('http://localhost:8080/api/orders/verify', paymentData,{headers: {'Authorization': `Bearer ${token}`}});
           if (response.status === 200) {
               toast.success("Payment verified.");
               await clearCart();
               navigate('/myorders');
           } else {
               toast.error("Payment failed. Please try again.");
               navigate('/');
           }
       } catch (error) {
           toast.error("Unable to verify payment verification. Please try again.");
       }
       };

    const deleteOrder = async (orderId) => {
        try {
            await axios.delete('http://localhost:8080/api/orders/'+orderId, {headers: {'Authorization': `Bearer ${token}`}});
        } catch (error) {
            toast.error("Something went wrong. Please try again And Contact Support Team.");
        }
    };

    const clearCart = async () => {
        try {
           await axios.delete('http://localhost:8080/api/cart', {headers: {'Authorization': `Bearer ${token}`},});
           setQuantities({});
        } catch (error) {
            toast.error("Error while clearing cart.");
        }
    };

     //cart items
    // const cartItems = foodList.filter((food) => quantities[food.id] > 0);
    const cartItems = foodList.filter(
        (food) => (quantities?.[food.id] || 0) > 0
    );

    const {subtotal, shipping, tax, total} = calculateCartTotals(
        cartItems,
        quantities
    );
    return (
        <div className="container mt-3">
                <main>
                    <div className="py-1 text-center">
                        <img className="d-block mx-auto" src={assets.logo} alt="" width="75" height="75" />
                    </div>
                    <div className="row g-5">
                        <div className="col-md-5 col-lg-4 order-md-last">
                            <h4 className="d-flex justify-content-between align-items-center mb-3"><span
                                className="text-primary">Your cart</span> <span
                                className="badge bg-primary rounded-pill">{cartItems.length}</span></h4>
                            <ul className="list-group mb-3">
                                {cartItems.map((item) => (
                                    <li key={item.id} className="list-group-item d-flex justify-content-between lh-sm">
                                        <div>
                                            <h6 className="my-0">{item.name}</h6>
                                            <small className="text-body-secondary">Qty: {quantities[item.id]}</small>
                                        </div>
                                        <span className="text-body-secondary">&#8377;{item.price * quantities[item.id]}</span>
                                    </li>
                                ))}
                                <li className="list-group-item d-flex justify-content-between ">
                                    <div>
                                        <span>Shipping</span>
                                    </div>
                                    <span className="text-body-secondary">
                                        &#8377;{subtotal === 0 ? 0.0 : shipping.toFixed(2)}
                                    </span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between">
                                    <div>
                                        <span>Tax (10%)</span>
                                    </div>
                                    <span className="text-body-secondary">&#8377;{tax.toFixed(2)}</span>
                                </li>


                                <li className="list-group-item d-flex justify-content-between">
                                    <span>Total (INR)</span>
                                    <strong>&#8377;{total.toFixed(2)}</strong></li>
                            </ul>
                        </div>
                        <div className="col-md-7 col-lg-8" >
                            <h4 className="mb-3">Billing address</h4>
                            <form className="needs-validation" onSubmit={onSubmitHandler}>
                                <div className="row g-3">
                                    <div className="col-sm-6">
                                        <label htmlFor="firstName" className="form-label">First name</label> <input
                                        type="text" className="form-control" id="firstName" placeholder="John"
                                        required
                                        name="firstName"
                                        onChange={onChangeHandler}
                                        value={data.firstName}
                                    />
                                    </div>
                                    <div className="col-sm-6">
                                        <label htmlFor="lastName" className="form-label">Last name</label> <input
                                        type="text" className="form-control" id="lastName" placeholder="Doe"
                                        value={data.lastName}
                                        onChange={onChangeHandler}
                                        name="lastName"
                                        required/>
                                    </div>
                                    <div className="col-12">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <div className="input-group has-validation">
                                            <span className="input-group-text">@</span>
                                            <input type="email" className="form-control" id="email" placeholder="email"
                                                   name="email"
                                                   onChange={onChangeHandler}
                                                   value={data.email}
                                                   required/>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <label htmlFor="phoneNumber" className="form-label">Phone Number</label> <input
                                        type="number" className="form-control" id="phoneNumber" placeholder="XXXXXX0204"
                                        name="phoneNumber"
                                        value={data.phoneNumber}
                                        onChange={onChangeHandler}
                                        required/>
                                    </div>

                                    <div className="col-12">
                                        <label htmlFor="address" className="form-label">Address</label> <input
                                        type="text" className="form-control" id="address" placeholder="1234 Main St"
                                        required
                                        name="address"
                                        value={data.address}
                                        onChange={onChangeHandler}
                                    />
                                    </div>

                                    <div className="col-md-5">
                                        <label htmlFor="state" className="form-label">State</label>
                                        <select className="form-select" id="state" required name="state" onChange={onChangeHandler} value={data.state}>
                                            <option value="">Choose...</option>
                                            <option>UttarPradesh</option>
                                            <option>Maharashtra</option>
                                            <option>Karnataka</option>
                                            <option>Madhya Pradesh</option>
                                            <option>Bihar</option>
                                            <option>Delhi</option>
                                            <option>Punjab</option>
                                            <option>Uttarakhand</option>
                                            <option>Jharkhand</option>
                                            <option>Himachal Pradesh</option>
                                            <option>Arunachal Pradesh</option>
                                            <option>Assam</option>
                                            <option>Goa</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label htmlFor="district" className="form-label">District</label>
                                        <select className="form-select" id="district" required name="district" onChange={onChangeHandler} value={data.district}>
                                            <option>Choose...</option>
                                            <option>Maharajganj</option>
                                        </select>

                                    </div>
                                    <div className="col-md-3">
                                        <label htmlFor="zip" className="form-label">Zip</label>
                                        <input type="number" className="form-control" id="zip" placeholder="273163" required name="zip" onChange={onChangeHandler} value={data.zip} />
                                    </div>
                                </div>
                                <hr className="my-4"/>
                                <button className="w-100 btn btn-primary btn-lg " type="submit" disabled={cartItems.length === 0}
                                        // onClick={() => alert("BUTTON WORKING")}
                                >Continue to checkout
                                </button>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
    );
};

export default PlaceOrder;