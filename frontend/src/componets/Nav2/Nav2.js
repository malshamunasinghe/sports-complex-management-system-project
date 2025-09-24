import React from 'react'
import './Nav2.css';
import { Link } from "react-router-dom";




function Nav2() {
  return (
  <header className="header">
  <div className="logo">Sport<span>.LK</span></div>
  <div className="nav-container">
    <ul className="nav-list1">
      <li><Link to="/home">Home</Link></li>
      <li><Link to="/">Facility</Link></li>
      <li><Link to="/">Booking</Link></li>
      <li><Link to="/">Event</Link></li>
      <li><Link to="/payment">Payment</Link></li>
    </ul>
  </div>
    <div className='box'>
         <form1>
            <input type='text' name='' placeholder='Search Here.....'/>
            <input type='submit' name='' value='Search'/>
         </form1>
    </div>
</header>

  );
}


export default Nav2


