const multer = require('multer');

// Toujours en mémoire : l'image est convertie en base64 et stockée dans MongoDB.
// (Le disque de Render est éphémère, donc pas de diskStorage.)
const storage = multer.memoryStorage();

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Format d'image non supporté (jpg, png, webp, gif)"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
});

// Transforme les erreurs multer en réponse 400 lisible (au lieu d'un 500)
const uploadImage = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (!err) return next();
    console.error('Erreur upload:', err);
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? "L'image ne doit pas dépasser 5 Mo"
        : err.message || "Erreur lors de l'envoi de l'image";
    return res.status(400).json({ success: false, message });
  });
};

module.exports = uploadImage; // ← la factory