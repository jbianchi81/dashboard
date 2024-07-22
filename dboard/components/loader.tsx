import { Box, CircularProgress } from "@mui/material";

export default function Loader() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        margin: "auto",
        mt: 4,
      }}
    >
      <CircularProgress size={60} />
    </Box>
  );
}
