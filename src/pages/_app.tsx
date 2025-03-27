import { FC } from 'react';
import { AppProps } from 'next/app';
import '../styles/globals.css';  // Importa tus estilos globales aquí si es necesario

const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default MyApp;
