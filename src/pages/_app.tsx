import { GoogleOAuthProvider } from '@react-oauth/google'; 
import '../styles/globals.css';
import { CartProvider } from '@/context/CartContext';
import type { AppProps } from 'next/app';


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <GoogleOAuthProvider clientId="19606759169-ji6emksanp398buiodeuu477fum0li4u.apps.googleusercontent.com">
        <Component {...pageProps} />
      </GoogleOAuthProvider>
    </CartProvider>
  );
}

export default MyApp;