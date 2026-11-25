import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Check, ArrowRight, User, Phone, Search, ChevronDown, MapPin, Calendar
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { excursionAPI } from '../services/api';
import { excursionBookingAPI } from '../services/api';
import { getImageUrl } from '../utils/imageUrl';
import { useLanguage } from '../context/LanguageContext'; // Assurez-vous du bon chemin

// --- DICTIONNAIRE DE TRADUCTION ---
const bookingTranslations = {
  en: {
    loading: "Loading...",
    bookTitle: "Book your",
    bookHighlight: "excursion",
    step1Title: "Booking Options",
    step2Title: "Personal Information",
    groupSizeLabel: "Group Size",
    departureLabel: "Departure Point",
    totalPrice: "Total Price",
    perGroup: "PER GROUP",
    continueBtn: "Continue",
    backBtn: "← Back",
    confirmBtn: "Confirm booking",
    sendingBtn: "Sending...",
    summaryTitle: "Summary",
    onRequest: "On request",
    departurePoint: "Departure Point",
    groupSize: "Group Size",
    persons: "persons",
    preferredDate: "Preferred Date",
    notDefined: "Not defined",
    
    // Group sizes
    upTo4: "Up to 4 Passengers",
    upTo6: "Up to 6 Passengers",
    upTo8: "Up to 8 Passengers",
    max: "MAX",

    // Form fields
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    phone: "Phone Number",
    useWhatsapp: "Use WhatsApp",
    dateLabel: "Preferred Date",
    customItinerary: "I want a custom itinerary",
    commentsLabel: "Additional Comments",
    commentsPlaceholder: "Ex: allergies, preferences...",
    phonePlaceholder: "00 00 00 00",
    firstNamePlaceholder: "Enter your first name",
    lastNamePlaceholder: "Enter your last name",
    emailPlaceholder: "Enter your email",
    
    // Country selector
    searchCountry: "Search for a country...",
    noCountry: "No country found",

    // Excursion names translation
    names: {
      "Excursion d'une demi-journée berbère à Zaghouan": "Half-day Berber excursion to Zaghouan",
      "Demi-Journée au Musée du Bardo": "Half-day at the Bardo Museum",
      "Excursion Sahel : Monastir, Sousse et Port El Kantaoui": "Sahel Excursion: Monastir, Sousse and Port El Kantaoui",
      "Excursion d'une demi-journée à Sidi Bou Saïd": "Half-day excursion to Sidi Bou Said",
      "Excursion Archéologique à Dougga et Bulla Regia": "Archaeological Excursion to Dougga and Bulla Regia",
      "Excursion d'une journée à Tunis Carthage | Sidi Bou Saïd": "Full-day excursion to Tunis Carthage | Sidi Bou Said",
      "Excursion à la journée à Kairouan et El Jem": "Full-day excursion to Kairouan and El Jem",
      "Demi-journée au Parc Friguia": "Half-day at Friguia Park"
    }
  },
  fr: {
    loading: "Chargement...",
    bookTitle: "Réservez votre",
    bookHighlight: "excursion",
    step1Title: "Options de réservation",
    step2Title: "Informations Personnelles",
    groupSizeLabel: "Taille du Groupe",
    departureLabel: "Point de Départ",
    totalPrice: "Prix total",
    perGroup: "PAR GROUPE",
    continueBtn: "Continuer",
    backBtn: "← Retour",
    confirmBtn: "Confirmer la réservation",
    sendingBtn: "Envoi...",
    summaryTitle: "Récapitulatif",
    onRequest: "Sur demande",
    departurePoint: "Point de départ",
    groupSize: "Taille du groupe",
    persons: "personnes",
    preferredDate: "Date préférée",
    notDefined: "Non définie",
    
    upTo4: "Jusqu'à 4 Passagers",
    upTo6: "Jusqu'à 6 Passagers",
    upTo8: "Jusqu'à 8 Passagers",
    max: "MAX",

    firstName: "Prénom",
    lastName: "Nom",
    email: "Adresse Email",
    phone: "Numéro de téléphone",
    useWhatsapp: "Utiliser WhatsApp",
    dateLabel: "Date Préférée",
    customItinerary: "Je veux un itinéraire personnalisé",
    commentsLabel: "Commentaires Supplémentaires",
    commentsPlaceholder: "Ex: allergies, préférences...",
    phonePlaceholder: "00 00 00 00",
    firstNamePlaceholder: "Entrez votre prénom",
    lastNamePlaceholder: "Entrez votre nom",
    emailPlaceholder: "Entrez votre email",
    
    searchCountry: "Rechercher un pays...",
    noCountry: "Aucun pays trouvé",
    
    names: {}
  }
};

