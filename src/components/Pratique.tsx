import React, { useState, useEffect } from "react";
import { 
  Compass, 
  MapPin, 
  Search, 
  Navigation, 
  AlertCircle, 
  Map as MapIcon, 
  ExternalLink, 
  Check, 
  Info, 
  Activity,
  Globe
} from "lucide-react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { useLanguage } from "../lib/LanguageContext";

// Mecca coordinates
const MECCA_LAT = 21.4225;
const MECCA_LNG = 39.8262;

interface Mosque {
  name: string;
  nameEn: string;
  nameAr: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  description: string;
  descriptionEn: string;
  descriptionAr: string;
}

const PRESET_MOSQUES: Mosque[] = [
  // Dakar
  {
    name: "Mosquée Massalikoul Djinane",
    nameEn: "Massalikoul Djinane Mosque",
    nameAr: "مسجد مسالك الجنان",
    address: "Quartier Colobane, Dakar",
    city: "Dakar",
    lat: 14.6931,
    lng: -17.4475,
    description: "La plus grande mosquée d'Afrique de l'Ouest, chef-d'œuvre de l'architecture Mouride inauguré en 2019.",
    descriptionEn: "The largest mosque in West Africa, a masterpiece of Mouride architecture inaugurated in 2019.",
    descriptionAr: "أكبر مسجد في غرب إفريقيا، تحفة معمارية مريدية تم افتتاحها في عام ٢٠١٩."
  },
  {
    name: "Mosquée de la Divinité",
    nameEn: "Mosque of the Divinity",
    nameAr: "مسجد الألوهية",
    address: "Corniche Ouest, Ouakam, Dakar",
    city: "Dakar",
    lat: 14.7214,
    lng: -17.4892,
    description: "Bâtie face à l'océan Atlantique, un monument spirituel unique au Sénégal.",
    descriptionEn: "Built facing the Atlantic Ocean, a unique spiritual monument in Senegal.",
    descriptionAr: "بني قبالة المحيط الأطلسي، وهو صرح روحي فريد من نوعه في السنغال."
  },
  {
    name: "Grande Mosquée de Dakar",
    nameEn: "Grand Mosque of Dakar",
    nameAr: "مسجد دكار الكبير",
    address: "Allée Pape Gueye Fall, Dakar",
    city: "Dakar",
    lat: 14.6781,
    lng: -17.4414,
    description: "Inaugurée en 1964 par le Roi Hassan II et le Président Léopold Sédar Senghor.",
    descriptionEn: "Inaugurated in 1964 by King Hassan II and President Leopold Sedar Senghor.",
    descriptionAr: "افتتحه في عام ١٩٦٤ الملك الحسن الثاني والرئيس ليوبولد سيدار سنغور."
  },
  // Abidjan
  {
    name: "Grande Mosquée de la Riviera Golf",
    nameEn: " Riviera Golf Grand Mosque",
    nameAr: "مسجد ريفييرا غولف الكبير",
    address: "Riviera Golf, Cocody, Abidjan",
    city: "Abidjan",
    lat: 5.3405,
    lng: -3.9789,
    description: "Un des principaux centres spirituels d'Abidjan, célèbre pour sa beauté architecturale.",
    descriptionEn: "One of the main spiritual centers in Abidjan, famous for its architectural beauty.",
    descriptionAr: "من المراكز الروحية الرئيسية في أبيدجان، يشتهر بجماله المعماري."
  },
  {
    name: "Mosquée Al-Fatah de Treichville",
    nameEn: "Al-Fatah Mosque of Treichville",
    nameAr: "مسجد الفتح في تريشفيل",
    address: "Avenue Christiani, Treichville, Abidjan",
    city: "Abidjan",
    lat: 5.3082,
    lng: -4.0154,
    description: "Une mosquée historique au cœur de la commune vibrante de Treichville.",
    descriptionEn: "A historic mosque at the heart of the vibrant commune of Treichville.",
    descriptionAr: "مسجد تاريخي في قلب بلدية تريشفيل النابضة بالحياة."
  },
  // Bamako
  {
    name: "Grande Mosquée de Bamako",
    nameEn: "Grand Mosque of Bamako",
    nameAr: "مسجد باماكو الكبير",
    address: "Centre-ville, Bagadadji, Bamako",
    city: "Bamako",
    lat: 12.6465,
    lng: -7.9945,
    description: "Érigée sur l'emplacement d'une mosquée en terre précoloniale, financée par l'Arabie Saoudite.",
    descriptionEn: "Erected on the site of a pre-colonial mud mosque, funded by Saudi Arabia.",
    descriptionAr: "بني على موقع مسجد طيني من حقبة ما قبل الاستعمار، بتمويل من المملكة العربية السعودية."
  },
  // Niamey
  {
    name: "Grande Mosquée de Niamey",
    nameEn: "Grand Mosque of Niamey",
    nameAr: "مسجد نيامي الكبير",
    address: "Avenue du Sultan, Niamey",
    city: "Niamey",
    lat: 13.5204,
    lng: 2.1287,
    description: "Un joyau culturel et religieux majeur offert par la Libye au peuple nigérien.",
    descriptionEn: "A major cultural and religious jewel gifted by Libya to the Nigerien people.",
    descriptionAr: "جوهرة ثقافية ودينية كبرى أهدتها ليبيا للشعب النيجري."
  },
  // Paris
  {
    name: "Grande Mosquée de Paris",
    nameEn: "Grand Mosque of Paris",
    nameAr: "مسجد باريس الكبير",
    address: "2bis Place du Puits de l'Ermite, 75005 Paris",
    city: "Paris",
    lat: 48.8419,
    lng: 2.3551,
    description: "Inaugurée en 1926, de style hispano-mauresque avec un magnifique minaret de 33 mètres.",
    descriptionEn: "Inaugurated in 1926, in Hispano-Moorish style with a magnificent 33-meter minaret.",
    descriptionAr: "تم افتتاحه في عام ١٩٢٦، على الطراز الإسباني الموريسكي مع مئذنة رائعة يبلغ ارتفاعها ٣٣ مترًا."
  },
  {
    name: "Mosquée d'Évry-Courcouronnes",
    nameEn: "Evry-Courcouronnes Mosque",
    nameAr: "مسجد إيفري كوركورون",
    address: "20 Rue de l'Association, 91000 Évry",
    city: "Paris",
    lat: 48.6231,
    lng: 2.4289,
    description: "L'un des plus grands centres islamiques de France, combinant architecture moderne et artisanat marocain.",
    descriptionEn: "One of the largest Islamic centers in France, combining modern architecture and Moroccan craftsmanship.",
    descriptionAr: "واحد من أكبر المراكز الإسلامية في فرنسا، يجمع بين العمارة الحديثة والحرفية المغربية التقليدية."
  }
];

