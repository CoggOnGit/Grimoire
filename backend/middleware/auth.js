const jwt = require('jsonwebtoken');

// Middleware pour vérifier et extraire l'ID de l'utilisateur depuis un token JWT
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
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