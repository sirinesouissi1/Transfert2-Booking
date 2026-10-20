const multer = require('multer');
const path = require('path');
const fs = require('fs');

// En production : memoryStorage (l'image est stockée en base64 dans Mongo)
// En local       : diskStorage (fichier dans backend/images)
const isProduction = process.env.NODE_ENV === 'production';

let storage;

if (isProduction) {
  storage = multer.memoryStorage();
} else {
  const imagesDir = path.join(__dirname, '..', 'images');
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, imagesDir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
    },
  });
}

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ok =
    allowed.test(path.extname(file.originalname).toLowerCase()) &&
    allowed.test(file.mimetype);
  if (ok) cb(null, true);
  else cb(new Error('Format d\'image non supporté (jpg, png, webp, gif)'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
});

module.exports = upload;