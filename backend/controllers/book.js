const BookThing = require('../models/BookThing');
const fs = require('fs');
const path = require('path');



/* Crée un nouveau livre */
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  const newBook = {
    ...bookObject,
    userId: req.auth.userId,
    averageRating: bookObject.ratings[0].grade
  };

  if (req.file) {
    newBook.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
  }

  const book = new BookThing(newBook);

  book.save()
    .then(() => { 
      res.status(201).json({ message: 'Livre enregistré !' });
    })
    .catch(error => {
      res.status(400).json({ error });
    });
};



/* Modifie un livre existant */
exports.modifyBook = (req, res, next) => {
  // Vérifie si un fichier (image) est joint à la demande
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
 
  delete bookObject._userId;

  BookThing.findOne({_id: req.params.id})
      .then((book) => {
          // Vérifie si l'utilisateur a l'autorisation de modifier ce livre
          if (book.userId != req.auth.userId) {
              res.status(403).json({ message : '403: unauthorized request' });
          } else {
              const filename = book.imageUrl.split('/images/')[1];
              // Supprime l'ancienne image du serveur
              req.file && fs.unlink(`images/${filename}`, (err => {
                      if (err) console.log(err);
                  })
              );
              // Met à jour le livre avec les nouvelles données
              BookThing.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                  .then(() => res.status(200).json({ message: 'Livre modifié !' })) 
                  .catch(error => res.status(400).json({ error })); 
          }
      })
      .catch((error) => {
          res.status(404).json({ error }); 
      });
};



/* Supprime un livre */
exports.deleteBook = (req, res, next) => {
  BookThing.findOne({ _id: req.params.id })
      .then(book => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({ message: 'Vous ne pouvez pas supprimer ce livre' });
          } else {
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, (err) => {
                  BookThing.deleteOne({ _id: req.params.id })
                      .then(() => {
                          res.status(200).json({ message: 'Livre supprimé !' });
                      })
                      .catch(error => {
                          res.status(500).json({ error });
                      });
              });
          }
      })
      .catch(error => {
          res.status(500).json({ error });
      });
};



/* Récupère un livre par son ID */
exports.getOneBook = (req, res, next) => {
    BookThing.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book)) 
        .catch(error => res.status(400).json({ error }));
};



/* Récupère tous les livres */
exports.getAllBooks = (req, res, next) => {
    BookThing.find()
        .then(book => res.status(200).json(book)) 
        .catch(error => res.status(400).json({ error })); 
};



/* Récupère les 3 meilleurs livres  */
exports.getBestBooks = async (req, res, next) => {
    try {
      const books = await BookThing.find()
        .sort({ averageRating: -1 })
        .limit(3); 
      res.status(200).json(books); 
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
};



/* Note un livre */
exports.rateBook = async (req, res, next) => {
    try {
      const book = await BookThing.findOne({ _id: req.params.id });
      const userId = req.body.userId;
      if (book.ratings.some((obj) => obj.userId === userId)) {
        return res.status(403).json({ error: 'Vous ne pouvez pas noter ce livre.' }); 
      }
  
      // Crée un nouvel objet de notation
      const newRatingObject = {
        userId: userId,
        grade: req.body.rating,
      };
  
      // Ajoute la nouvelle notation à la liste des notations du livre
      book.ratings.push(newRatingObject);
  
      // Calcule la nouvelle note moyenne
      const allRatings = book.ratings.map((rating) => rating.grade);
      const sum = allRatings.reduce((total, curr) => total + curr, 0);
      const averageRating = sum / allRatings.length;
      book.averageRating = averageRating.toFixed(1);
  
      await book.save();
  
      res.status(200).json(book); 
    } catch (error) {
      res.status(500).json({ error: 'Une erreur est survenue lors de la notation.' }); // Réponse en cas d'erreur
    }
};