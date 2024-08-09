import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Button, Card, Container, Grid } from "@mui/material";
import Alert from "@mui/material/Alert";
import { ChangeEvent, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Loader from "../components/loader";
import _ from "lodash";

export default function Login() {
  const [disabled, setDisabled] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!_.isEmpty(userInput) && !_.isEmpty(passwordInput)) {
      setDisabled(false);
      return;
    }
  });

  function handleUserChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setUserInput(event.target.value);
  }

  function handlePasswordChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setPasswordInput(event.target.value);
  }

  async function handleSubmit(event: any) {
    try {
      event.preventDefault();
      setAuthError(false);
      setLoading(true);
      const data = { user: userInput, password: passwordInput };

      const authRequest = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (authRequest.status == 200) {
        router.push("/");
      } else {
        setAuthError(true);
      }
      setLoading(false);
    } catch (error: unknown) {
      reportError(error as Error);
    }
  }

  return (
    <>
      <Grid>
        <Grid item xs={12}></Grid>
        <Grid
          item
          xs={8}
          md={6}
          mt={10}
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          sx={{ mt: 20 }}
        >
          <Typography
            fontSize={{
              md: 30,
              xs: 24,
            }}
            sx={{ textAlign: "center", mt: 8, color: "#163D26" }}
          >
            Iniciar sesión
          </Typography>
          <Card
            sx={{
              width: { xs: "80%", md: "25%" },
              padding: "3%",
            }}
          >
            <Container>
              <Typography
                component={"span"}
                align="center"
                fontSize={{
                  md: 15,
                  xs: 15,
                }}
              >
                <Box>
                  <div>
                    <TextField
                      fullWidth
                      label="Usuario"
                      sx={{ backgroundColor: "#ffffff" }}
                      size="small"
                      name="email"
                      type="email"
                      onChange={(e) => handleUserChange(e)}
                    />
                  </div>
                  <div>
                    <TextField
                      fullWidth
                      label="Contraseña"
                      sx={{ backgroundColor: "#ffffff", mt: 3 }}
                      size="small"
                      name="email"
                      type="email"
                      onChange={(e) => handlePasswordChange(e)}
                    />
                  </div>
                  <Button
                    disabled={disabled}
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    fullWidth
                    sx={{ mt: 4, color: "#EDEDED" }}
                  >
                    Enviar
                  </Button>
                  {loading && <Loader />}
                  {authError && (
                    <>
                      <Alert severity="error" sx={{ mt: 4 }}>
                        Usuario o contraseña incorrectos
                      </Alert>
                    </>
                  )}
                  {error && (
                    <>
                      <Alert severity="error" sx={{ mt: 4 }}>
                        Ocurrió un error, vuelva a intentarlo
                      </Alert>
                    </>
                  )}
                </Box>
              </Typography>
            </Container>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
