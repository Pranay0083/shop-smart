import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const RelatedProducts = ({categories, currentProductId}) => {

    const { products } = useContext(ShopContext);
    const [related,setRelated] = useState([]);

    useEffect(()=>{

        if (products.length > 0 && categories) {
            
            const categoryNames = categories.map(c => c.name);

            let productsCopy = products.filter((item) => {
                // Exclude current product
                if (item._id === currentProductId) return false;
                // Match any shared category
                const itemCategoryNames = (item.categories || []).map(c => c.name);
                return categoryNames.some(cat => itemCategoryNames.includes(cat));
            });

            setRelated(productsCopy.slice(0,5));
        }
        
    },[products, categories, currentProductId])

  return (
    <div className='my-24'>
      <div className=' text-center text-3xl py-2'>
        <Title text1={'RELATED'} text2={"PRODUCTS"} />
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {related.map((item,index)=>(
            <ProductItem key={index} id={item._id} name={item.name} price={item.price} image={item.image}/>
        ))}
      </div>
    </div>
  )
}

export default RelatedProducts
