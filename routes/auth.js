// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

// Login
router.post('/login', [
  body('username').trim().notEmpty().escape(),
  body('password').notEmpty()
], async (req, res) => {
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
    res.send(`Bienvenido, ${user.username}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.send('Sesión cerrada correctamente');
  });
});

module.exports = router;
