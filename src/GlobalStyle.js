import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Asimovian';
    src: url('/fonts/Asimovian-Regular.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
    overflow-x: hidden;
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
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    border: none;
    outline: none;
    background: none;
  }

  a, button, input, textarea, select, [role="button"] {
    cursor: pointer;
  }

  input, textarea, select {
    cursor: text;
  }

  :focus-visible {
    outline: 3px solid #ffffff;
    outline-offset: 3px;
  }

  @media (pointer: fine) and (prefers-reduced-motion: no-preference) {
    *, *::before, *::after, html, body {
      cursor: none !important;
    }

    a, button, input, textarea, select, [role="button"], [class*="Button"] {
      cursor: none !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }

    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
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
