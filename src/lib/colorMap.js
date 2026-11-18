/**
 * Mapa de noms de colors en català → hex CSS
 * Font: Els colors són assignats per l'anàlisi AI (Gemini) en català.
 * Ús: Visualització de la paleta de colors al WardrobeStatsCard.
 */

const COLOR_MAP = {
  // Negres i grisos
  'negre': '#1a1a1a',
  'gris fosc': '#4a4a4a',
  'gris': '#808080',
  'gris clar': '#b0b0b0',
  'antracita': '#2d2d2d',
  'carbó': '#333333',

  // Blancs i neutres
  'blanc': '#f5f5f5',
  'blanc trencat': '#f0ece2',
  'crema': '#f5f0e1',
  'cru': '#ece4d4',
  'beix': '#d4c5a9',
  'camel': '#c19a6b',
  'caramel': '#a67b5b',
  'ivori': '#fffff0',
  'perla': '#eae0c8',
  'sorra': '#c2b280',
  'taupe': '#8b7d6b',

  // Blaus
  'blau': '#3b82f6',
  'blau marí': '#1e3a5f',
  'blau cel': '#87ceeb',
  'blau elèctric': '#0066ff',
  'blau petroli': '#006064',
  'blau cobalt': '#0047ab',
  'blau pastel': '#aec6cf',
  'blau reial': '#4169e1',
  'blau fosc': '#1a237e',
  'blau clar': '#add8e6',
  'turquesa': '#40e0d0',
  'aqua': '#00ced1',
  'blau denim': '#1560bd',

  // Verds
  'verd': '#4caf50',
  'verd oliva': '#6b7c3f',
  'verd fosc': '#1b5e20',
  'verd menta': '#98fb98',
  'verd esmeralda': '#046307',
  'verd militar': '#4b5320',
  'verd bosc': '#228b22',
  'verd salvia': '#9caf88',
  'verd kaki': '#8a7e65',
  'verd clar': '#90ee90',
  'verd llima': '#cddc39',
  'kaki': '#8a7e65',

  // Vermells
  'vermell': '#dc2626',
  'vermell fosc': '#8b0000',
  'vermell clar': '#ef5350',
  'granat': '#800020',
  'bordeus': '#722f37',
  'corall': '#ff7f50',
  'carmesí': '#dc143c',
  'terracota': '#cc5c3b',

  // Roses
  'rosa': '#f06292',
  'rosa pàl·lid': '#f8bbd0',
  'rosa fosc': '#c2185b',
  'rosa pastel': '#fadadd',
  'fúcsia': '#ff00ff',
  'salmó': '#fa8072',
  'magenta': '#e91e63',

  // Taronges
  'taronja': '#ff9800',
  'taronja fosc': '#e65100',
  'taronja clar': '#ffb74d',
  'meló': '#fdbcb4',
  'mandarina': '#ff8c00',
  'coure': '#b87333',
  'caldera': '#b5651d',
  'rovell': '#b7410e',

  // Grocs
  'groc': '#fdd835',
  'groc mostassa': '#c4a000',
  'groc pastel': '#fff9c4',
  'groc fosc': '#f9a825',
  'daurat': '#d4af37',
  'or': '#d4af37',
  'mostassa': '#c4a000',
  'àmbar': '#ffbf00',

  // Violetes i morats
  'lila': '#ce93d8',
  'morat': '#7b1fa2',
  'violeta': '#7c3aed',
  'lavanda': '#e6e6fa',
  'malva': '#e0b0ff',
  'pruna': '#6a0dad',
  'porpra': '#800080',
  'berenjena': '#614051',

  // Marrons
  'marró': '#795548',
  'marró fosc': '#4e342e',
  'marró clar': '#a1887f',
  'xocolata': '#3e2723',
  'castany': '#954535',
  'cogny': '#9f4e28',
  'toffee': '#755139',
  'tabac': '#71543e',

  // Especials
  'daurat': '#d4af37',
  'platejat': '#c0c0c0',
  'bronze': '#cd7f32',
  'multicolor': '#ff6b6b',
  'denim': '#1560bd',
}

/**
 * Genera un color hex determinista a partir d'un string
 * per a colors no mapeats.
 */
function hashToColor(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  // Generar HSL amb saturació i lluminositat agradables
  const h = Math.abs(hash) % 360
  return `hsl(${h}, 55%, 50%)`
}

/**
 * Retorna el valor hex/hsl CSS per un nom de color en català.
 * Primer intenta match exacte, després parcial, finalment hash.
 */
export function getColorHex(colorName) {
  if (!colorName) return '#808080'
  
  const normalized = colorName.toLowerCase().trim()
  
  // Match exacte
  if (COLOR_MAP[normalized]) return COLOR_MAP[normalized]
  
  // Match parcial: busca si alguna clau conté el nom o viceversa
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return hex
    }
  }
  
  // Fallback: color generat per hash
  return hashToColor(normalized)
}

export default COLOR_MAP
