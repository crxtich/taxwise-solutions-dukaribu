import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key, value");
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach((r: any) => { map[r.key] = r.value; });
      return map;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stats").select("*").order("sort_order");
      if (error) throw error;
      return data as { id: string; value: string; label: string }[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useOffices() {
  return useQuery({
    queryKey: ["offices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("offices").select("*").order("sort_order");
      if (error) throw error;
      return data as { id: string; name: string; city: string; address: string | null; po_box: string | null; phone: string; email: string; map_url: string | null }[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("sort_order");
      if (error) throw error;
      return data as { id: string; title: string; description: string; icon_name: string; details: string[] }[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useComplianceData() {
  return useQuery({
    queryKey: ["compliance_data"],
    queryFn: async () => {
      const [sectionsRes, questionsRes] = await Promise.all([
        supabase.from("compliance_sections").select("*").order("sort_order"),
        supabase.from("compliance_questions").select("*").order("sort_order"),
      ]);
      if (sectionsRes.error) throw sectionsRes.error;
      if (questionsRes.error) throw questionsRes.error;
      const sections = (sectionsRes.data as any[]).map((s) => ({
        ...s,
        questions: (questionsRes.data as any[]).filter((q) => q.section_id === s.id),
      }));
      return sections as { id: string; code: string; title: string; questions: { id: string; question_number: number; text: string; is_reverse_scored: boolean }[] }[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useTrainingTopics() {
  return useQuery({
    queryKey: ["training_topics"],
    queryFn: async () => {
      const { data, error } = await supabase.from("training_topics").select("*").order("sort_order");
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useTrainingFormats() {
  return useQuery({
    queryKey: ["training_formats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("training_formats").select("*").order("sort_order");
      if (error) throw error;
      return data as { id: string; title: string; description: string }[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useDocumentSteps() {
  return useQuery({
    queryKey: ["document_steps"],
    queryFn: async () => {
      const { data, error } = await supabase.from("document_steps").select("*").order("sort_order");
      if (error) throw error;
      return data as { id: string; title: string; description: string; icon_name: string }[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useDocumentFolders() {
  return useQuery({
    queryKey: ["document_folders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("document_folders").select("*").order("sort_order");
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useJobTypes() {
  return useQuery({
    queryKey: ["job_types"],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_types").select("*").order("sort_order");
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
    staleTime: 1000 * 60 * 10,
  });
}
