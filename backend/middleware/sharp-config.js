const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Middleware pour redimensionner l'image téléchargée
const resizeImage = (req, res, next) => {
  // Vérifie si un fichier a été téléchargé
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;
  const fileName = req.file.filename;
  const outputFilePath = path.join('images', `${fileName}`);

  // Sharp pour redimensionner l'image
  sharp(filePath)
    .resize({
      fit: sharp.fit.contain, 
      width: 400 
    })
    .toFile(outputFilePath)
    .then(() => {
      // Supprime le fichier d'origine
      fs.unlink(filePath, () => {
        req.file.path = outputFilePath;
        next();
      });
    })
    .catch(err => {
      console.log(err);
      return next();
    });
};

module.exports = { resizeImage };



