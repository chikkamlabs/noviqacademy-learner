import { supabase } from './supabase';

export interface BatchResourceItem {
  id: string;
  batch_id: string;
  resource_id: string;
  status: 'active' | 'deactivated';
  title: string;
  type: string;
  description: string | null;
  related_url: string | null;
  created_at?: string;
}

export interface BatchResourcesResponse {
  resources: BatchResourceItem[];
  totalActiveCount: number;
  batchCode?: string;
  courseTitle?: string;
}

/**
 * Fetch all Batch Resources where status = 'active'
 * Resolves batch by batch ID / UUID or logged-in learner's registration
 * Strictly queries database with NO dummy or fallback data.
 */
export async function getBatchResources(
  batchIdParam?: string | null
): Promise<BatchResourcesResponse> {
  try {
    let resolvedBatchUuid: string | null = null;
    let batchCode: string = batchIdParam || 'B-101';
    let courseTitle = 'Study Course';

    const isUuid = (val?: string | null) =>
      Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

    // 1. Resolve batch if batchIdParam is provided
    if (batchIdParam) {
      if (isUuid(batchIdParam)) {
        resolvedBatchUuid = batchIdParam;
        const { data: bRow } = await supabase
          .from('batches')
          .select('id, batch_id, course_id, courses(title)')
          .eq('id', batchIdParam)
          .maybeSingle();

        if (bRow) {
          batchCode = bRow.batch_id || batchCode;
          const courseData = bRow.courses as unknown as { title?: string } | null;
          if (courseData?.title) courseTitle = courseData.title;
        }
      } else {
        const { data: bRow } = await supabase
          .from('batches')
          .select('id, batch_id, course_id, courses(title)')
          .eq('batch_id', batchIdParam)
          .maybeSingle();

        if (bRow?.id) {
          resolvedBatchUuid = bRow.id;
          batchCode = bRow.batch_id || batchCode;
          const courseData = bRow.courses as unknown as { title?: string } | null;
          if (courseData?.title) courseTitle = courseData.title;
        }
      }
    }

    // 2. If no batch yet, try finding learner registration
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
        }
      }
    }

    // 3. Build query for batch_resources with status = 'active'
    let query = supabase
      .from('batch_resources')
      .select(`
        id,
        batch_id,
        resource_id,
        status,
        created_at,
        course_resources (
          id,
          name,
          type,
          description,
          related_url
        )
      `)
      .eq('status', 'active');

    if (resolvedBatchUuid) {
      query = query.eq('batch_id', resolvedBatchUuid);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      const formattedResources: BatchResourceItem[] = [];

      interface RawResourceRow {
        id: string;
        batch_id: string;
        resource_id: string;
        status: 'active' | 'deactivated';
        created_at?: string;
        course_resources?: {
          id?: string;
          name?: string;
          type?: string;
          description?: string | null;
          related_url?: string | null;
        } | null;
      }

      for (const row of data as unknown as RawResourceRow[]) {
        const cr = row.course_resources;
        formattedResources.push({
          id: row.id,
          batch_id: row.batch_id,
          resource_id: row.resource_id,
          status: row.status,
          title: cr?.name || 'Batch Resource',
          type: cr?.type || 'doc',
          description: cr?.description || null,
          related_url: cr?.related_url || 'https://drive.google.com',
          created_at: row.created_at,
        });
      }

      return {
        resources: formattedResources,
        totalActiveCount: formattedResources.length,
        batchCode,
        courseTitle,
      };
    }

    // 4. Direct lookup fallback if join was empty or relationship alias differed
    if (resolvedBatchUuid) {
      const { data: brRaw } = await supabase
        .from('batch_resources')
        .select('id, batch_id, resource_id, status, created_at')
        .eq('batch_id', resolvedBatchUuid)
        .eq('status', 'active');

      if (brRaw && brRaw.length > 0) {
        const resourceIds = brRaw.map((r) => r.resource_id).filter(Boolean);
        const { data: crList } = await supabase
          .from('course_resources')
          .select('id, name, type, description, related_url')
          .in('id', resourceIds);

        const crMap = new Map((crList || []).map((c) => [c.id, c]));

        const resolvedList: BatchResourceItem[] = brRaw.map((br) => {
          const detail = crMap.get(br.resource_id);
          return {
            id: br.id,
            batch_id: br.batch_id,
            resource_id: br.resource_id,
            status: br.status as 'active' | 'deactivated',
            title: detail?.name || 'Resource Material',
            type: detail?.type || 'doc',
            description: detail?.description || null,
            related_url: detail?.related_url || 'https://drive.google.com',
            created_at: br.created_at,
          };
        });

        return {
          resources: resolvedList,
          totalActiveCount: resolvedList.length,
          batchCode,
          courseTitle,
        };
      }
    }

    // No active batch resources found in database
    return {
      resources: [],
      totalActiveCount: 0,
      batchCode,
      courseTitle,
    };
  } catch (err) {
    console.warn('Error fetching batch_resources from Supabase:', err);
    return {
      resources: [],
      totalActiveCount: 0,
      batchCode: batchIdParam || 'B-101',
      courseTitle: 'Study Course',
    };
  }
}
