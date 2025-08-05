import { GoogleOAuthProvider } from '@react-oauth/google'; 
import '../styles/globals.css';
import { CartProvider } from '@/context/CartContext';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
     <>
      <Head>
        <link rel="icon" href="/farmacia.png" type="image/png" />
        <title>Farmacia Marquez City</title>
      </Head>
    <CartProvider>
      <GoogleOAuthProvider clientId="19606759169-ji6emksanp398buiodeuu477fum0li4u.apps.googleusercontent.com">
        <Component {...pageProps} />
      </GoogleOAuthProvider>
    </CartProvider>
    </>
  );
}

export default MyApp;