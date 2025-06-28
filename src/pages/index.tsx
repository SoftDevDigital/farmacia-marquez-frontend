import { FC } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';


const Home: FC = () => {
  return (
    <div>
      <Header onSearch={() => {}} />
      
      <div className="products-container">
        <ProductCard />
      
      
      </div>
      <Footer />
    </div>
  );
};

export default Home;