// Liste complète des pays (copiée depuis BookingDetails)
// Liste complète des pays (copiée depuis BookingDetails)
const ALL_COUNTRIES = [
    { name: "Afghanistan", code: "+93", flag: "🇦🇫" },
    { name: "Afrique du Sud", code: "+27", flag: "🇿🇦" },
    { name: "Îles Åland", code: "+358", flag: "AX" },
    { name: "Albanie", code: "+355", flag: "🇦🇱" },
    { name: "Algérie", code: "+213", flag: "🇩🇿" },
    { name: "Allemagne", code: "+49", flag: "🇩🇪" },
    { name: "Andorre", code: "+376", flag: "🇦🇩" },
    { name: "Angola", code: "+244", flag: "🇦🇴" },
    { name: "Anguilla", code: "+1264", flag: "🇦🇮" },
    { name: "Antigua-et-Barbuda", code: "+1268", flag: "🇦🇬" },
    { name: "Antarctique", code: "+672", flag: "🇦🇶" },
    { name: "Arabie saoudite", code: "+966", flag: "🇸🇦" },
    { name: "Argentine", code: "+54", flag: "🇦🇷" },
    { name: "Arménie", code: "+374", flag: "🇦🇲" },
    { name: "Aruba", code: "+297", flag: "🇦🇼" },
    { name: "Ascension", code: "+247", flag: "🇸🇭" },
    { name: "Australie", code: "+61", flag: "🇦🇺" },
    { name: "Autriche", code: "+43", flag: "🇦🇹" },
    { name: "Azerbaïdjan", code: "+994", flag: "🇦🇿" },
    { name: "Bahamas", code: "+1242", flag: "🇧🇸" },
    { name: "Bahreïn", code: "+973", flag: "🇧🇭" },
    { name: "Bangladesh", code: "+880", flag: "🇧🇩" },
    { name: "Barbade", code: "+1246", flag: "🇧🇧" },
    { name: "Belgique", code: "+32", flag: "🇧🇪" },
    { name: "Belize", code: "+501", flag: "🇧🇿" },
    { name: "Bénin", code: "+229", flag: "🇧🇯" },
    { name: "Bermudes", code: "+1441", flag: "🇧🇲" },
    { name: "Bhoutan", code: "+975", flag: "🇧🇹" },
    { name: "Biélorussie", code: "+375", flag: "🇧🇾" },
    { name: "Birmanie", code: "+95", flag: "🇲🇲" },
    { name: "Bolivie", code: "+591", flag: "🇧🇴" },
    { name: "Bosnie-Herzégovine", code: "+387", flag: "🇧🇦" },
    { name: "Botswana", code: "+267", flag: "🇧🇼" },
    { name: "Île Bouvet", code: "+47", flag: "🇧🇻" },
    { name: "Brésil", code: "+55", flag: "🇧🇷" },
    { name: "Brunei", code: "+673", flag: "🇧🇳" },
    { name: "Bulgarie", code: "+359", flag: "🇧🇬" },
    { name: "Burkina Faso", code: "+226", flag: "🇧🇫" },
    { name: "Burundi", code: "+257", flag: "🇧🇮" },
    { name: "Cambodge", code: "+855", flag: "🇰🇭" },
    { name: "Cameroun", code: "+237", flag: "🇨🇲" },
    { name: "Canada", code: "+1", flag: "🇨🇦" },
    { name: "Cap-Vert", code: "+238", flag: "🇨🇻" },
    { name: "Îles Caïmans", code: "+1345", flag: "🇰🇾" },
    { name: "République Centrafricaine", code: "+236", flag: "🇨🇫" },
    { name: "Chili", code: "+56", flag: "🇨🇱" },
    { name: "Chine", code: "+86", flag: "🇨🇳" },
    { name: "Chypre", code: "+357", flag: "🇨🇾" },
    { name: "Colombie", code: "+57", flag: "🇨🇴" },
    { name: "Comores", code: "+269", flag: "🇰🇲" },
    { name: "Congo (RDC)", code: "+243", flag: "🇨🇩" },
    { name: "Congo (Brazzaville)", code: "+242", flag: "🇨🇬" },
    { name: "Îles Cook", code: "+682", flag: "🇨🇰" },
    { name: "Corée du Nord", code: "+850", flag: "🇰🇵" },
    { name: "Corée du Sud", code: "+82", flag: "🇰🇷" },
    { name: "Costa Rica", code: "+506", flag: "🇨🇷" },
    { name: "Côte d’Ivoire", code: "+225", flag: "🇨🇮" },
    { name: "Croatie", code: "+385", flag: "🇭🇷" },
    { name: "Cuba", code: "+53", flag: "🇨🇺" },
    { name: "Curaçao", code: "+599", flag: "🇨🇼" },
    { name: "Danemark", code: "+45", flag: "🇩🇰" },
    { name: "Djibouti", code: "+253", flag: "🇩🇯" },
    { name: "République dominicaine", code: "+1809", flag: "🇩🇴" },
    { name: "Dominique", code: "+1767", flag: "🇩🇲" },
    { name: "Égypte", code: "+20", flag: "🇪🇬" },
    { name: "Émirats arabes unis", code: "+971", flag: "🇦🇪" },
    { name: "Équateur", code: "+593", flag: "🇪🇨" },
    { name: "Érythrée", code: "+291", flag: "🇪🇷" },
    { name: "Espagne", code: "+34", flag: "🇪🇸" },
    { name: "Estonie", code: "+372", flag: "🇪🇪" },
    { name: "États-Unis", code: "+1", flag: "🇺🇸" },
    { name: "Éthiopie", code: "+251", flag: "🇪🇹" },
    { name: "Îles Féroé", code: "+298", flag: "🇫🇴" },
    { name: "Fidji", code: "+679", flag: "🇫🇯" },
    { name: "Finlande", code: "+358", flag: "🇫🇮" },
    { name: "France", code: "+33", flag: "🇫🇷" },
    { name: "Gabon", code: "+241", flag: "🇬🇦" },
    { name: "Gambie", code: "+220", flag: "🇬🇲" },
    { name: "Géorgie", code: "+995", flag: "🇬🇪" },
    { name: "Géorgie du Sud", code: "+500", flag: "🇬🇸" },
    { name: "Ghana", code: "+233", flag: "🇬🇭" },
    { name: "Gibraltar", code: "+350", flag: "🇬🇮" },
    { name: "Grèce", code: "+30", flag: "🇬🇷" },
    { name: "Grenade", code: "+1473", flag: "🇬🇩" },
    { name: "Groenland", code: "+299", flag: "🇬🇱" },
    { name: "Guadeloupe", code: "+590", flag: "🇬🇵" },
    { name: "Guam", code: "+1671", flag: "🇬🇺" },
    { name: "Guatemala", code: "+502", flag: "🇬🇹" },
    { name: "Guernesey", code: "+44", flag: "🇬🇬" },
    { name: "Guinée", code: "+224", flag: "🇬🇳" },
    { name: "Guinée équatoriale", code: "+240", flag: "🇬🇶" },
    { name: "Guinée-Bissau", code: "+245", flag: "🇬🇼" },
    { name: "Guyana", code: "+592", flag: "🇬🇾" },
    { name: "Guyane", code: "+594", flag: "🇬🇫" },
    { name: "Haïti", code: "+509", flag: "🇭🇹" },
    { name: "Honduras", code: "+504", flag: "🇭🇳" },
    { name: "Hong Kong", code: "+852", flag: "🇭🇰" },
    { name: "Hongrie", code: "+36", flag: "🇭🇺" },
    { name: "Île de Man", code: "+44", flag: "🇮🇲" },
    { name: "Inde", code: "+91", flag: "🇮🇳" },
    { name: "Indonésie", code: "+62", flag: "🇮🇩" },
    { name: "Irak", code: "+964", flag: "🇮🇶" },
    { name: "Iran", code: "+98", flag: "🇮🇷" },
    { name: "Irlande", code: "+353", flag: "🇮🇪" },
    { name: "Islande", code: "+354", flag: "🇮🇸" },
    { name: "Israël", code: "+972", flag: "🇮🇱" },
    { name: "Italie", code: "+39", flag: "🇮🇹" },
    { name: "Jamaïque", code: "+1876", flag: "🇯🇲" },
    { name: "Japon", code: "+81", flag: "🇯🇵" },
    { name: "Jersey", code: "+44", flag: "🇯🇪" },
    { name: "Jordanie", code: "+962", flag: "🇯🇴" },
    { name: "Kazakhstan", code: "+997", flag: "🇰🇿" },
    { name: "Kenya", code: "+254", flag: "🇰🇪" },
    { name: "Kirghizistan", code: "+996", flag: "🇰🇬" },
    { name: "Kiribati", code: "+686", flag: "🇰🇮" },
    { name: "Kosovo", code: "+383", flag: "🇽🇰" },
    { name: "Koweït", code: "+965", flag: "🇰🇼" },
    { name: "Laos", code: "+856", flag: "🇱🇦" },
    { name: "Lesotho", code: "+266", flag: "🇱🇸" },
    { name: "Lettonie", code: "+371", flag: "🇱🇻" },
    { name: "Liban", code: "+961", flag: "🇱🇧" },
    { name: "Liberia", code: "+231", flag: "🇱🇷" },
    { name: "Libye", code: "+218", flag: "🇱🇾" },
    { name: "Liechtenstein", code: "+423", flag: "🇱🇮" },
    { name: "Lituanie", code: "+370", flag: "🇱🇹" },
    { name: "Luxembourg", code: "+352", flag: "🇱🇺" },
    { name: "Macao", code: "+853", flag: "🇲🇴" },
    { name: "Macédoine du Nord", code: "+389", flag: "🇲🇰" },
    { name: "Madagascar", code: "+261", flag: "🇲🇬" },
    { name: "Malaisie", code: "+60", flag: "🇲🇾" },
    { name: "Malawi", code: "+265", flag: "🇲🇼" },
    { name: "Maldives", code: "+960", flag: "🇲🇻" },
    { name: "Mali", code: "+223", flag: "🇲🇱" },
    { name: "Malouines", code: "+500", flag: "🇫🇰" },
    { name: "Malte", code: "+356", flag: "🇲🇹" },
    { name: "Îles Mariannes du Nord", code: "+1670", flag: "🇲🇵" },
    { name: "Maroc", code: "+212", flag: "🇲🇦" },
    { name: "Îles Marshall", code: "+692", flag: "🇲🇭" },
    { name: "Martinique", code: "+596", flag: "🇲🇶" },
    { name: "Maurice", code: "+230", flag: "🇲🇺" },
    { name: "Mauritanie", code: "+222", flag: "🇲🇷" },
    { name: "Mayotte", code: "+262", flag: "🇾🇹" },
    { name: "Mexique", code: "+52", flag: "🇲🇽" },
    { name: "Micronésie", code: "+691", flag: "🇫🇲" },
    { name: "Moldavie", code: "+373", flag: "🇲🇩" },
    { name: "Monaco", code: "+377", flag: "🇲🇨" },
    { name: "Mongolie", code: "+976", flag: "🇲🇳" },
    { name: "Monténégro", code: "+382", flag: "🇲🇪" },
    { name: "Montserrat", code: "+1664", flag: "🇲🇸" },
    { name: "Mozambique", code: "+258", flag: "🇲🇿" },
    { name: "Namibie", code: "+264", flag: "🇳🇦" },
    { name: "Nauru", code: "+674", flag: "🇳🇷" },
    { name: "Népal", code: "+977", flag: "🇳🇵" },
    { name: "Nicaragua", code: "+505", flag: "🇳🇮" },
    { name: "Niger", code: "+227", flag: "🇳🇪" },
    { name: "Nigeria", code: "+234", flag: "🇳🇬" },
    { name: "Niue", code: "+683", flag: "🇳🇺" },
    { name: "Île Norfolk", code: "+6723", flag: "🇳🇫" },
    { name: "Norvège", code: "+47", flag: "🇳🇴" },
    { name: "Nouvelle-Calédonie", code: "+687", flag: "🇳🇨" },
    { name: "Nouvelle-Zélande", code: "+64", flag: "🇳🇿" },
    { name: "Oman", code: "+968", flag: "🇴🇲" },
    { name: "Ouganda", code: "+256", flag: "🇺🇬" },
    { name: "Ouzbékistan", code: "+998", flag: "🇺🇿" },
    { name: "Pakistan", code: "+92", flag: "🇵🇰" },
    { name: "Palaos", code: "+680", flag: "🇵🇼" },
    { name: "Palestine", code: "+970", flag: "🇵🇸" },
    { name: "Panama", code: "+507", flag: "🇵🇦" },
    { name: "Papouasie-Nouvelle-Guinée", code: "+675", flag: "🇵🇬" },
    { name: "Paraguay", code: "+595", flag: "🇵🇾" },
    { name: "Pays-Bas", code: "+31", flag: "🇳🇱" },
    { name: "Pays-Bas Caribéens", code: "+599", flag: "🇧🇶" },
    { name: "Pérou", code: "+51", flag: "🇵🇪" },
    { name: "Philippines", code: "+63", flag: "🇵🇭" },
    { name: "Îles Pitcairn", code: "+64", flag: "🇵🇳" },
    { name: "Pologne", code: "+48", flag: "🇵🇱" },
    { name: "Polynésie française", code: "+689", flag: "🇵🇫" },
    { name: "Porto Rico", code: "+1787", flag: "🇵🇷" },
    { name: "Portugal", code: "+351", flag: "🇵🇹" },
    { name: "Qatar", code: "+974", flag: "🇶🇦" },
    { name: "La Réunion", code: "+262", flag: "🇷🇪" },
    { name: "Roumanie", code: "+40", flag: "🇷🇴" },
    { name: "Royaume-Uni", code: "+44", flag: "🇬🇧" },
    { name: "Russie", code: "+7", flag: "🇷🇺" },
    { name: "Rwanda", code: "+250", flag: "🇷🇼" },
    { name: "Saint-Barthélemy", code: "+590", flag: "🇧🇱" },
    { name: "Saint-Christophe-et-Niévès", code: "+1869", flag: "🇰🇳" },
    { name: "Sainte-Hélène", code: "+290", flag: "🇸🇭" },
    { name: "Sainte-Lucie", code: "+1758", flag: "🇱🇨" },
    { name: "Saint-Marin", code: "+378", flag: "🇸🇲" },
    { name: "Saint-Martin (fr)", code: "+590", flag: "🇲🇫" },
    { name: "Saint-Martin (nl)", code: "+1721", flag: "🇸🇽" },
    { name: "Saint-Pierre-et-Miquelon", code: "+508", flag: "🇵🇲" },
    { name: "Saint-Vincent-et-les-Grenadines", code: "+1784", flag: "🇻🇨" },
    { name: "Îles Salomon", code: "+677", flag: "🇸🇧" },
    { name: "Salvador", code: "+503", flag: "🇸🇻" },
    { name: "Samoa", code: "+685", flag: "🇼🇸" },
    { name: "Samoa américaines", code: "+1684", flag: "🇦🇸" },
    { name: "Sao Tomé-et-Principe", code: "+239", flag: "🇸🇹" },
    { name: "Sénégal", code: "+221", flag: "🇸🇳" },
    { name: "Serbie", code: "+381", flag: "🇷🇸" },
    { name: "Seychelles", code: "+248", flag: "🇸🇨" },
    { name: "Sierra Leone", code: "+232", flag: "🇸🇱" },
    { name: "Singapour", code: "+65", flag: "🇸🇬" },
    { name: "Slovaquie", code: "+421", flag: "🇸🇰" },
    { name: "Slovénie", code: "+386", flag: "🇸🇮" },
    { name: "Somalie", code: "+252", flag: "🇸🇴" },
    { name: "Soudan", code: "+249", flag: "🇸🇩" },
    { name: "Soudan du Sud", code: "+211", flag: "🇸🇸" },
    { name: "Sri Lanka", code: "+94", flag: "🇱🇰" },
    { name: "Suède", code: "+46", flag: "🇸🇪" },
    { name: "Suisse", code: "+41", flag: "🇨🇭" },
    { name: "Suriname", code: "+597", flag: "🇸🇷" },
    { name: "Svalbard", code: "+47", flag: "🇸🇯" },
    { name: "Eswatini", code: "+268", flag: "🇸🇿" },
    { name: "Syrie", code: "+963", flag: "🇸🇾" },
    { name: "Tadjikistan", code: "+992", flag: "🇹🇯" },
    { name: "Tanzanie", code: "+255", flag: "🇹🇿" },
    { name: "Taïwan", code: "+886", flag: "🇹🇼" },
    { name: "Tchad", code: "+235", flag: "🇹🇩" },
    { name: "République tchèque", code: "+420", flag: "🇨🇿" },
    { name: "Thaïlande", code: "+66", flag: "🇹🇭" },
    { name: "Timor oriental", code: "+670", flag: "🇹🇱" },
    { name: "Togo", code: "+228", flag: "🇹🇬" },
    { name: "Tokelau", code: "+690", flag: "🇹🇰" },
    { name: "Tonga", code: "+676", flag: "🇹🇴" },
    { name: "Trinité-et-Tobago", code: "+1868", flag: "🇹🇹" },
    { name: "Tunisie", code: "+216", flag: "🇹🇳" },
    { name: "Turkménistan", code: "+993", flag: "🇹🇲" },
    { name: "Îles Turques-et-Caïques", code: "+1649", flag: "🇹🇨" },
    { name: "Turquie", code: "+90", flag: "🇹🇷" },
    { name: "Tuvalu", code: "+688", flag: "🇹🇻" },
    { name: "Ukraine", code: "+380", flag: "🇺🇦" },
    { name: "Uruguay", code: "+598", flag: "🇺🇾" },
    { name: "Vanuatu", code: "+678", flag: "🇻🇺" },
    { name: "Vatican", code: "+379", flag: "🇻🇦" },
    { name: "Venezuela", code: "+58", flag: "🇻🇪" },
    { name: "Îles Vierges des États-Unis", code: "+1340", flag: "🇻🇮" },
    { name: "Îles Vierges Britanniques", code: "+1284", flag: "🇻🇬" },
    { name: "Viêt Nam", code: "+84", flag: "🇻🇳" },
    { name: "Wallis-et-Futuna", code: "+681", flag: "🇼🇫" },
    { name: "Yémen", code: "+967", flag: "🇾🇪" },
    { name: "Zambie", code: "+260", flag: "🇿🇲" },
    { name: "Zimbabwe", code: "+263", flag: "🇿🇼" }
].sort((a, b) => a.name.localeCompare(b.name));

