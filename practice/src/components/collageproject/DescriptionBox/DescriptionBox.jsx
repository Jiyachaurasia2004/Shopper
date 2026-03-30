import React, { useState } from 'react';
import './DescriptionBox.css';

const DescriptionBox = () => {

  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className='descriptionbox'>

      {/* Tabs */}
      <div className="descriptionbox-navigator">
        
        <div 
          className={`descriptionbox-nav-box ${activeTab === "description" ? "" : "fade"}`}
          onClick={() => setActiveTab("description")}
        >
          Description
        </div>

        <div 
          className={`descriptionbox-nav-box ${activeTab === "reviews" ? "" : "fade"}`}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews
        </div>

      </div>

      {/* Content */}
      <div className="descriptionbox-description">

        {activeTab === "description" && (
          <p>
            Upgrade your wardrobe with this stylish and comfortable outfit designed for everyday elegance. 
            Crafted from high-quality fabric, this piece offers a perfect blend of durability, breathability, 
            and modern design.

            Whether you're heading to a casual outing, office, or special occasion, this clothing item ensures 
            you look confident and feel comfortable all day long. The fine stitching and premium finish enhance 
            its overall appeal, making it a must-have addition to your collection.

            <br /><br />

            <strong>Key Features:</strong><br />
            • Soft and breathable fabric<br />
            • Trendy and versatile design<br />
            • Perfect fit for all-day comfort<br />
            • Suitable for casual and semi-formal occasions<br />
            • Easy to wash and maintain<br /><br />

            Style it your way and make a lasting impression wherever you go.
          </p>
        )}

        {activeTab === "reviews" && (
          <p>
            ⭐ Customer Reviews <br /><br />

            ⭐⭐⭐⭐⭐ (4.5/5 based on 120+ reviews) <br /><br />

            ✔️ "Amazing quality! The fabric feels premium and very comfortable." <br />
            ✔️ "Perfect fit and exactly as shown in the images. Totally worth it!" <br />
            ✔️ "Stylish design, I received many compliments wearing this." <br />
            ✔️ "Great value for money. Will definitely buy again." <br />
            ✔️ "Fast delivery and excellent product finishing." <br /><br />

            💬 Most customers loved the comfort, fitting, and stylish look of this product.
          </p>
        )}

      </div>
    </div>
  );
}

export default DescriptionBox;