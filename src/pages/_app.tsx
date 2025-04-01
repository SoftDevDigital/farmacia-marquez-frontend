import { GoogleOAuthProvider } from '@react-oauth/google'; 
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <GoogleOAuthProvider clientId="19606759169-ji6emksanp398buiodeuu477fum0li4u.apps.googleusercontent.com">
      <Component {...pageProps} />
    </GoogleOAuthProvider>
  )
}

export default MyApp;
