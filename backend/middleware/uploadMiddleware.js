// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ S'assurer que le dossier images existe
const uploadDir = path.join(__dirname, '..', 'images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Dossier images créé :', uploadDir);
} else {
  console.log('📁 Dossier images existant :', uploadDir);
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📂 Destination upload :', uploadDir);
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
  console.log('🔍 Fichier reçu :', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
  });

  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    console.log('✅ Fichier accepté');
    return cb(null, true);
  } else {
    console.error('❌ Fichier refusé : type non autorisé');
    cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
  fileFilter: fileFilter,
});

module.exports = upload;