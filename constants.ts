
export const THEME_COLORS = {
  background: '#050103',
  pinkSoft: '#FFB7C5',
  pinkHot: '#FF69B4',
  purple: '#A855F7',
  gold: '#FACC15',
  white: '#FFFFFF',
  lavender: '#E6E6FA',
  glow: '#FF1493'
};

export type AppState = 'TREE' | 'EXPLODE';
export type ColorTheme = 'PINK' | 'PURPLE' | 'GOLD';
export type GestureType = 'GRAB' | 'OPEN' | 'THUMBS_UP' | 'OK' | 'THREE_FINGERS';

export const TREE_CONFIG = {
  height: 12,
  baseRadius: 4.5,
  leafCount: 7000,
  ornamentCount: 800,
  octahedronDetail: 0,
  ribbonTurns: 3.5,
  ribbonSegments: 400,
  lerpSpeed: 0.06,
  explodeRadius: 20,
  spreadMultipler: 1.8
};
