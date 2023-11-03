require('dotenv').config();
const SECRET_KEY=process.env.SECRET_KEY;

const jwt = require('jsonwebtoken');

// Middleware pour vérifier et extraire l'ID de l'utilisateur depuis un token JWT
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, SECRET_KEY);
       const userId = decodedToken.userId;

       // Ajout de l'ID de l'utilisateur à l'objet 'req.auth' pour une utilisation ultérieure
       req.auth = {
           userId: userId
       };

       next();
   } catch(error) {
       res.status(401).json({ error });
   }
};