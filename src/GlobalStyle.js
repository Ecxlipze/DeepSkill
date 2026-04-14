import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  @font-face {
    font-family: 'Asimovian';
    src: url('./assets/fonts/Asimovian/Asimovian-Regular.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    cursor: none !important;
  }

  html {
    scroll-behavior: smooth;
    overflow-x: hidden;
    cursor: none !important;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
    background-color: #000000;
    color: #ffffff;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    position: relative;
    width: 100%;
    cursor: none !important;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    cursor: none !important;
    border: none;
    outline: none;
    background: none;
  }

  ul {
    list-style: none;
  }

  /* Custom Scrollbar - Hidden but functional */
  ::-webkit-scrollbar {
    display: none;
    width: 0px;
    background: transparent;
  }

  /* For Firefox */
  html {
    scrollbar-width: none;
  }
`;

export default GlobalStyle;