interface City {
  name: string;
  nameAr: string;
  country: string;
  countryAr: string;
  lat: number;
  lng: number;
  bearing: number; // calculated manually for easy reference
  distance: number; // in km
  mosques: Mosque[];
}

const CITIES: City[] = [
  {
    name: "Dakar",
    nameAr: "دكار",
    country: "Sénégal",
    countryAr: "السنغال",
    lat: 14.7167,
    lng: -17.4677,
    bearing: 67.5,
    distance: 6220,
    mosques: PRESET_MOSQUES.filter(m => m.city === "Dakar")
  },
  {
    name: "Abidjan",
    nameAr: "أبيدجان",
    country: "Côte d'Ivoire",
    countryAr: "ساحل العاج",
    lat: 5.3600,
    lng: -4.0083,
    bearing: 64.3,
    distance: 5740,
    mosques: PRESET_MOSQUES.filter(m => m.city === "Abidjan")
  },
  {
    name: "Bamako",
    nameAr: "باماكو",
    country: "Mali",
    countryAr: "مالي",
    lat: 12.6392,
    lng: -8.0029,
    bearing: 67.1,
    distance: 5850,
    mosques: PRESET_MOSQUES.filter(m => m.city === "Bamako")
  },
  {
    name: "Niamey",
    nameAr: "نيامي",
    country: "Niger",
    countryAr: "النيجر",
    lat: 13.5116,
    lng: 2.1254,
    bearing: 72.8,
    distance: 4940,
    mosques: PRESET_MOSQUES.filter(m => m.city === "Niamey")
  },
  {
    name: "Paris",
    nameAr: "باريس",
    country: "France",
    countryAr: "فرنسا",
    lat: 48.8566,
    lng: 2.3522,
    bearing: 119.2,
    distance: 4430,
    mosques: PRESET_MOSQUES.filter(m => m.city === "Paris")
  }
];

