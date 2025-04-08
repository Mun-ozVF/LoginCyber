// crearUsuario.js
const bcrypt = require('bcrypt');
const db = require('./db');

async function crearUsuario() {
  const username = 'admin'; // Cambia esto si quieres
  const password = 'admin123'; // Contraseña que será cifrada

  try {
    const hash = await bcrypt.hash(password, 10);

    await db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);

    console.log(`Usuario '${username}' creado con éxito`);
    process.exit(); // Finaliza el script
  } catch (err) {
    console.error('Error al crear el usuario:', err.message);
    process.exit(1);
  }
}

crearUsuario();
