import {
  BookOpen, FileCheck, Leaf, Building2, Shield, Receipt,
  FileText, BarChart3, GraduationCap, FolderOpen, Upload,
  type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  BookOpen, FileCheck, Leaf, Building2, Shield, Receipt,
  FileText, BarChart3, GraduationCap, FolderOpen, Upload,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] || FileText;
}
