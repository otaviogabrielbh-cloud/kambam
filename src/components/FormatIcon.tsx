import React from 'react';
import {
  Youtube,
  Zap,
  Instagram,
  Layers,
  Mail,
  FileText,
  PenTool,
  Megaphone,
  Video,
  Image as ImageIcon,
  Podcast,
  MessageSquare,
  Newspaper,
  Rss,
  Mic,
  Camera,
  Clapperboard,
  BookOpen,
  Globe,
  Linkedin,
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Youtube,
  Zap,
  Instagram,
  Layers,
  Mail,
  FileText,
  PenTool,
  Megaphone,
  Video,
  Image: ImageIcon,
  Podcast,
  MessageSquare,
  Newspaper,
  Rss,
  Mic,
  Camera,
  Clapperboard,
  BookOpen,
  Globe,
  Linkedin,
};

export const FORMAT_ICON_OPTIONS = Object.keys(ICONS);

interface FormatIconProps {
  iconName?: string;
  className?: string;
}

export const FormatIcon: React.FC<FormatIconProps> = ({ iconName, className }) => {
  if (!iconName) return null;
  const Icon = ICONS[iconName];
  if (!Icon) return null;
  return <Icon className={className} />;
};