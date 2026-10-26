import { supabase } from './supabase';

export interface StudyCourseDetails {
  course_id: string;
  course_title: string;
  course_topics: string[];
  start_date: string;
  batch_id?: string;
  batch_uuid?: string;
  batch_code?: string;
  time_display?: string;
}

export interface StudyBatchBoardMessage {
  id: string;
  board_id: string;
  type: string;
  text_value: string | null;
  resource_id?: string | null;
  created_at: string;
}

export interface StudyBatchBoardData {
  id: string;
  batch_id: string;
  title: string;
  description: string | null;
  messages: StudyBatchBoardMessage[];
}

/**
 * Format time string (e.g. "10:30:00" to "10:30 AM")
 */
export function formatStudyTime(timeStr?: string | null): string {
  if (!timeStr) return '';
  try {
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    }
  } catch {
    // fallback
  }
  return timeStr;
}

/**
 * Format start_date to readable format (e.g. "07 Nov 2026")
 */
export function formatStudyDate(dateStr?: string | null): string {
  if (!dateStr) return 'Upcoming Batch';
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

/**
 * Query course_topics table joined with topics table
 */
export async function getTopicsFromCourseTopicsTable(
  courseUuid?: string,
  courseIdCode?: string
): Promise<string[]> {
  if (!courseUuid && !courseIdCode) return [];

  try {
    let query = supabase.from('course_topics').select(`
      topic_id,
      topics (
        topic_name
      )
    `);

    if (courseUuid && courseIdCode && courseUuid !== courseIdCode) {
      query = query.or(`course_id.eq.${courseUuid},course_id.eq.${courseIdCode}`);
    } else if (courseUuid) {
      query = query.eq('course_id', courseUuid);
    } else if (courseIdCode) {
      query = query.eq('course_id', courseIdCode);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      const extracted: string[] = [];
      interface TopicRow {
        topic_id?: string;
        topics?: { topic_name?: string } | Array<{ topic_name?: string }> | null;
      }
      for (const row of data as TopicRow[]) {
        if (row?.topics) {
          if (Array.isArray(row.topics)) {
            for (const t of row.topics) {
              if (t?.topic_name) extracted.push(t.topic_name);
            }
          } else if (row.topics.topic_name) {
            extracted.push(row.topics.topic_name);
          }
        }
      }
      if (extracted.length > 0) {
        return extracted;
      }
    }
  } catch (err) {
    console.warn('Error fetching course_topics from Supabase:', err);
  }

  return [];
}

/**
 * Fetch study details for a batch id/code from Supabase
 */
export async function getStudyDetails(batchIdParam?: string | null): Promise<StudyCourseDetails> {
  const fallbackDetails: StudyCourseDetails = {
    course_id: 'default-course',
    course_title: 'Full Stack Web & Cloud Engineering Masterclass',
    course_topics: ['Next.js 15', 'TypeScript', 'PostgreSQL', 'Tailwind CSS', 'Cloud APIs'],
    start_date: 'Upcoming Batch',
    batch_id: batchIdParam || 'B-101',
    batch_code: batchIdParam || 'B-101',
    time_display: '10:00 AM - 11:30 AM',
  };

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let matchedReg: { course_id?: string; batch_id?: string } | null = null;

    if (user) {
      // 1. Fetch registrations for this user
      const { data: regRows } = await supabase
        .from('registrations')
        .select('id, registration_id, course_id, batch_id')
        .eq('learner_id', user.id);

      if (regRows && regRows.length > 0) {
        if (batchIdParam) {
          matchedReg =
            regRows.find(
              (r) =>
                r.batch_id === batchIdParam ||
                r.registration_id === batchIdParam ||
                r.course_id === batchIdParam
            ) || null;
        }
        if (!matchedReg) {
          matchedReg = regRows[0];
        }
      }
    }

    const targetBatchId = batchIdParam || matchedReg?.batch_id;

    // 2. Query batches table
    let batchUuid = '';
    let batchCode = targetBatchId || 'B-101';
    let startDate = '';
    let fromTime = '';
    let toTime = '';
    let courseUuid = matchedReg?.course_id || '';

    if (targetBatchId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        targetBatchId
      );

      let batchQuery = supabase
        .from('batches')
        .select('id, batch_id, course_id, start_date, end_date, from_time, to_time');

      if (isUuid) {
        batchQuery = batchQuery.or(`id.eq.${targetBatchId},batch_id.eq.${targetBatchId}`);
      } else {
        batchQuery = batchQuery.eq('batch_id', targetBatchId);
      }

      const { data: batchData } = await batchQuery.maybeSingle();

      if (batchData) {
        batchUuid = batchData.id || '';
        batchCode = batchData.batch_id || targetBatchId;
        startDate = batchData.start_date || '';
        fromTime = batchData.from_time || '';
        toTime = batchData.to_time || '';
        if (batchData.course_id) {
          courseUuid = batchData.course_id;
        }
      }
    }

    // 3. Query courses table for course title
    let courseTitle = fallbackDetails.course_title;
    let courseCustomId = '';

    if (courseUuid) {
      const isCourseUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        courseUuid
      );

      let courseQuery = supabase
        .from('courses')
        .select('id, course_id, title');

      if (isCourseUuid) {
        courseQuery = courseQuery.or(`id.eq.${courseUuid},course_id.eq.${courseUuid}`);
      } else {
        courseQuery = courseQuery.eq('course_id', courseUuid);
      }

      const { data: courseRow } = await courseQuery.maybeSingle();
      if (courseRow) {
        courseTitle = courseRow.title || courseTitle;
        courseUuid = courseRow.id || courseUuid;
        courseCustomId = courseRow.course_id || '';
      }
    } else {
      // If no courseUuid yet, fetch the first active course
      const { data: firstCourse } = await supabase
        .from('courses')
        .select('id, course_id, title')
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      if (firstCourse) {
        courseTitle = firstCourse.title || courseTitle;
        courseUuid = firstCourse.id;
        courseCustomId = firstCourse.course_id || '';
      }
    }

    // 4. Query course_topics table strictly from Supabase
    const topicsFromTable = await getTopicsFromCourseTopicsTable(courseUuid, courseCustomId);

    const formattedFrom = formatStudyTime(fromTime);
    const formattedTo = formatStudyTime(toTime);
    const timeDisplay =
      formattedFrom && formattedTo
        ? `${formattedFrom} - ${formattedTo}`
        : formattedFrom || fallbackDetails.time_display;

    return {
      course_id: courseUuid || fallbackDetails.course_id,
      course_title: courseTitle,
      course_topics:
        topicsFromTable.length > 0 ? topicsFromTable : fallbackDetails.course_topics,
      start_date: startDate ? formatStudyDate(startDate) : fallbackDetails.start_date,
      batch_id: targetBatchId || fallbackDetails.batch_id,
      batch_uuid: batchUuid || undefined,
      batch_code: batchCode,
      time_display: timeDisplay,
    };
  } catch (err) {
    console.warn('Exception in getStudyDetails:', err);
    return fallbackDetails;
  }
}