const DEPARTURE_POINTS = ['Hammamet', 'Sousse', 'Tunis'];

export default function ExcursionBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = bookingTranslations[language] || bookingTranslations.fr;

  const [excursion, setExcursion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    excursion: id,
    groupSize: '4',
    departurePoint: 'Hammamet',
    preferredDate: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    prefix: ALL_COUNTRIES.find(c => c.name === "Tunisie") || ALL_COUNTRIES[0],
    whatsapp: false,
    customItinerary: false,
    specialRequests: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [price, setPrice] = useState(0);

  // Configuration des tailles de groupe (traduite dynamiquement)
  const GROUP_SIZES = [
    { value: '4', label: t.upTo4, max: `${t.max} 4` },
    { value: '6', label: t.upTo6, max: `${t.max} 6` },
    { value: '8', label: t.upTo8, max: `${t.max} 8` }
  ];

  useEffect(() => {
    const fetchExcursion = async () => {
      try {
        const response = await excursionAPI.getOne(id);
        if (response.data?.success) {
          setExcursion(response.data.excursion);
        }
      } catch (error) {
        console.error('Erreur chargement excursion', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExcursion();
  }, [id]);

  useEffect(() => {
    if (!excursion) return;

    const rawDeparturePrices = excursion.departurePrices || {};
    const departurePrices =
      rawDeparturePrices instanceof Map
        ? Object.fromEntries(rawDeparturePrices)
        : rawDeparturePrices;

    const cityPrices = departurePrices[bookingData.departurePoint];
    const cityPrice = cityPrices?.[bookingData.groupSize];

    if (cityPrice !== undefined && cityPrice !== null && Number(cityPrice) > 0) {
      setPrice(Number(cityPrice));
      return;
    }

    const rawGroupPrices = excursion.groupPrices || {};
    const groupPrices =
      rawGroupPrices instanceof Map
        ? Object.fromEntries(rawGroupPrices)
        : rawGroupPrices;

    const fallbackPrice = groupPrices[bookingData.groupSize];
    if (fallbackPrice !== undefined) {
      setPrice(Number(fallbackPrice));
      return;
    }

    setPrice(0);
  }, [bookingData.groupSize, bookingData.departurePoint, excursion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGroupSizeSelect = (size) => {
    setBookingData(prev => ({ ...prev, groupSize: size }));
  };

  const handleDepartureSelect = (point) => {
    setBookingData(prev => ({ ...prev, departurePoint: point }));
  };

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...bookingData,
        phone: `${bookingData.prefix.code} ${bookingData.phone}`,
        prefix: undefined
      };
      const response = await excursionBookingAPI.create(payload);
      if (response.data?.success) {
        navigate(`/excursions/booking-confirmation/${response.data.booking._id}`);
      } else {
        alert(language === 'en' ? 'Error during booking' : 'Erreur lors de la réservation');
      }
    } catch (error) {
      console.error('Erreur soumission', error);
      alert(language === 'en' ? 'Network error' : 'Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  };

  // Fonction pour traduire le nom de l'excursion
  const translateExcursionName = (name) => {
    if (language === 'en' && t.names && t.names[name]) return t.names[name];
    return name;
  };

  if (loading) {
    return (
      <div className="bg-dark-DEFAULT min-h-screen flex items-center justify-center">
        <div className="text-gold text-sm uppercase tracking-widest">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="bg-dark-DEFAULT min-h-screen font-sans text-cream selection:bg-gold selection:text-dark">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Stepper */}
        <div className="flex flex-col items-center mb-12 animate-fade-in">
          <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center tracking-tight">
            {t.bookTitle} <em className="text-gold italic underline decoration-gold/30 underline-offset-8">{t.bookHighlight}</em>
          </h1>
          <div className="flex items-center justify-center w-full max-w-2xl px-4">
            <StepIcon number="1" active={step === 1} completed={step > 1} />
            <div className="flex-1 h-[1px] bg-gold/30 mx-4"></div>
            <StepIcon number="2" active={step === 2} completed={step > 2} />
            <div className="flex-1 h-[1px] bg-white/10 mx-4"></div>
            <StepIcon number="3" active={false} completed={false} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Colonne de gauche : formulaire */}
          <div className="lg:col-span-8 animate-fade-up">
            {step === 1 && (
              <Step1
                bookingData={bookingData}
                onGroupSizeSelect={handleGroupSizeSelect}
                onDepartureSelect={handleDepartureSelect}
                onNext={handleNext}
                price={price}
                groupSizes={GROUP_SIZES}
                t={t}
              />
            )}
            {step === 2 && (
              <Step2
                excursion={excursion}
                bookingData={bookingData}
                onChange={handleChange}
                onBack={handleBack}
                onSubmit={handleSubmit}
                submitting={submitting}
                price={price}
                t={t}
              />
            )}
          </div>

          {/* Colonne de droite : récapitulatif */}
          <div className="lg:col-span-4 animate-fade-in delay-200">
            <div className="bg-dark-2/40 backdrop-blur-xl border border-white/10 p-6 rounded-xs sticky top-32">
              <h3 className="font-serif text-xl mb-6 border-b border-white/5 pb-4 text-gold">{t.summaryTitle}</h3>
              <div className="mb-8 text-center bg-white/5 p-4 rounded-xs">
             <img
                src={getImageUrl(excursion?.coverImage)}
                alt={excursion?.name}
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80';
                }}
                className="w-40 mx-auto mb-4 drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]"
              />
                <p className="font-serif text-xl text-white">{translateExcursionName(excursion?.name)}</p>
              </div>

                  <div className="bg-gold text-dark p-4 flex justify-between items-center font-bold mb-8">
                  <span className="text-[10px] uppercase tracking-widest">{t.totalPrice}</span>
                  <span className="text-2xl font-serif">
                    {price > 0 ? `€${price}` : t.onRequest}
                  </span>
                </div>

              <div className="space-y-6">
                <JourneyStep
                  label={t.departurePoint}
                  value={bookingData.departurePoint}
                  icon={<MapPin size={14} />}
                  isLast={false}
                />
                <JourneyStep
                  label={t.groupSize}
                  value={`${bookingData.groupSize} ${t.persons}`}
                  icon={<User size={14} />}
                  isLast={false}
                />
                <JourneyStep
                  label={t.preferredDate}
                  value={bookingData.preferredDate || t.notDefined}
                  icon={<Calendar size={14} />}
                  isLast={true}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// --- Sous-composants ---

function StepIcon({ number, active, completed }) {
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-700 ${
      completed ? 'bg-gold text-dark' :
      active ? 'border-gold text-gold border-2 shadow-[0_0_20px_rgba(197,160,89,0.3)]' : 'border-white/10 text-white/20 border'
    }`}>
      {completed ? <Check size={18} /> : number}
    </div>
  );
}

function Step1({ bookingData, onGroupSizeSelect, onDepartureSelect, onNext, price, groupSizes, t }) {
  return (
    <div className="bg-dark-2/40 backdrop-blur-xl border border-white/10 p-8 rounded-xs">
      <h2 className="font-serif text-2xl mb-8 flex items-center gap-3 border-b border-white/5 pb-4">
        <User className="text-gold" size={24} /> {t.step1Title}
      </h2>

      <div className="mb-8">
        <label className="text-[10px] uppercase tracking-[3px] text-gold/60 ml-1 mb-2 block">
          {t.groupSizeLabel}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {groupSizes.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => onGroupSizeSelect(size.value)}
              className={`p-6 border text-left transition-all ${
                bookingData.groupSize === size.value
                  ? 'border-gold bg-gold/10'
                  : 'border-white/10 hover:border-gold/40'
              }`}
            >
              <div className="text-cream text-lg font-light">{size.label}</div>
              <div className="text-gold text-xs uppercase tracking-wider mt-1">{size.max}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <label className="text-[10px] uppercase tracking-[3px] text-gold/60 ml-1 mb-2 block">
          {t.departureLabel}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEPARTURE_POINTS.map((point) => (
            <button
              key={point}
              type="button"
              onClick={() => onDepartureSelect(point)}
              className={`p-6 border text-left transition-all ${
                bookingData.departurePoint === point
                  ? 'border-gold bg-gold/10'
                  : 'border-white/10 hover:border-gold/40'
              }`}
            >
              <div className="text-cream text-lg font-light">{point}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <div>
          <div className="text-muted text-xs uppercase tracking-wider">{t.totalPrice}</div>
          <div className="font-serif text-4xl font-light text-gold mt-1">
            €{price}
            <span className="text-muted text-sm ml-2">{t.perGroup}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="group relative flex items-center justify-center gap-4 px-12 py-4 bg-gold text-dark uppercase text-xs tracking-[4px] font-bold transition-all overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-3 italic">
            {t.continueBtn} <ArrowRight size={18} />
          </span>
          <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
        </button>
      </div>
    </div>
  );
}

function Step2({ excursion, bookingData, onChange, onBack, onSubmit, submitting, price, t }) {
  const [prefix, setPrefix] = useState(bookingData.prefix);

  const handlePrefixChange = (country) => {
    setPrefix(country);
    onChange({ target: { name: 'prefix', value: country } });
  };

  // 1. Calcul de la date d'aujourd'hui (format YYYY-MM-DD sécurisé pour le fuseau horaire local)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const minDate = `${year}-${month}-${day}`;

  return (
    <div className="bg-dark-2/40 backdrop-blur-xl border border-white/10 p-8 rounded-xs">
      <h2 className="font-serif text-2xl mb-8 flex items-center gap-3 border-b border-white/5 pb-4">
        <User className="text-gold" size={24} /> {t.step2Title}
      </h2>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Nom complet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label={t.firstName}
            name="firstName"
            value={bookingData.firstName}
            onChange={onChange}
            required
            placeholder={t.firstNamePlaceholder}
          />
          <FormInput
            label={t.lastName}
            name="lastName"
            value={bookingData.lastName}
            onChange={onChange}
            required
            placeholder={t.lastNamePlaceholder}
          />
        </div>

        {/* Email */}
        <FormInput
          label={t.email}
          name="email"
          type="email"
          value={bookingData.email}
          onChange={onChange}
          required
          placeholder={t.emailPlaceholder}
        />

        {/* Téléphone avec sélecteur de pays */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[3px] text-gold/60 ml-1 block">
            {t.phone}
          </label>
          <div className="flex gap-2 h-12">
            <GlobalCountrySelect selected={prefix} onSelect={handlePrefixChange} t={t} />
            <input
              type="tel"
              name="phone"
              value={bookingData.phone}
              onChange={onChange}
              required
              className="flex-1 bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-gold outline-none text-cream"
              placeholder={t.phonePlaceholder}
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              name="whatsapp"
              id="whatsapp"
              checked={bookingData.whatsapp}
              onChange={onChange}
              className="accent-gold"
            />
            <label htmlFor="whatsapp" className="text-sm text-muted">{t.useWhatsapp}</label>
          </div>
        </div>

        {/* Date préférée */}
      <FormInput
          label={t.dateLabel}
          name="preferredDate"
          type="date"
          value={bookingData.preferredDate}
          onChange={onChange}
          required
          min={minDate} // 2. On passe la date minimum ici
        />

        {/* Itinéraire personnalisé */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="customItinerary"
            id="customItinerary"
            checked={bookingData.customItinerary}
            onChange={onChange}
            className="accent-gold"
          />
          <label htmlFor="customItinerary" className="text-sm text-muted">
            {t.customItinerary}
          </label>
        </div>

        {/* Commentaires */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[3px] text-gold/60 ml-1 block">
            {t.commentsLabel}
          </label>
          <textarea
            name="specialRequests"
            value={bookingData.specialRequests}
            onChange={onChange}
            rows="3"
            className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:border-gold outline-none text-cream resize-none"
            placeholder={t.commentsPlaceholder}
          />
        </div>

        {/* Boutons de navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <button
            type="button"
            onClick={onBack}
            className="text-muted hover:text-gold transition-colors text-sm uppercase tracking-wider"
          >
            {t.backBtn}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="group relative flex items-center justify-center gap-4 px-12 py-4 bg-gold text-dark uppercase text-xs tracking-[4px] font-bold transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center gap-3 italic">
              {submitting ? t.sendingBtn : t.confirmBtn}
              {!submitting && <ArrowRight size={18} />}
            </span>
            {!submitting && (
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Composant de sélecteur de pays global
function GlobalCountrySelect({ selected, onSelect, t }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = ALL_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search)
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-full bg-white/5 border border-white/10 px-4 flex items-center gap-3 hover:border-gold transition-all text-sm min-w-[110px]"
      >
        <span className="text-lg">{selected.flag}</span>
        <span className="font-bold text-gold">{selected.code}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-dark-DEFAULT border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] animate-slide-up">
          <div className="p-3 border-b border-white/5 bg-dark-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                autoFocus
                type="text"
                placeholder={t.searchCountry}
                className="w-full bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-[11px] outline-none focus:border-gold text-cream"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar bg-dark-2/90">
            {filtered.length > 0 ? filtered.map((c) => (
              <div
                key={c.name + c.code}
                onClick={() => { onSelect(c); setIsOpen(false); setSearch(""); }}
                className="px-4 py-3 flex items-center justify-between hover:bg-gold hover:text-dark cursor-pointer transition-colors border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{c.flag}</span>
                  <span className="text-xs font-medium uppercase tracking-wider">{c.name}</span>
                </div>
                <span className="text-[10px] font-bold opacity-60 italic">{c.code}</span>
              </div>
            )) : (
              <div className="p-4 text-center text-xs text-cream/20 italic">{t.noCountry}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Composant d'input réutilisable
function FormInput({ label, name, type = "text", value, onChange, required = false, placeholder, min }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-[3px] text-gold/60 ml-1 block">
        {label} {required && '*'}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        min={min} // <-- AJOUTER CETTE LIGNE
        // Ajout de [color-scheme:dark] pour l'icône du calendrier
        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-gold outline-none text-cream transition-all [color-scheme:dark]"
        placeholder={placeholder || `Entrez votre ${label.toLowerCase()}`}
      />
    </div>
  );
}

// Composant d'étape dans le récapitulatif
function JourneyStep({ label, value, icon, isLast }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
          {icon}
        </div>
        {!isLast && <div className="w-[1px] h-full bg-gradient-to-b from-gold/30 to-transparent my-1"></div>}
      </div>
      <div className="pb-4">
        <p className="text-[9px] uppercase tracking-[4px] text-gold/40 mb-1">{label}</p>
        <p className="text-[11px] font-medium text-cream leading-tight">{value}</p>
      </div>
    </div>
  );
}