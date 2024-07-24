import "../styles/globals.css";
import type { AppProps } from "next/app";
import { createTheme, ThemeProvider } from "@mui/material";
import Head from "next/head";

const theme = createTheme({
  palette: {
    primary: {
      main: "#01599b",
    },
    secondary: {
      main: "#8ad3e0",
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Tablero de Monitoreo</title>
      </Head>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
