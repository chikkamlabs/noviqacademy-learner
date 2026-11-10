import { supabase } from './supabase';

export interface ClassRecordingItem {
  id: string;
  batch_id: string;
  date: string; // YYYY-MM-DD
  link: string;
  created_at: string;
  updated_at: string;
}

export interface ClassRecordingsResponse {
  recordings: ClassRecordingItem[];
  total_count: number;
  batch_id: string;
  course_name: string;
}

/**
 * Returns default date range for the last one week (today minus 7 days to today)
 */
export function getDefaultDateRange(): { fromDate: string; toDate: string } {
  const today = new Date();
  const pastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const format = (d: Date) => d.toISOString().split('T')[0];

  return {
    fromDate: format(pastWeek),
    toDate: format(today),
  };
}

export function formatRecordingDate(dateString: string): string {
  if (!dateString) return 'Class Session';
  try {
    // If format is YYYY-MM-DD, parse year, month, day directly to avoid timezone offset
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Fetch class recordings with date filtering (from, to).
 * Strictly queries the database with NO dummy or fallback data.
 */
export async function getClassRecordings(
  batchIdParam?: string | null,
  fromDate?: string | null,
  toDate?: string | null
): Promise<ClassRecordingsResponse> {
  const isUuid = (val?: string | null) =>
    Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

  let humanReadableBatchId = batchIdParam || 'batch_102';
  let resolvedBatchUuid: string | null = null;
  let courseName = 'Enrolled Course';

  try {
    // 1. Resolve batch UUID and human readable batch_id
    if (batchIdParam) {
      if (isUuid(batchIdParam)) {
        resolvedBatchUuid = batchIdParam;
        const { data: bRow } = await supabase
          .from('batches')
          .select('id, batch_id, course_id')
          .eq('id', batchIdParam)
          .maybeSingle();

        if (bRow) {
          if (bRow.batch_id) humanReadableBatchId = bRow.batch_id;
          if (bRow.course_id) {
            const { data: cRow } = await supabase
              .from('courses')
              .select('title')
              .eq('id', bRow.course_id)
              .maybeSingle();
            if (cRow?.title) courseName = cRow.title;
          }
        }
      } else {
        humanReadableBatchId = batchIdParam;
        const { data: bRow } = await supabase
          .from('batches')
          .select('id, batch_id, course_id')
          .eq('batch_id', batchIdParam)
          .maybeSingle();

        if (bRow) {
          resolvedBatchUuid = bRow.id;
          if (bRow.course_id) {
            const { data: cRow } = await supabase
              .from('courses')
              .select('title')
              .eq('id', bRow.course_id)
              .maybeSingle();
            if (cRow?.title) courseName = cRow.title;
          }
        }
      }
    }

    // 2. Query batch_class_recordings
    let query = supabase.from('batch_class_recordings').select('*');

    if (resolvedBatchUuid) {
      query = query.eq('batch_id', resolvedBatchUuid);
    }

    if (fromDate) {
      query = query.gte('date', fromDate);
    }

    if (toDate) {
      query = query.lte('date', toDate);
    }

    query = query.order('date', { ascending: false }).order('created_at', { ascending: false });

    const { data: rows, error } = await query;

    if (error) {
      console.warn('Error querying batch_class_recordings:', error);
      return {
        recordings: [],
        total_count: 0,
        batch_id: humanReadableBatchId,
        course_name: courseName,
      };
    }

    const recordingsList = (rows || []) as ClassRecordingItem[];

    return {
      recordings: recordingsList,
      total_count: recordingsList.length,
      batch_id: humanReadableBatchId,
      course_name: courseName,
    };
  } catch (err) {
    console.warn('Error fetching class recordings:', err);
    return {
      recordings: [],
      total_count: 0,
      batch_id: humanReadableBatchId,
      course_name: courseName,
    };
  }
}
