export interface TeamColor {
  primary: string;
  secondary: string;
  text: string;
}

export const TEAM_COLORS: { [key: string]: TeamColor } = {
  'red_bull': {
    primary: '#0600EF',
    secondary: '#1E1E3F',
    text: '#FFFFFF'
  },
  'mercedes': {
    primary: '#00D2BE',
    secondary: '#000000',
    text: '#FFFFFF'
  },
  'ferrari': {
    primary: '#DC0000',
    secondary: '#FFF200',
    text: '#FFFFFF'
  },
  'mclaren': {
    primary: '#FF8700',
    secondary: '#47C7FC',
    text: '#FFFFFF'
  },
  'alpine': {
    primary: '#0090FF',
    secondary: '#FF1E5B',
    text: '#FFFFFF'
  },
  'aston_martin': {
    primary: '#006F62',
    secondary: '#CEDC00',
    text: '#FFFFFF'
  },
  'haas': {
    primary: '#FFFFFF',
    secondary: '#787878',
    text: '#000000'
  },
  'rb': {
    primary: '#6692FF',
    secondary: '#1E1E3F',
    text: '#FFFFFF'
  },
  'williams': {
    primary: '#005AFF',
    secondary: '#00A0DE',
    text: '#FFFFFF'
  },
  'sauber': {
    primary: '#52E252',
    secondary: '#000000',
    text: '#FFFFFF'
  }
};

export function getTeamColor(constructorId: string): TeamColor {
  return TEAM_COLORS[constructorId] || {
    primary: '#00f0ff',
    secondary: '#1a1a1a',
    text: '#FFFFFF'
  };
}

export function getTeamPrimaryColor(constructorId: string): string {
  return getTeamColor(constructorId).primary;
}

// getTeamColor(constructorId: string): string {
//         const colors: any = {
//             'red_bull': '#0600ef',
//             'mercedes': '#00d2be',
//             'ferrari': '#dc0000',
//             'mclaren': '#ff8700',
//             'alpine': '#037af0',
//             'aston_martin': '#016860',
//             'haas': '#ffffff',
//             'rb': '#0000fe',
//             'williams': '#01a3e6',
//             'sauber': '#02ce05'
//         };
//         return colors[constructorId] || '#00f0ff';
//     }