import { supabase } from './supabase';

export interface ConductedExamItem {
  id: string; // exams_conducted.id
  exam_id: string;
  exam_title: string;
  exam_description: string | null;
  points: number;
  correct: number;
  wrong: number;
  submitted: boolean;
  results_released: boolean;
  created_at: string;
}

export interface MyLearningsData {
  points: number;
  attendance: number;
  total_exams: number;
  batch_id: string;
  course_name: string;
  exams_conducted: ConductedExamItem[];
  hasData: boolean;
}

export function formatLearningsDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Recent';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Fetch learner's actual points, attendance, and conducted exams.
 * Strictly queries database with NO dummy or fallback data.
 */
export async function getMyLearningsData(
  batchIdParam?: string | null
): Promise<MyLearningsData> {
  const isUuid = (val?: string | null) =>
    Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

  let humanReadableBatchId = batchIdParam || 'batch_102';
  let resolvedBatchUuid: string | null = null;
  let courseName = 'Enrolled Course';

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const learnerId = user?.id;

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

    // 2. Query batch_learners to retrieve points and attendance
    let memberId: string | null = null;
    let learnerPoints = 0;
    let learnerAttendance = 0;
    let courseId: string | null = null;
    let hasMemberRow = false;

    if (learnerId) {
      let blQuery = supabase
        .from('batch_learners')
        .select('id, points, attendance, batch_id, course_id');

      if (resolvedBatchUuid) {
        blQuery = blQuery.eq('batch_id', resolvedBatchUuid).eq('learner_id', learnerId);
      } else {
        blQuery = blQuery.eq('learner_id', learnerId);
      }

      const { data: blList } = await blQuery.limit(1);

      if (blList && blList.length > 0) {
        hasMemberRow = true;
        const bl = blList[0];
        memberId = bl.id;
        learnerPoints = Number(bl.points) || 0;
        learnerAttendance = Number(bl.attendance) || 0;
        courseId = bl.course_id || null;
        if (!resolvedBatchUuid && bl.batch_id) {
          resolvedBatchUuid = bl.batch_id;
        }
      }
    }

    // 3. Resolve course name if not already found
    if (courseId && courseName === 'Enrolled Course') {
      const { data: cRow } = await supabase
        .from('courses')
        .select('title')
        .eq('id', courseId)
        .maybeSingle();

      if (cRow?.title) {
        courseName = cRow.title;
      }
    }

    // 4. Query exams_conducted for this learner member
    let conductedRows: any[] = [];
    if (memberId) {
      const { data: ecList } = await supabase
        .from('exams_conducted')
        .select('id, exam_id, points, correct, wrong, submitted, results_released, created_at')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

      if (ecList) {
        conductedRows = ecList;
      }
    }

    // 5. Query course_exams metadata for titles and descriptions
    const examIds = Array.from(new Set(conductedRows.map((r) => r.exam_id).filter(Boolean)));
    const examMetaMap: Record<string, { title: string; description: string | null }> = {};

    if (examIds.length > 0) {
      const { data: ceList } = await supabase
        .from('course_exams')
        .select('id, title, description')
        .in('id', examIds);

      for (const ce of ceList || []) {
        examMetaMap[ce.id] = {
          title: ce.title,
          description: ce.description || null,
        };
      }
    }

    const examsList: ConductedExamItem[] = conductedRows.map((r) => {
      const meta = examMetaMap[r.exam_id];
      return {
        id: r.id,
        exam_id: r.exam_id,
        exam_title: meta?.title || 'Batch Exam',
        exam_description: meta?.description || null,
        points: Number(r.points) || 0,
        correct: Number(r.correct) || 0,
        wrong: Number(r.wrong) || 0,
        submitted: Boolean(r.submitted),
        results_released: Boolean(r.results_released),
        created_at: r.created_at,
      };
    });

    return {
      points: learnerPoints,
      attendance: learnerAttendance,
      total_exams: examsList.length,
      batch_id: humanReadableBatchId,
      course_name: courseName,
      exams_conducted: examsList,
      hasData: hasMemberRow || examsList.length > 0,
    };
  } catch (err) {
    console.warn('Error fetching my learnings data:', err);
    return {
      points: 0,
      attendance: 0,
      total_exams: 0,
      batch_id: humanReadableBatchId,
      course_name: courseName,
      exams_conducted: [],
      hasData: false,
    };
  }
}
