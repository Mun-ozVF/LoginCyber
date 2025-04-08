const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'views')));

app.use(session({
  secret: 'secreto-super-seguro',
  resave: false,
  saveUninitialized: true
}));

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  if (req.session.userId) {
    res.send(`<h2>Bienvenido!</h2><a href="/auth/logout">Cerrar sesión</a>`);
  } else {
    res.redirect('/login.html');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});