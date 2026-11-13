import { supabase } from './supabase';

export interface WorkshopItem {
  id: string;
  title: string;
  description: string;
  learnings: string[];
  date: string;
  time: string;
  mode: string;
  duration: string;
  registrations_link: string;
  tag: string;
  preview_image_link: string;
  status: string;
  whatsapp_group_link: string;
  created_at?: string;
}

function parseLearnings(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return raw
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function normalizeWorkshop(row: Record<string, unknown>): WorkshopItem {
  return {
    id: String(row.id ?? ''),
    title: String(row.title ?? 'Workshop'),
    description: row.description ? String(row.description) : '',
    learnings: parseLearnings(row.learnings),
    date: row.date ? String(row.date) : '',
    time: row.time ? String(row.time) : '',
    mode: row.mode ? String(row.mode) : 'online',
    duration: row.duration ? String(row.duration) : '',
    registrations_link: row.registrations_link ? String(row.registrations_link) : '',
    tag: row.tag ? String(row.tag) : '',
    preview_image_link: row.preview_image_link ? String(row.preview_image_link) : '',
    status: row.status ? String(row.status) : 'active',
    whatsapp_group_link: row.whatsapp_group_link ? String(row.whatsapp_group_link) : '',
    created_at: row.created_at ? String(row.created_at) : undefined,
  };
}

export function formatWorkshopDate(dateStr?: string | null): string {
  if (!dateStr) return 'TBA';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export async function getAllWorkshops(): Promise<WorkshopItem[]> {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select(
        'id, title, description, learnings, date, time, mode, duration, registrations_link, tag, preview_image_link, status, whatsapp_group_link, created_at'
      )
      .neq('status', 'deactivated')
      .order('date', { ascending: true });

    if (error || !data) {
      if (error) {
        console.warn('Error fetching workshops:', error.message);
      }
      return [];
    }

    return data.map((row) => normalizeWorkshop(row as Record<string, unknown>));
  } catch (err) {
    console.warn('Exception fetching workshops:', err);
    return [];
  }
}

export async function getWorkshopById(id: string): Promise<WorkshopItem | null> {
  if (!id) return null;

  try {
    const { data, error } = await supabase
      .from('workshops')
      .select(
        'id, title, description, learnings, date, time, mode, duration, registrations_link, tag, preview_image_link, status, whatsapp_group_link, created_at'
      )
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return normalizeWorkshop(data as Record<string, unknown>);
  } catch (err) {
    console.warn('Exception fetching workshop by id:', err);
    return null;
  }
}
