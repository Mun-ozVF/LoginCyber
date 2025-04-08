const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

router.post('/login', [
  body('username').trim().notEmpty().escape(),
  body('password').notEmpty()
], async (req, res) => {
  console.log('🟢 Se recibió solicitud POST a /login');
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, password } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).send('Usuario no encontrado');

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send('Contraseña incorrecta');

    req.session.userId = user.id;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});

router.post('/register', [
  body('username').trim().notEmpty().escape(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  console.log('🟢 Se recibió solicitud POST a /register');
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, password } = req.body;

  try {
    const [existing] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) return res.status(409).send('Ese usuario ya existe');

    const hash = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);

    res.send('Registro exitoso. Ahora puedes <a href="/login.html">iniciar sesión</a>.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

module.exports = router;