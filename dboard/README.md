# Instrucciones para ejecutar usando Dockerfile


1. Instalar Docker.

2. En una terminal, navegar a la carpeta 'dboard' donde se encuentra el Dockerfile.

3. Crear el archivo .env.local con lo siguiente:

   ```
   token = "pass"
   ```
   donde pass es el token provisto para el acceso a la API alerta.ina.gob.ar/a5

   Si desea saltear la pantalla de autenticación (login), agregar:

   ```
   skip_login = "true"
   ```

4. Construir la imagen Docker con el siguiente comando:

   ```
   docker build -t dboard-app .
   ```

5. Una vez que la imagen se haya construido correctamente, ejecutar el contenedor con el siguiente comando:

   ```
   docker run -p 3000:3000 dboard-app
   ```

6. La aplicación ya debería estar ejecutándose. Puede accederse a ella en `http://localhost:3000`.

Nota: El puerto 3000 tiene que estar disponible en la máquina local. Para usar un puerto diferente, modificar el comando de ejecución.

## Uso

1. Cambiar pageset

Introducir el nombre del pageset en la querystring:

http://localhost:3000?pageset=parana_inferior

2. Configurar nuevo pageset

Crear un archivo YAML en la carpeta config/ de acuerdo al esquema descripto en public/schemas/dashboard.schema.yml
