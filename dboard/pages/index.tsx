import Grid from "@mui/material/Grid";
import Item from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import DrawerMenu from "../components/drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { sharedGetServerSideProps } from "@/lib/sharedGetServerSideProps";
import DataPageSet from "@/lib/domain/dataPageSet"

const drawerWidth = 250;

export const getServerSideProps = sharedGetServerSideProps;

export default function Home({ pageSet } : { pageSet: DataPageSet}) {
  return (
    <>
      <DrawerMenu pageSet={pageSet} />
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
          {pageSet.pages.map((pageConfig, i) => (
            <Grid item xs={12} md={4} mt={{ xs: 5 }}>
              <Item
                style={{
                  textAlign: "center",
                  justifyContent: "center",
                }}
              >
                <div>
                  <Image
                    src={`/${pageConfig.icon ?? "short-term.png"}`}
                    alt={pageConfig.id}
                    width={pageConfig.iconWidth ?? 120}
                    height={pageConfig.iconHeight ?? 75}
                  ></Image>
                  <Typography align="center" sx={{ mt: 2 }}>
                    <Button
                      id={pageConfig.id}
                      href={`/${pageConfig.pageType}?pageset=${pageSet.id}&page=${i}`}
                      variant="contained"
                      size="large"
                    >
                      {pageConfig.title ?? ""}
                    </Button>
                  </Typography>
                </div>
              </Item>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}
