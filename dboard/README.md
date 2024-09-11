# Instrucciones para ejecutar usando Dockerfile


1. Instalar Docker.

2. En una terminal, navegar a la carpeta 'dboard' donde se encuentra el Dockerfile.

3. Construir la imagen Docker con el siguiente comando:

   ```
   docker build -t dboard-app .
   ```

4. Una vez que la imagen se haya construido correctamente, ejecutar el contenedor con el siguiente comando:

   ```
   docker run -p 3000:3000 dboard-app
   ```

5. La aplicación ya debería estar ejecutándose. Puede accederse a ella en `http://localhost:3000`.

Nota: El puerto 3000 tiene que estar disponible en la máquina local. Para usar un puerto diferente, modificar el comando de ejecución.
