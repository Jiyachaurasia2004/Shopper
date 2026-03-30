import React from 'react'
import "./Footer.css"
// import { Link } from 'react-router-dom';
import footer_logo from "../Assets/logo_big.png"
import intagram_icon from "../Assets/instagram_icon.png"
import pintester_icon from "../Assets/pintester_icon.png"
import whatsapp_icon from "../Assets/whatsapp_icon.png"

const Footer = () => {
  return (
    <div className='Footer'>
      <div className='footer-logo'>
        <img src={footer_logo} alt='' />
        <p>SHOPPER</p>
      </div>
      <ul className='footer-links'>
        <li><a href="#Hero">Company</a></li>
        <li><a href="#product">Product</a></li>
        <li><a href="#offices">Offices</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <div className='footer-social-icon'>
        <div className='footer-icon-container'>
          <img src={intagram_icon} alt='' />
        </div>
        <div className='footer-icon-container'>
          <img src={pintester_icon} alt='' />
        </div>
        <div className='footer-icon-container'>
          <img src={whatsapp_icon} alt='' />
        </div>
      </div>
      <div className='footer-copyright'>
        <hr />
        <p>Copright @ 2026 - All Right Reserved.</p>
      </div>
    </div>
  )
}

export default Footer