// Check for Google Maps Platform Key
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";
const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY" && API_KEY.length > 10;

export default function Pratique({ onShowToast }: { onShowToast: (m: string, t?: "success" | "info" | "warning") => void }) {
  const { language, t } = useLanguage();
  const [selectedCity, setSelectedCity] = useState<City>(CITIES[0]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [calculatedBearing, setCalculatedBearing] = useState<number>(CITIES[0].bearing);
  const [calculatedDistance, setCalculatedDistance] = useState<number>(CITIES[0].distance);
  const [isLocating, setIsLocating] = useState(false);
  const [heading, setHeading] = useState<number | null>(null); // Real phone heading if available

  // Calculate bearing and distance mathematically
  const calculateQibla = (lat: number, lng: number) => {
    // Bearing formula
    const dLng = (MECCA_LNG - lng) * Math.PI / 180;
    const lat1 = lat * Math.PI / 180;
    const lat2 = MECCA_LAT * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;

    // Haversine distance formula
    const R = 6371; // Earth radius in km
    const dLat = (MECCA_LAT - lat) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1) * Math.cos(lat2) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = Math.round(R * c);

    return { bearing, distance };
  };

  // Get user geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      onShowToast(
        language === "ar" 
          ? "تحديد الموقع الجغرافي غير مدعوم في متصفحك." 
          : language === "en" 
            ? "Geolocation is not supported by your browser." 
            : "La géolocalisation n'est pas supportée par votre navigateur.", 
        "warning"
      );
      return;
    }

    setIsLocating(true);
    onShowToast(
      language === "ar" 
        ? "جاري تحديد موقعك عبر الـ GPS..." 
        : language === "en" 
          ? "Retrieving your GPS position..." 
          : "Recherche de votre position GPS en cours...", 
      "info"
    );

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        
        const { bearing, distance } = calculateQibla(latitude, longitude);
        setCalculatedBearing(bearing);
        setCalculatedDistance(distance);
        
        setIsLocating(false);
        onShowToast(
          language === "ar" 
            ? "🎯 تم تحديد موقعك! تم ضبط بوصلة القبلة بنجاح." 
            : language === "en" 
              ? "🎯 GPS position detected! Qibla compass aligned." 
              : "🎯 Position GPS détectée ! Boussole de Qibla ajustée.", 
          "success"
        );
      },
      (error) => {
        setIsLocating(false);
        onShowToast(
          language === "ar" 
            ? "تعذر الحصول على موقعك. تم الرجوع للمدن الافتراضية." 
            : language === "en" 
              ? "Unable to retrieve your location. Using default preset cities." 
              : "Impossible d'obtenir votre position. Utilisation des villes prédéfinies.", 
          "warning"
        );
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Listen to device orientation (compass sensors on smartphones)
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      // webkitCompassHeading is supported on iOS Safari
      const compassHeading = (event as any).webkitCompassHeading;
      if (compassHeading !== undefined && compassHeading !== null) {
        setHeading(compassHeading);
      } else if (event.alpha !== null && event.absolute) {
        // alpha on android absolute sensor
        setHeading(360 - event.alpha);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  // Update calculations when city selection changes
  const handleCityChange = (city: City) => {
    setSelectedCity(city);
    setUserCoords(null);
    setCalculatedBearing(city.bearing);
    setCalculatedDistance(city.distance);
  };

  // Calculate the rotation angle of the compass dial
  const dialRotation = heading !== null ? -heading : 0;
  const needleRotation = calculatedBearing + dialRotation;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {language === "ar" ? "أدوات عملية" : language === "en" ? "Practical Tools" : "Outils Pratiques"}
        </h1>
        <p className="text-sm text-slate-500">
          {language === "ar" 
            ? "ابحث عن اتجاه القبلة وحدد مواقع المساجد في منطقتك بنقرة واحدة."
            : language === "en"
              ? "Find the Qibla direction and locate local mosques in your area in one click."
              : "Trouvez la direction de la Qibla et localisez les mosquées de votre secteur en un clic."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Qibla Compass (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-800">
                    {language === "ar" ? "بوصلة القبلة" : language === "en" ? "Qibla Compass" : "Boussole de la Qibla"}
                  </h2>
                </div>
                <button
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
                  <span>GPS</span>
                </button>
              </div>

              {/* City Selection dropdown */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {language === "ar" ? "المرجع الجغرافي" : language === "en" ? "Geographical Reference" : "Référence géographique"}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CITIES.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => handleCityChange(city)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        selectedCity.name === city.name && !userCoords
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100"
                      }`}
                    >
                      {language === "ar" ? city.nameAr : city.name} ({language === "ar" ? city.countryAr : city.country})
                    </button>
                  ))}
                </div>
              </div>

              {/* Angle & Distance Stats Info Card */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {language === "ar" ? "زاوية القبلة" : language === "en" ? "Qibla Angle" : "Angle de Qibla"}
                  </div>
                  <div className="text-lg font-bold text-slate-800">{Math.round(calculatedBearing * 10) / 10}°</div>
                  <div className="text-[10px] text-slate-500">
                    {language === "ar" ? "من الشمال (شرقاً)" : language === "en" ? "from North (East)" : "depuis le Nord (Est)"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {language === "ar" ? "المسافة إلى الكعبة" : language === "en" ? "Distance to Kaaba" : "Distance de la Kaaba"}
                  </div>
                  <div className="text-lg font-bold text-emerald-700">{calculatedDistance.toLocaleString()} km</div>
                  <div className="text-[10px] text-slate-500">
                    {language === "ar" ? "خط مباشر" : language === "en" ? "Direct path" : "Trajet direct à vol d'oiseau"}
                  </div>
                </div>
              </div>
            </div>

            {/* Compass Visual representation */}
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative w-60 h-60 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center shadow-lg overflow-hidden">
                
                {/* Dial Markings */}
                <div className="absolute inset-0 p-4 opacity-30 text-white font-mono text-[9px] flex flex-col justify-between items-center select-none pointer-events-none">
                  <div>{language === "ar" ? "شمال" : "N"} (0°)</div>
                  <div className="flex justify-between w-full px-2">
                    <span>{language === "ar" ? "غرب" : "W"} (270°)</span>
                    <span>{language === "ar" ? "شرق" : "E"} (90°)</span>
                  </div>
                  <div>{language === "ar" ? "جنوب" : "S"} (180°)</div>
                </div>

                {/* Compass Circle Dial (Rotates with mobile orientation) */}
                <div 
                  className="absolute inset-0 transition-transform duration-300"
                  style={{ transform: `rotate(${dialRotation}deg)` }}
                >
                  <div className="absolute inset-4 rounded-full border border-dashed border-slate-700"></div>
                  <div className="absolute inset-12 rounded-full border border-slate-800"></div>
                </div>

                {/* Qibla Indicator Sector */}
                <div 
                  className="absolute inset-0 pointer-events-none transition-transform duration-300 flex justify-center"
                  style={{ transform: `rotate(${calculatedBearing}deg)` }}
                >
                  <div className="w-1 h-1/2 bg-gradient-to-t from-transparent to-emerald-500/30 origin-bottom absolute top-0"></div>
                  <div className="absolute top-2 flex flex-col items-center">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span className="text-[8px] bg-emerald-600/90 text-white font-bold px-1.5 py-0.5 rounded-full uppercase mt-1 tracking-widest">
                      {language === "ar" ? "القبلة" : "QIBLA"}
                    </span>
                  </div>
                </div>

                {/* Magnetic Compass Needle (Rotates to align with bearing) */}
                <div 
                  className="absolute w-6 h-40 transition-all duration-300 ease-out"
                  style={{ transform: `rotate(${needleRotation}deg)` }}
                >
                  {/* North Needle */}
                  <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[80px] border-b-emerald-600 absolute bottom-1/2 left-1/2 -translate-x-1/2"></div>
                  
                  {/* South Needle */}
                  <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[80px] border-t-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2"></div>

                  {/* Center Pivot Pin */}
                  <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-md"></div>
                </div>
              </div>

              {/* Geolocation feedback details */}
              {userCoords ? (
                <p className="text-[11px] text-slate-500 mt-4 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  {language === "ar" 
                    ? `موقعك النشط: ${userCoords.lat.toFixed(4)}°، ${userCoords.lng.toFixed(4)}°`
                    : language === "en"
                      ? `Active location: ${userCoords.lat.toFixed(4)}°, ${userCoords.lng.toFixed(4)}°`
                      : `Géolocalisation active : ${userCoords.lat.toFixed(4)}°, ${userCoords.lng.toFixed(4)}°`}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-4 text-center leading-normal px-4">
                  {language === "ar"
                    ? `البوصلة مبنية على إحداثيات مدينة ${selectedCity.nameAr}. فعل موقع الـ GPS لتحديد أدق.`
                    : language === "en"
                      ? `Compass based on coordinates of ${selectedCity.name}. Activate GPS for your exact address.`
                      : `Boussole basée sur les coordonnées de ${selectedCity.name}. Activez la position GPS pour votre adresse exacte.`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Nearby Mosque Finder (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-800">
                    {language === "ar" ? "المساجد القريبة" : language === "en" ? "Nearby Mosques" : "Mosquées à Proximité"}
                  </h2>
                </div>
                {/* Search in Google Maps direct link */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=mosquee+a+proximite+${userCoords ? `${userCoords.lat},${userCoords.lng}` : selectedCity.name}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onShowToast(language === "ar" ? "جاري فتح خرائط Google..." : "Ouverture de Google Maps...", "success")}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <span>{language === "ar" ? "البحث في خرائط جوجل" : language === "en" ? "Google Maps GPS Search" : "Recherche GPS Google Maps"}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-xs text-slate-500 leading-normal">
                {language === "ar"
                  ? "تصفح خريطة المساجد ومراكز تعليم العلوم الإسلامية من حولك. يتغير النطاق تلقائيًا حسب المدينة المختارة أو موقع الـ GPS النشط."
                  : language === "en"
                    ? "Visualize mosques and Islamic learning centers around you. Positions adjust automatically based on your selected city or GPS coordinates."
                    : "Visualisez les mosquées et centres islamiques d'apprentissage autour de vous. Les positions s'ajustent automatiquement selon votre ville sélectionnée ou vos coordonnées GPS."}
              </p>

              {/* Map Panel Box */}
              <div className="relative rounded-xl border border-slate-100 overflow-hidden h-72 bg-slate-100">
                {hasValidKey ? (
                  /* Real Google Map rendering */
                  <APIProvider apiKey={API_KEY} version="weekly">
                    <Map
                      defaultCenter={{ lat: selectedCity.lat, lng: selectedCity.lng }}
                      center={userCoords || { lat: selectedCity.lat, lng: selectedCity.lng }}
                      defaultZoom={13}
                      mapId="QALAM_MAP_ID"
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                      style={{ width: '100%', height: '100%' }}
                    >
                      {/* User Location Marker */}
                      {userCoords && (
                        <AdvancedMarker position={userCoords} title="Votre Position">
                          <Pin background="#ea4335" glyphColor="#fff" scale={1.1} />
                        </AdvancedMarker>
                      )}

                      {/* Mosque Markers */}
                      {(userCoords ? PRESET_MOSQUES : selectedCity.mosques).map((mosque, idx) => (
                        <AdvancedMarker 
                          key={idx} 
                          position={{ lat: mosque.lat, lng: mosque.lng }} 
                          title={language === "ar" ? mosque.nameAr : language === "en" ? mosque.nameEn : mosque.name}
                        >
                          <Pin background="#059669" glyphColor="#fff" />
                        </AdvancedMarker>
                      ))}
                    </Map>
                  </APIProvider>
                ) : (
                  /* Simulated beautiful custom radar/map mockup */
                  <div className="absolute inset-0 bg-slate-950 flex flex-col justify-between p-4 overflow-hidden select-none">
                    
                    {/* Background Radar Rings */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                      <div className="w-96 h-96 rounded-full border border-emerald-500 animate-pulse"></div>
                      <div className="w-72 h-72 rounded-full border border-emerald-500/60"></div>
                      <div className="w-48 h-48 rounded-full border border-emerald-500/40"></div>
                      <div className="w-24 h-24 rounded-full border border-emerald-500/20"></div>
                      
                      {/* Radar sweep */}
                      <div className="w-1 h-48 bg-gradient-to-t from-emerald-500 to-transparent origin-bottom absolute bottom-1/2 left-1/2 rotate-45 transform"></div>
                    </div>

                    {/* Simulation header */}
                    <div className="flex justify-between items-center relative z-10">
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                        <Activity className="w-3 h-3 animate-pulse" />
                        {language === "ar" ? "رادار البحث نشط" : language === "en" ? "Active Search Radar" : "Radar de recherche actif"}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {userCoords ? (language === "ar" ? "نظام الـ GPS" : "GPS local") : (language === "ar" ? selectedCity.nameAr : `${selectedCity.name} / ${selectedCity.country}`)}
                      </span>
                    </div>

                    {/* Simulated Markers Overlay representing mosques */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Central User Position Pin */}
                      <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white relative shadow-lg z-20">
                        <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></span>
                      </div>

                      {/* Simulated Mosques Coordinates on Screen around center */}
                      {(userCoords ? PRESET_MOSQUES : selectedCity.mosques).map((mosque, idx) => {
                        const xOffset = Math.sin(mosque.lat * (idx + 1)) * 90;
                        const yOffset = Math.cos(mosque.lng * (idx + 1)) * 70;

                        return (
                          <div 
                            key={idx}
                            className="absolute flex flex-col items-center group cursor-pointer z-10 transition-transform hover:scale-110"
                            style={{ transform: `translate(${xOffset}px, ${yOffset}px)` }}
                            onClick={() => onShowToast(`📌 Target : ${language === "ar" ? mosque.nameAr : language === "en" ? mosque.nameEn : mosque.name}`, "info")}
                          >
                            <div className="p-1 rounded-lg bg-emerald-600 text-white border border-emerald-400 shadow-md">
                              <Compass className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[9px] bg-slate-900/95 text-white border border-slate-800 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap mt-1 max-w-[120px] truncate">
                              {language === "ar" ? mosque.nameAr.replace("مسجد ", "") : language === "en" ? mosque.nameEn.replace("Mosque", "") : mosque.name.replace("Mosquée ", "")}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Simulation footer / explanation */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 relative z-10 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {language === "ar" ? (
                          <>
                            <span className="font-semibold text-slate-200">وضع المحاكاة نشط.</span> لعرض خريطة حقيقية متكاملة بخرائط جوجل في الوقت الفعلي، يرجى إدخال رمز المفتاح الخاص بك في إعدادات <span className="font-mono text-emerald-400">GOOGLE_MAPS_PLATFORM_KEY</span>.
                          </>
                        ) : language === "en" ? (
                          <>
                            <span className="font-semibold text-slate-200">Map simulation mode active.</span> To view a real interactive satellite map with live GPS, please add your <span className="font-mono text-emerald-400">GOOGLE_MAPS_PLATFORM_KEY</span> inside AI Studio Secrets (settings button in the top right).
                          </>
                        ) : (
                          <>
                            <span className="font-semibold text-slate-200">Mode simulation de carte activé.</span> Pour voir une vraie carte satellite interactive avec position Google Maps en temps réel, ajoutez votre clé API <span className="font-mono text-emerald-400">GOOGLE_MAPS_PLATFORM_KEY</span> dans les Secrets d'AI Studio (bouton de configuration en haut à droite).
                          </>
                        )}
                      </p>
                    </div>

                  </div>
                )}
              </div>

              {/* List of nearby mosques with beautiful cards */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                  {userCoords 
                    ? (language === "ar" ? "المساجد القريبة المسجلة" : language === "en" ? "Registered mosques nearby" : "Mosquées recensées à proximité") 
                    : (language === "ar" ? `المساجد الهامة في ${selectedCity.nameAr}` : language === "en" ? `Important mosques in ${selectedCity.name}` : `Mosquées importantes à ${selectedCity.name}`)}
                </h3>

                {(userCoords ? PRESET_MOSQUES : selectedCity.mosques).map((mosque, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-emerald-200 transition-all gap-3 text-start"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 text-xs leading-snug">
                        {language === "ar" ? mosque.nameAr : language === "en" ? mosque.nameEn : mosque.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        {language === "ar" ? mosque.descriptionAr : language === "en" ? mosque.descriptionEn : mosque.description}
                      </p>
                      <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 pt-1">
                        <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{mosque.address}</span>
                      </div>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((language === "ar" ? mosque.nameAr : mosque.name) + ", " + mosque.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg shrink-0 hover:text-emerald-600 transition-colors"
                      title="Ouvrir dans Google Maps"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
