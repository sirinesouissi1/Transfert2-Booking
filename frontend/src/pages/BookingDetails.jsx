//formulaire de reservayion transfert
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  MapPin, ArrowRight, Check, Plane, User, Phone, Search, ChevronDown, Globe 
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// Liste complète et triée des préfixes de pays
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

export default function BookingDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  // Récupération des données : price peut être null (si absent)
  const bookingData = useMemo(() => ({
    vehicleId: params.get('vehicleId') || '',
    vehicleName: params.get('vehicleName') || 'Berline Affaires',
    price: params.get('price') || null,  // ← modifié : null au lieu de '0'
    image: params.get('image') || 'https://i.ibb.co/vYm6D4Y/skoda-octavia.png',
    from: params.get('from') || 'Tunis Carthage Airport',
    to: params.get('to') || 'Sousse',
    departureDate: params.get('departureDate') || '',
    returnDate: params.get('returnDate') || '',
    tripType: params.get('tripType') || 'one-way',
    passengers: params.get('passengers') || '1'
  }), [params]);

  const [formData, setFormData] = useState({
    prenom: '', nom: '', email: '', phone: '',
    prefix: ALL_COUNTRIES.find(c => c.name === "Tunisie") || ALL_COUNTRIES[0],
    flightNumber: '', adults: parseInt(bookingData.passengers),
    children: 0, requests: '', whatsapp: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors = [];
    if (!formData.prenom.trim()) errors.push('Prénom');
    if (!formData.nom.trim()) errors.push('Nom');
    if (!formData.email.trim()) errors.push('Email');
    if (!formData.phone.trim()) errors.push('Téléphone');
    return errors;
  };

  const handleConfirm = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      toast.error(`Veuillez remplir les champs suivants : ${errors.join(', ')}`, {
          duration: 5000,
          style: { background: '#1A1A24', color: '#F8F5EE', border: '1px solid #C9A84C', borderRadius: '4px' },
          iconTheme: { primary: '#ef4444', secondary: '#0A0A0F' },
      });
      return;
    }

    setIsSubmitting(true);

    // Si pas de prix, on envoie 0 (le backend doit accepter)
    const finalPrice = bookingData.price ? parseFloat(bookingData.price) : 0;

    const bookingPayload = {
      firstName: formData.prenom,
      lastName: formData.nom,
      email: formData.email,
      phone: `${formData.prefix.code} ${formData.phone}`,
      whatsapp: formData.whatsapp,
      bookingType: 'transfer',
      tripType: bookingData.tripType,
      from: bookingData.from,
      to: bookingData.to,
      departureDate: new Date(bookingData.departureDate).toISOString(),
      returnDate: bookingData.returnDate ? new Date(bookingData.returnDate).toISOString() : null,
      vehicle: bookingData.vehicleId,
      totalPrice: finalPrice,
      passengers: { adults: formData.adults, children: formData.children },
      flightNumber: formData.flightNumber,
      specialRequests: formData.requests,
    };

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la réservation');
      }

      if (result.success) {
        navigate(`/confirmation?code=${result.booking.confirmationCode}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Impossible de contacter le serveur', {
        duration: 5000,
        style: { background: '#1A1A24', color: '#F8F5EE', border: '1px solid #C9A84C', borderRadius: '4px' },
        iconTheme: { primary: '#ef4444', secondary: '#0A0A0F' },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-dark-DEFAULT min-h-screen font-sans text-cream selection:bg-gold selection:text-dark">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        
        <div className="flex flex-col items-center mb-12 animate-fade-in">
            <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center tracking-tight text-white">
                Finalisez votre <em className="text-gold italic underline decoration-gold/30 underline-offset-8">réservation</em>
            </h1>
            <div className="flex items-center justify-center w-full max-w-2xl px-4">
                <StepIcon number="1" completed={true} />
                <div className="flex-1 h-[1px] bg-gold/30 mx-4"></div>
                <StepIcon number="2" completed={true} />
                <div className="flex-1 h-[1px] bg-gold/30 mx-4"></div>
                <StepIcon number="3" active={true} />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8 animate-fade-up">
            <div className="bg-dark-2/40 backdrop-blur-xl border border-white/10 p-8 rounded-xs relative">
              <h2 className="font-serif text-2xl mb-8 flex items-center gap-3 border-b border-white/5 pb-4">
                <User className="text-gold" size={24} /> Informations Personnelles
              </h2>

              <form onSubmit={handleConfirm} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput label="Prénom" onChange={v => setFormData({...formData, prenom: v})} />
                  <FormInput label="Nom" onChange={v => setFormData({...formData, nom: v})} />
                </div>

                <FormInput label="Email" type="email" onChange={v => setFormData({...formData, email: v})} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[3px] text-gold/60 ml-1">Numéro de téléphone</label>
                    <div className="flex gap-2 h-12">
                        <GlobalCountrySelect 
                            selected={formData.prefix} 
                            onSelect={(c) => setFormData({...formData, prefix: c})} 
                        />
                        <input 
                            type="tel" 
                            className="flex-1 bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-gold outline-none text-cream transition-all"
                            placeholder="00 00 00 00"
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                  </div>

                  <FormInput label="Numéro de Vol" icon={<Plane size={16}/>} onChange={v => setFormData({...formData, flightNumber: v})} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                   <Counter label="Adultes" value={formData.adults} onUpdate={v => setFormData({...formData, adults: v})} />
                   <Counter label="Enfants" value={formData.children} onUpdate={v => setFormData({...formData, children: v})} />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[3px] text-gold/60 ml-1">Demandes particulières</label>
                    <textarea 
                        rows="3" 
                        className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:border-gold outline-none text-cream resize-none"
                        placeholder="Ex: Siège bébé requis, besoin d'aide pour bagages..."
                        onChange={e => setFormData({...formData, requests: e.target.value})}
                    ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="group relative flex items-center justify-center gap-4 px-16 py-6 bg-gold text-dark uppercase text-xs tracking-[4px] font-bold transition-all overflow-hidden w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center gap-3 italic">
                    {isSubmitting ? 'Envoi en cours...' : 'Confirmer la réservation'}
                    {!isSubmitting && <ArrowRight size={18} />}
                  </span>
                  {!isSubmitting && (
                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-4 animate-fade-in delay-200">
             <div className="bg-dark-2/40 backdrop-blur-xl border border-white/10 p-6 rounded-xs sticky top-32">
              <h3 className="font-serif text-xl mb-6 border-b border-white/5 pb-4 text-gold">Détails du Trajet</h3>
              <div className="mb-8 text-center bg-white/5 p-4 rounded-xs">
                 <img src={bookingData.image} alt="car" className="w-40 mx-auto mb-4 drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]" />
                 <p className="font-serif text-xl text-white">{bookingData.vehicleName}</p>
                 <span className="inline-block text-[9px] uppercase tracking-[3px] text-orange-400 mt-2">Paiement au chauffeur</span>
              </div>
              
              <div className="bg-gold text-dark p-4 flex justify-between items-center font-bold mb-8">
                 <span className="text-[10px] uppercase tracking-widest">Prix Total</span>
                 {bookingData.price ? (
                   <span className="text-2xl font-serif">{bookingData.price} €</span>
                 ) : (
                   <span className="text-sm font-serif italic">Sur demande</span>
                 )}
              </div>

              <div className="space-y-6">
                 <JourneyStep label="Départ" value={bookingData.from} icon={<Plane size={14}/>} />
                 <JourneyStep label="Destination" value={bookingData.to} icon={<MapPin size={14}/>} isLast />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// --- SOUS-COMPOSANTS (inchangés) ---
function GlobalCountrySelect({ selected, onSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);

    useEffect(() => {
        const close = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); };
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
                                placeholder="Rechercher un pays..." 
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
                        )) : <div className="p-4 text-center text-xs text-cream/20 italic">Aucun pays trouvé</div>}
                    </div>
                </div>
            )}
        </div>
    );
}

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

function FormInput({ label, type="text", icon, onChange }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[3px] text-gold/60 ml-1">{label}</label>
            <div className="relative">
                {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/40">{icon}</div>}
                <input 
                    type={type} 
                    onChange={e => onChange(e.target.value)}
                    className={`w-full bg-white/5 border border-white/10 ${icon ? 'pl-12' : 'px-4'} py-3 text-sm focus:border-gold outline-none text-cream transition-all`}
                    placeholder={`Entrez votre ${label.toLowerCase()}`}
                />
            </div>
        </div>
    );
}

function Counter({ label, value, onUpdate }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[3px] text-gold/60 ml-1">{label}</label>
            <div className="flex items-center justify-between border border-white/10 bg-white/5 p-1 h-12 rounded-xs">
                <button type="button" onClick={() => onUpdate(Math.max(0, value-1))} className="w-12 h-full flex items-center justify-center text-gold hover:bg-gold hover:text-dark transition-all text-xl">—</button>
                <span className="font-bold text-sm text-white">{value}</span>
                <button type="button" onClick={() => onUpdate(value+1)} className="w-12 h-full flex items-center justify-center text-gold hover:bg-gold hover:text-dark transition-all text-xl">+</button>
            </div>
        </div>
    );
}

function JourneyStep({ label, value, icon, isLast }) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">{icon}</div>
                {!isLast && <div className="w-[1px] h-full bg-gradient-to-b from-gold/30 to-transparent my-1"></div>}
            </div>
            <div className="pb-4">
                <p className="text-[9px] uppercase tracking-[4px] text-gold/40 mb-1">{label}</p>
                <p className="text-[11px] font-medium text-cream leading-tight">{value}</p>
            </div>
        </div>
    );
}