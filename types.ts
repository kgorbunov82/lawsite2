export enum LeadStatus {
  NEW = 'Новый',
  ANALYSIS = 'Анализ',
  WON = 'В работе',
  LOST = 'Архив'
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  issue: string;
  status: LeadStatus;
  date: string;
  source: 'form' | 'chat';
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image?: string;
}

export interface SiteContent {
  // Images
  logoText: string;
  heroImage: string;
  profileImage: string;

  // Hero & About
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  education: string;
  status: string;
  statsExperience: string;
  statsRecovered: string;
  
  // Expertise (Static text block from prompt)
  expertiseText: string;
}

export const DEFAULT_CONTENT: SiteContent = {
  logoText: "Горбунов Константин. Адвокат",
  heroImage: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1974&auto=format&fit=crop",
  profileImage: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1470&auto=format&fit=crop",
  
  heroTitle: "Защита активов в эпоху перемен",
  heroSubtitle: "Специализация: корпоративные споры, банкротство, облигационные споры.",
  statsExperience: "20+",
  statsRecovered: "2.5 млрд ₽",
  aboutText: "Я — Константин Горбунов, адвокат МСКА «Экзитум». Работаю в точке, где пересекаются право, экономика и стратегия. Моя задача — не просто выиграть спор, но и создать работающий механизм защиты капитала. За последние годы я сформировал практику, ориентированную на облигационные споры, банкротства, корпоративные конфликты и судебные механизмы возврата активов.",
  education: "Военный Университет Министерства Обороны РФ 2004 год (диплом с отличием)",
  status: "Адвокат филиала Московской специализированной коллегии адвокатов «Экзитум»",
  
  expertiseText: "Специализация: корпоративные споры, банкротство, облигационные споры. Защита активов, минимизация рисков и выстраивание стратегии взыскания, которая приносит реальный результат."
};