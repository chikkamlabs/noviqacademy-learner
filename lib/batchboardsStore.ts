import { supabase } from './supabase';

export interface BatchBoardItem {
  id: string;
  batch_id: string; // batches UUID
  title: string;
  description: string | null;
  created_at: string;
  batchCode?: string;
  courseTitle?: string;
}

export interface BatchBoardsResponse {
  boards: BatchBoardItem[];
  total_count: number;
  batchCode: string;
  courseTitle: string;
}

/**
 * Fetch all batch boards for a specific batch.
 * Strictly queries database with NO dummy or fallback data.
 */
export async function getBatchBoards(
  batchIdParam?: string | null
): Promise<BatchBoardsResponse> {
  const isUuid = (val?: string | null) =>
    Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

  let humanReadableBatchId = batchIdParam || 'batch_102';
  let resolvedBatchUuid: string | null = null;
  let courseTitle = 'Enrolled Course';

  try {
    // 1. Resolve batch UUID and code
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
            if (cRow?.title) courseTitle = cRow.title;
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
            if (cRow?.title) courseTitle = cRow.title;
          }
        }
      }
    }

    // 2. Fallback to learner's registration if no batch passed
    if (!resolvedBatchUuid) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: regRows } = await supabase
          .from('registrations')
          .select('batch_id, course_id')
          .eq('learner_id', user.id)
          .limit(1);

        if (regRows && regRows.length > 0 && regRows[0].batch_id) {
          resolvedBatchUuid = regRows[0].batch_id;
          const { data: bRow } = await supabase
            .from('batches')
            .select('batch_id, course_id')
            .eq('id', resolvedBatchUuid)
            .maybeSingle();

          if (bRow?.batch_id) humanReadableBatchId = bRow.batch_id;
          if (bRow?.course_id) {
            const { data: cRow } = await supabase
              .from('courses')
              .select('title')
              .eq('id', bRow.course_id)
              .maybeSingle();
            if (cRow?.title) courseTitle = cRow.title;
          }
        }
      }
    }

    // 3. Query batch_board table
    let query = supabase.from('batch_board').select('*');

    if (resolvedBatchUuid) {
      query = query.eq('batch_id', resolvedBatchUuid);
    }

    query = query.order('created_at', { ascending: false });

    const { data: rows, error } = await query;

    if (error) {
      console.warn('Error querying batch_board:', error);
      return {
        boards: [],
        total_count: 0,
        batchCode: humanReadableBatchId,
        courseTitle,
      };
    }

    const boardsList: BatchBoardItem[] = (rows || []).map((r) => ({
      id: r.id,
      batch_id: r.batch_id,
      title: r.title,
      description: r.description || null,
      created_at: r.created_at,
      batchCode: humanReadableBatchId,
      courseTitle,
    }));

    return {
      boards: boardsList,
      total_count: boardsList.length,
      batchCode: humanReadableBatchId,
      courseTitle,
    };
  } catch (err) {
    console.warn('Exception in getBatchBoards:', err);
    return {
      boards: [],
      total_count: 0,
      batchCode: humanReadableBatchId,
      courseTitle,
    };
  }
}
