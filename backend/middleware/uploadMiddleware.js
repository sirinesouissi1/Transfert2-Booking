// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const isProd = process.env.NODE_ENV === 'production';

// ✅ Dossier images : utilisé seulement en local (développement)
const uploadDir = path.join(__dirname, '..', 'images');
if (!isProd) {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Dossier images créé :', uploadDir);
  } else {
    console.log('📁 Dossier images existant :', uploadDir);
  }
}

// Stockage sur disque (local uniquement)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    console.log('💾 Nom du fichier généré :', filename);
    cb(null, filename);
  },
});

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  console.error('❌ Fichier refusé : type non autorisé');
  cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'));
};

const upload = multer({
  // Production (Render) : en mémoire, l'image sera enregistrée dans MongoDB
  // Local : sur le disque, comme avant
  storage: isProd ? multer.memoryStorage() : diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
  fileFilter,
});

module.exports = upload;