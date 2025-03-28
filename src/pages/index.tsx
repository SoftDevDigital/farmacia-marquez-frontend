import { FC } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import PromoBanner from '../components/PromoBanner';

const Home: FC = () => {
  return (
    <div>
      <Header />
      <PromoBanner />
      <div className="products-container">
        <ProductCard />
        <ProductCard />
      
      </div>
      <Footer />
    </div>
  );
};

export default Home;