/**
 * Fetch batch board data and messages strictly for study dashboard
 */
export async function getStudyBatchBoard(
  batchIdOrUuid?: string,
  batchCode?: string,
  courseTitle?: string
): Promise<StudyBatchBoardData> {
  const fallbackBoard: StudyBatchBoardData = {
    id: 'default-board',
    batch_id: batchIdOrUuid || 'batch-id',
    title: `${batchCode || 'Batch'} Board`,
    description: `Official batch announcements and updates for ${
      courseTitle || 'your enrolled course'
    }.`,
    messages: [],
  };

  if (!batchIdOrUuid && !batchCode) {
    return fallbackBoard;
  }

  try {
    const isUuid = (val?: string) =>
      Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

    let resolvedBatchUuid: string | null = null;

    if (isUuid(batchIdOrUuid)) {
      resolvedBatchUuid = batchIdOrUuid!;
    } else {
      const codeToSearch = batchCode || batchIdOrUuid;
      if (codeToSearch) {
        const { data: batchRow } = await supabase
          .from('batches')
          .select('id, batch_id')
          .eq('batch_id', codeToSearch)
          .maybeSingle();

        if (batchRow?.id) {
          resolvedBatchUuid = batchRow.id;
        }
      }
    }

    let boardRow: { id: string; batch_id: string; title: string; description: string | null } | null = null;

    if (resolvedBatchUuid) {
      const { data: boards } = await supabase
        .from('batch_board')
        .select('id, batch_id, title, description')
        .eq('batch_id', resolvedBatchUuid);

      if (boards && boards.length > 0) {
        boardRow = boards[0];
      }
    }

    if (!boardRow && isUuid(batchIdOrUuid)) {
      const { data: boardById } = await supabase
        .from('batch_board')
        .select('id, batch_id, title, description')
        .eq('id', batchIdOrUuid!)
        .maybeSingle();

      if (boardById) {
        boardRow = boardById;
      }
    }

    if (!boardRow) {
      return fallbackBoard;
    }

    const { data: msgRows } = await supabase
      .from('batch_board_messages')
      .select('id, board_id, type, text_value, resource_id, created_at')
      .eq('board_id', boardRow.id)
      .order('created_at', { ascending: true });

    return {
      id: boardRow.id,
      batch_id: boardRow.batch_id,
      title: boardRow.title,
      description: boardRow.description,
      messages: (msgRows || []) as StudyBatchBoardMessage[],
    };
  } catch (err) {
    console.warn('Error in getStudyBatchBoard:', err);
    return fallbackBoard;
  }
}
