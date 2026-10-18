import { supabase } from './supabase';
import { getTopicsByCourseId } from './coursesStore';

export interface LearnerBoughtCourse {
  registration_id: string;
  course_id: string;
  batch_id: string;
  batch_uuid?: string;
  course_title: string;
  course_topics: string[];
  course_duration?: number;
  preview_media_id?: string;
  batch_code: string;
  start_date: string;
  end_date?: string;
  from_time: string;
  to_time: string;
  time_display: string;
  language: string;
  status: string;
  amount: number;
  currency: string;
}

/**
 * Format time string (e.g. "10:30:00" to "10:30 AM")
 */
function formatTimeString(timeStr?: string | null): string {
  if (!timeStr) return '';
  try {
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 becomes 12
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
export function formatBatchDate(dateStr?: string | null): string {
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

/**
 * Fetch courses bought by the currently logged-in learner:
 * (registrations.learner_id is this logined learner id. Find that row course_id and batch_id)
 */
export async function getLearnerBoughtCourses(): Promise<LearnerBoughtCourse[]> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return [];
    }

    // Query registrations where learner_id is this logged-in learner id
    const { data: regRows, error: regError } = await supabase
      .from('registrations')
      .select(`
        id,
        registration_id,
        course_id,
        batch_id,
        amount,
        currency,
        status,
        created_at
      `)
      .eq('learner_id', user.id)
      .order('created_at', { ascending: false });

    if (regError || !regRows || regRows.length === 0) {
      return [];
    }

    const boughtCourses: LearnerBoughtCourse[] = [];

    for (const reg of regRows) {
      // 1. Fetch course details for reg.course_id
      let courseTitle = 'Certified Program';
      let duration = 45;
      let previewMediaId = '';
      let courseTopicsList: string[] = [];

      if (reg.course_id) {
        const { data: courseData } = await supabase
          .from('courses')
          .select('id, course_id, title, duration, preview_media_id, sub_heading, description')
          .or(`id.eq.${reg.course_id},course_id.eq.${reg.course_id}`)
          .maybeSingle();

        if (courseData) {
          courseTitle = courseData.title || courseTitle;
          duration = courseData.duration || duration;
          previewMediaId = courseData.preview_media_id || '';

          // Fetch course topics from course_topics table where course_id is this course id (no dummy data)
          const topics = await getTopicsByCourseId(courseData.id, courseData.course_id);
          if (topics && topics.length > 0) {
            courseTopicsList = topics;
          } else {
            courseTopicsList = [];
          }
        }
      }

      // 2. Fetch batch details for reg.batch_id
      let batchCode = 'Batch';
      let batchUuid = reg.batch_id;
      let startDate = '';
      let endDate = '';
      let fromTime = '';
      let toTime = '';
      let language = 'English';

      if (reg.batch_id) {
        const { data: batchData } = await supabase
          .from('batches')
          .select('id, batch_id, start_date, end_date, from_time, to_time, language, region')
          .or(`id.eq.${reg.batch_id},batch_id.eq.${reg.batch_id}`)
          .maybeSingle();

        if (batchData) {
          batchUuid = batchData.id || batchUuid;
          batchCode = batchData.batch_id || batchCode;
          startDate = batchData.start_date || '';
          endDate = batchData.end_date || '';
          fromTime = batchData.from_time || '';
          toTime = batchData.to_time || '';
          language = batchData.language || 'English';
        }
      }

      const formattedFrom = formatTimeString(fromTime);
      const formattedTo = formatTimeString(toTime);
      const timeDisplay =
        formattedFrom && formattedTo
          ? `${formattedFrom} - ${formattedTo}`
          : formattedFrom || fromTime || 'Time TBA';

      boughtCourses.push({
        registration_id: reg.registration_id || reg.id,
        course_id: reg.course_id,
        batch_id: reg.batch_id,
        batch_uuid: batchUuid,
        course_title: courseTitle,
        course_topics: courseTopicsList,
        course_duration: duration,
        preview_media_id: previewMediaId,
        batch_code: batchCode,
        start_date: startDate,
        end_date: endDate,
        from_time: fromTime,
        to_time: toTime,
        time_display: timeDisplay,
        language: language.charAt(0).toUpperCase() + language.slice(1),
        status: reg.status || 'active',
        amount: Number(reg.amount) || 0,
        currency: reg.currency || 'INR',
      });
    }

    return boughtCourses;
  } catch (err) {
    console.warn('Error fetching bought courses for learner:', err);
    return [];
  }
}

export interface BatchBoardData {
  id: string;
  batch_id: string;
  title: string;
  description: string | null;
  created_at?: string;
}

export interface BatchBoardMessage {
  id: string;
  board_id: string;
  type: string;
  text_value: string | null;
  resource_id?: string | null;
  created_at: string;
}

/**
 * Fetch batch board and all its messages safely from Supabase.
 * Strictly adheres to lib/schemas.sql (batch_board, batch_board_messages, batches).
 */
export async function getBatchBoardData(
  batchIdOrUuid?: string,
  batchCode?: string,
  courseTitle?: string
): Promise<{ board: BatchBoardData; messages: BatchBoardMessage[] }> {
  const fallbackBoard: BatchBoardData = {
    id: 'default-board',
    batch_id: batchIdOrUuid || 'batch-id',
    title: `${batchCode || 'Batch'} Board`,
    description: `Official batch announcements and instructor updates for ${
      courseTitle || 'your enrolled curriculum'
    }.`,
  };

  if (!batchIdOrUuid && !batchCode) {
    return { board: fallbackBoard, messages: [] };
  }

  try {
    const isUuid = (val?: string) =>
      Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

    let resolvedBatchUuid: string | null = null;

    if (isUuid(batchIdOrUuid)) {
      resolvedBatchUuid = batchIdOrUuid!;
    } else {
      // Look up actual UUID from batches table using batch_id code
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

    let boardRow: BatchBoardData | null = null;

    // 1. Query batch_board table by batch_id (UUID)
    if (resolvedBatchUuid) {
      const { data: boards, error: bErr } = await supabase
        .from('batch_board')
        .select('id, batch_id, title, description, created_at')
        .eq('batch_id', resolvedBatchUuid);

      if (!bErr && boards && boards.length > 0) {
        boardRow = boards[0] as BatchBoardData;
      }
    }

    // 2. If boardRow not found, and batchIdOrUuid is UUID, check if batchIdOrUuid was the board.id itself
    if (!boardRow && isUuid(batchIdOrUuid)) {
      const { data: boardById, error: idErr } = await supabase
        .from('batch_board')
        .select('id, batch_id, title, description, created_at')
        .eq('id', batchIdOrUuid!)
        .maybeSingle();

      if (!idErr && boardById) {
        boardRow = boardById as BatchBoardData;
      }
    }

    // 3. If boardRow not found in database, return the fallback board with empty messages
    if (!boardRow) {
      return { board: fallbackBoard, messages: [] };
    }

    // 4. Fetch all batch_board_messages where board_id = boardRow.id
    const { data: msgRows, error: msgErr } = await supabase
      .from('batch_board_messages')
      .select('id, board_id, type, text_value, resource_id, created_at')
      .eq('board_id', boardRow.id)
      .order('created_at', { ascending: true });

    if (msgErr) {
      console.warn('Error fetching batch_board_messages:', msgErr);
      return { board: boardRow, messages: [] };
    }

    return {
      board: boardRow,
      messages: (msgRows || []) as BatchBoardMessage[],
    };
  } catch (err) {
    console.warn('Exception in getBatchBoardData:', err);
    return { board: fallbackBoard, messages: [] };
  }
}
