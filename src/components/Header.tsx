import { FC } from 'react';

const Header: FC = () => {
  return (
    <header>
      <nav>
        <ul>
          <li><a href="/">Inicio</a></li>
          <li><a href="/productos">Productos</a></li>
          <li><a href="/contacto">Contacto</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
