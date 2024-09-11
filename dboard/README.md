# Instrucciones para ejecutar usando Dockerfile

Para ejecutar esta aplicación utilizando el Dockerfile en la carpeta dboard, sigue estos pasos:

1. Asegúrate de tener Docker instalado en tu sistema.

2. Abre una terminal y navega hasta la carpeta 'dboard' donde se encuentra el Dockerfile.

3. Construye la imagen Docker con el siguiente comando:

   ```
   docker build -t dboard-app .
   ```

4. Una vez que la imagen se haya construido correctamente, puedes ejecutar el contenedor con:

   ```
   docker run -p 3000:3000 dboard-app
   ```

5. La aplicación ahora debería estar ejecutándose y accesible en `http://localhost:3000`.

Nota: Asegúrate de que el puerto 3000 esté disponible en tu máquina local. Si necesitas usar un puerto diferente, puedes modificar el comando de ejecución, por ejemplo:
