import React, {useContext} from 'react';
import { ShopContext } from '../ShopContex';
import { useParams } from 'react-router-dom';
import Breadcrum from '../Breadcrum';
import ProductDisplay from '../ProductDisplay/ProductDisplay';
import DescriptionBox from '../DescriptionBox/DescriptionBox';
import RealtedProducts from '../RealtedProducts/RealtedProducts';

const Product = () => {
  const {all_product}= useContext(ShopContext);
  const {productId} = useParams();
  const product = all_product.find((e)=> e.id === Number(productId));
  return (
    <div>
      <Breadcrum product={product}/>
      <ProductDisplay product={product}/>
      <DescriptionBox/>
      <RealtedProducts/>
    </div>
  )
}

export default Product
