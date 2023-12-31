require('dotenv').config();
const SECRET_KEY=process.env.SECRET_KEY;

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

/*** Inscription d'un nouvel utilisateur ***/
exports.signup = (req, res, next) => {
    // Hachage du mot de passe fourni par l'utilisateur
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        // Crée un nouvel utilisateur avec l'email et le mot de passe haché
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' })) 
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };

/***Connexion d'un utilisateur existant ***/
exports.login = (req, res, next) => {
    // Recherche de l'utilisateur par son email
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' }); 
            }
            // Comparaison du mot de passe fourni avec le mot de passe haché dans la base de données
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' }); 
                    }
                    // Création d'un token JWT pour l'utilisateur authentifié
                    res.status(200).json({
                        userId: user._id, 
                        token: jwt.sign(
                            { userId: user._id},
                            SECRET_KEY, // Clé secrète du token 
                            { expiresIn: '24h' } 
                        )
                    });
                })
                .catch(error => res.status(500).json({ error })); 
        })
        .catch(error => res.status(500).json({ error })); 
 };