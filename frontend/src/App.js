import React from "react";
import { Routes, Route } from "react-router-dom";
import Payment from"../src/componets/Payment/Payment";
import UserDetails from "./componets/Payment/userDetails";




function App() {
  return (
    <Routes>
       <Route path="/" element={<Payment />} />
       <Route path="/payment" element={<Payment />} />
        <Route path="/userDetails" element={<UserDetails />} />
     
    </Routes>
  );
}

export default App;
