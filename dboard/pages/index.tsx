import Grid from "@mui/material/Grid";
import Item from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import DrawerMenu from "../components/drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Image from "next/image";

const drawerWidth = 250;

export default function Home() {
  return (
    <>
      <DrawerMenu />
      <Box
        sx={{
          display: "flex",
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          pr: 10,
          pl: 10,
        }}
      >
        <Grid container style={{ alignItems: "center" }}>
          <Grid item xs={12} md={4} mt={{ xs: 5 }}>
            <Item
              style={{
                textAlign: "center",
                justifyContent: "center",
              }}
            >
              <div>
                <Image
                  src="/short-term.png"
                  alt="short-term"
                  width={120}
                  height={75}
                ></Image>
                <Typography align="center" sx={{ mt: 2 }}>
                  <Button
                    id="short-term"
                    href="/shortTerm"
                    variant="contained"
                    size="large"
                  >
                    Pronóstico a Corto Plazo
                  </Button>
                </Typography>
              </div>
            </Item>
          </Grid>
          <Grid item xs={12} md={4} mt={{ xs: 5 }}>
            <Item style={{ textAlign: "center", justifyContent: "center" }}>
              <div>
                <Image
                  src="/long-term.png"
                  alt="long-term"
                  width={225}
                  height={75}
                ></Image>
                <Typography align="center" sx={{ mt: 2 }}>
                  <Button
                    id="long-term"
                    href="/longTerm"
                    variant="contained"
                    size="large"
                  >
                    Pronóstico a Largo Plazo
                  </Button>
                </Typography>
              </div>
            </Item>
          </Grid>
          <Grid item xs={12} md={4} mt={{ xs: 5 }}>
            <Item style={{ textAlign: "center", justifyContent: "center" }}>
              <div>
                <Image
                  src="/meteorological.png"
                  alt="meteorological"
                  width={90}
                  height={75}
                ></Image>
                <Typography align="center" sx={{ mt: 2 }}>
                  <Button
                    id="meteorological"
                    href="/meteorological"
                    variant="contained"
                    size="large"
                  >
                    Pronóstico Meteorológico
                  </Button>
                </Typography>
              </div>
            </Item>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
