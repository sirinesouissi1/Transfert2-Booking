const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route non trouvée : ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  console.error('ERREUR:', err);

  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Erreur serveur';

  if (err.name === 'ValidationError') status = 400;
  if (err.name === 'CastError') {
    status = 400;
    message = 'Identifiant invalide';
  }
  if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Requête trop volumineuse';
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };