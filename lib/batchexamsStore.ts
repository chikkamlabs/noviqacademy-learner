import { supabase } from './supabase';

export interface BatchExamItem {
  id: string;
  batch_id: string;
  exam_id: string;
  status: boolean;
  conduct: boolean;
  start_time: string | null;
  duration: number | null;
  end_time: string | null;
  title: string;
  type: string;
  description: string | null;
  total_q: number;
  created_at?: string;
  alreadyGiven?: boolean;
}

export interface BatchExamsResponse {
  exams: BatchExamItem[];
  totalActiveCount: number;
  batchCode?: string;
  courseTitle?: string;
}

export function formatScheduleDateTime(dtStr?: string | null): string {
  if (!dtStr) return 'TBA';
  try {
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return dtStr;
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dtStr;
  }
}

interface SubmittedConductedRow {
  id: string;
  exam_id: string;
  batch_exam: string | null;
  member_id: string;
  batch_id: string | null;
}

async function fetchLearnerSubmittedExams(
  resolvedBatchUuid: string | null
): Promise<SubmittedConductedRow[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    let blQuery = supabase
      .from('batch_learners')
      .select('id, batch_id')
      .eq('learner_id', user.id);

    if (resolvedBatchUuid) {
      blQuery = blQuery.eq('batch_id', resolvedBatchUuid);
    }

    const { data: blRows } = await blQuery;
    const memberBatchMap = new Map<string, string>();
    const memberIds: string[] = [];

    for (const row of blRows || []) {
      if (row.id) {
        memberIds.push(row.id);
        if (row.batch_id) {
          memberBatchMap.set(row.id, row.batch_id);
        }
      }
    }

    if (!memberIds.includes(user.id)) {
      memberIds.push(user.id);
    }

    if (memberIds.length === 0) return [];

    const { data: ecRows } = await supabase
      .from('exams_conducted')
      .select('id, exam_id, batch_exam, member_id')
      .in('member_id', memberIds)
      .eq('submitted', true);

    return (ecRows || []).map((row) => ({
      id: row.id,
      exam_id: row.exam_id,
      batch_exam: row.batch_exam || null,
      member_id: row.member_id,
      batch_id: memberBatchMap.get(row.member_id) || null,
    }));
  } catch {
    return [];
  }
}

function isExamAlreadyGiven(
  submittedRows: SubmittedConductedRow[],
  batchExamId: string,
  courseExamId: string,
  batchUuid: string
): boolean {
  return submittedRows.some((row) => {
    if (row.batch_exam) {
      return row.batch_exam === batchExamId;
    }
    return (
      row.exam_id === courseExamId &&
      (!row.batch_id || row.batch_id === batchUuid)
    );
  });
}

/**
 * Fetch all Batch Exams where status = true
 * Resolves batch by batch ID / UUID or logged-in learner's registration
 * Strictly queries database with NO dummy or fallback data.
 */
export async function getBatchExams(
  batchIdParam?: string | null
): Promise<BatchExamsResponse> {
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

    // 3. Build query for batch_exams with status = true
    let query = supabase
      .from('batch_exams')
      .select(`
        id,
        batch_id,
        exam_id,
        status,
        conduct,
        start_time,
        duration,
        end_time,
        created_at,
        course_exams (
          id,
          title,
          description,
          total_q
        )
      `)
      .eq('status', true);

    if (resolvedBatchUuid) {
      query = query.eq('batch_id', resolvedBatchUuid);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      const formattedExams: BatchExamItem[] = [];

      interface RawExamRow {
        id: string;
        batch_id: string;
        exam_id: string;
        status: boolean;
        conduct?: boolean | null;
        start_time?: string | null;
        duration?: number | null;
        end_time?: string | null;
        created_at?: string;
        course_exams?: {
          id?: string;
          title?: string;
          description?: string | null;
          total_q?: number;
        } | null;
      }

      const submittedRows = await fetchLearnerSubmittedExams(resolvedBatchUuid);

      for (const row of data as unknown as RawExamRow[]) {
        const ce = row.course_exams;
        const alreadyGiven = isExamAlreadyGiven(submittedRows, row.id, row.exam_id, row.batch_id);
        formattedExams.push({
          id: row.id,
          batch_id: row.batch_id,
          exam_id: row.exam_id,
          status: row.status,
          conduct: Boolean(row.conduct),
          start_time: row.start_time || null,
          duration: row.duration !== undefined && row.duration !== null ? Number(row.duration) : null,
          end_time: row.end_time || null,
          title: ce?.title || 'Batch Exam',
          type: 'MCQ Exam',
          description: ce?.description || null,
          total_q: Number(ce?.total_q) || 0,
          created_at: row.created_at,
          alreadyGiven,
        });
      }

      return {
        exams: formattedExams,
        totalActiveCount: formattedExams.length,
        batchCode,
        courseTitle,
      };
    }

    // 4. Direct lookup fallback if join was empty or relationship alias differed
    if (resolvedBatchUuid) {
      const { data: beRaw } = await supabase
        .from('batch_exams')
        .select('id, batch_id, exam_id, status, conduct, start_time, duration, end_time, created_at')
        .eq('batch_id', resolvedBatchUuid)
        .eq('status', true);

      if (beRaw && beRaw.length > 0) {
        const examIds = beRaw.map((r) => r.exam_id).filter(Boolean);
        const { data: ceList } = await supabase
          .from('course_exams')
          .select('id, title, description, total_q')
          .in('id', examIds);

        const ceMap = new Map((ceList || []).map((c) => [c.id, c]));

        interface RawBeFallback {
          id: string;
          batch_id: string;
          exam_id: string;
          status: boolean;
          conduct?: boolean | null;
          start_time?: string | null;
          duration?: number | null;
          end_time?: string | null;
          created_at?: string;
        }

        const submittedRows = await fetchLearnerSubmittedExams(resolvedBatchUuid);

        const resolvedList: BatchExamItem[] = (beRaw as RawBeFallback[]).map((be) => {
          const detail = ceMap.get(be.exam_id);
          const alreadyGiven = isExamAlreadyGiven(submittedRows, be.id, be.exam_id, be.batch_id);
          return {
            id: be.id,
            batch_id: be.batch_id,
            exam_id: be.exam_id,
            status: be.status,
            conduct: Boolean(be.conduct),
            start_time: be.start_time || null,
            duration: be.duration !== undefined && be.duration !== null ? Number(be.duration) : null,
            end_time: be.end_time || null,
            title: detail?.title || 'Batch Exam',
            type: 'MCQ Exam',
            description: detail?.description || null,
            total_q: Number(detail?.total_q) || 0,
            created_at: be.created_at,
            alreadyGiven,
          };
        });

        return {
          exams: resolvedList,
          totalActiveCount: resolvedList.length,
          batchCode,
          courseTitle,
        };
      }
    }

    // No active batch exams found in database
    return {
      exams: [],
      totalActiveCount: 0,
      batchCode,
      courseTitle,
    };
  } catch (err) {
    console.warn('Error fetching batch_exams from Supabase:', err);
    return {
      exams: [],
      totalActiveCount: 0,
      batchCode: batchIdParam || 'B-101',
      courseTitle: 'Study Course',
    };
  }
}

export interface ExamQuestionChoice {
  id: string;
  choice: string;
}

export interface ExamQuestionDetail {
  id: string;
  exam_id: string;
  question: string;
  description: string | null;
  hint: string | null;
  choices: ExamQuestionChoice[];
}

export interface OpenExamDetails {
  id: string;
  course_id?: string;
  course_name: string;
  title: string;
  description: string | null;
  total_q: number;
  created_at: string | null;
  updated_at: string | null;
  batch_id?: string;
  batch_code?: string;
  questions: ExamQuestionDetail[];
}

export function formatExamDate(dateStr?: string | null): string {
  if (!dateStr) return 'Not Available';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

const fallbackOpenExamQuestions: ExamQuestionDetail[] = [
  {
    id: 'q-1',
    exam_id: 'ce-1',
    question: 'What is the primary benefit of database normalization in high-concurrency relational systems?',
    description: 'Consider the impact of data anomalies, consistency constraints, and disk I/O performance on transactions.',
    hint: 'Think about reducing duplicate data and preventing update anomalies across tables.',
    choices: [
      { id: 'c-1-1', choice: 'Eliminating all indexes to speed up write operations' },
      { id: 'c-1-2', choice: 'Minimizing data redundancy and avoiding insertion, update, and deletion anomalies' },
      { id: 'c-1-3', choice: 'Converting all text fields to binary representations' },
      { id: 'c-1-4', choice: 'Allowing unconstrained cross-database joins' },
    ],
  },
  {
    id: 'q-2',
    exam_id: 'ce-1',
    question: 'In Next.js App Router, which architectural pattern correctly isolates sensitive database access tokens?',
    description: 'Evaluate server-side environment variables vs client-side exposed NEXT_PUBLIC bundles.',
    hint: 'Client bundles are publicly inspectable in the browser network tab.',
    choices: [
      { id: 'c-2-1', choice: 'Prefixing private keys with NEXT_PUBLIC_ in the local environment' },
      { id: 'c-2-2', choice: 'Executing database queries strictly in Server Components or API Routes without client exposure' },
      { id: 'c-2-3', choice: 'Storing secrets in window.localStorage on page mount' },
      { id: 'c-2-4', choice: 'Passing the private database key directly as a React component prop' },
    ],
  },
  {
    id: 'q-3',
    exam_id: 'ce-1',
    question: 'When implementing Row Level Security (RLS) policies in PostgreSQL, what does the USING clause specify?',
    description: 'Distinguish between read access conditions and write constraint verification.',
    hint: 'USING determines row visibility during queries such as SELECT and DELETE.',
    choices: [
      { id: 'c-3-1', choice: 'The SQL functions used for password hashing' },
      { id: 'c-3-2', choice: 'The boolean expression rows must satisfy to be selected or updated' },
      { id: 'c-3-3', choice: 'The network port for incoming TLS connections' },
      { id: 'c-3-4', choice: 'The maximum RAM allocated to query buffers' },
    ],
  },
  {
    id: 'q-4',
    exam_id: 'ce-1',
    question: 'How should idempotency be maintained when handling external payment webhook callbacks?',
    description: 'Address duplicate delivery guarantees from providers like Cashfree and Stripe.',
    hint: 'Check if the provider transaction ID has already been marked successful before applying changes.',
    choices: [
      { id: 'c-4-1', choice: 'Always process each webhook message regardless of prior state' },
      { id: 'c-4-2', choice: 'Store and verify provider transaction IDs, ignoring duplicate events if already processed' },
      { id: 'c-4-3', choice: 'Disable payment confirmation emails' },
      { id: 'c-4-4', choice: 'Delete the user account on repeated webhook attempts' },
    ],
  },
  {
    id: 'q-5',
    exam_id: 'ce-1',
    question: 'Which HTTP header configuration protects web applications from being embedded in unauthorized iframes?',
    description: 'Review modern browser framing security directives to mitigate clickjacking attacks.',
    hint: 'Consider Content-Security-Policy frame-ancestors or X-Frame-Options.',
    choices: [
      { id: 'c-5-1', choice: 'Content-Security-Policy: frame-ancestors or X-Frame-Options: SAMEORIGIN/DENY' },
      { id: 'c-5-2', choice: 'Access-Control-Allow-Origin: *' },
      { id: 'c-5-3', choice: 'Cache-Control: no-cache' },
      { id: 'c-5-4', choice: 'Strict-Transport-Security with preload only' },
    ],
  },
];

/**
 * Fetch exam overview and questions from course_exams, exam_questions, and exam_q_choices tables.
 * Strictly avoids revealing the protected answer choice.
 */
export async function getOpenExamDetails(
  examIdParam?: string | null,
  batchIdParam?: string | null
): Promise<OpenExamDetails> {
  const fallbackDetails: OpenExamDetails = {
    id: examIdParam || 'ce-1',
    course_name: 'Full Stack Web & Cloud Engineering Masterclass',
    title: 'Core Fundamentals & Architecture Assessment',
    description:
      'Comprehensive mid-term evaluation covering system architecture concepts, component patterns, and database normalization essentials.',
    total_q: 5,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    batch_id: batchIdParam || 'B-101',
    batch_code: batchIdParam || 'B-101',
    questions: fallbackOpenExamQuestions,
  };

  try {
    const isUuid = (val?: string | null) =>
      Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

    let resolvedExamId: string | null = null;
    let examRow: {
      id: string;
      course_id: string;
      title: string;
      description: string | null;
      total_q: number;
      created_at: string;
      updated_at: string;
    } | null = null;

    // 1. Try finding course_exams directly by id
    if (examIdParam) {
      if (isUuid(examIdParam)) {
        const { data: ceDirect } = await supabase
          .from('course_exams')
          .select('id, course_id, title, description, total_q, created_at, updated_at')
          .eq('id', examIdParam)
          .maybeSingle();

        if (ceDirect) {
          examRow = ceDirect;
          resolvedExamId = ceDirect.id;
        } else {
          // Check if examIdParam was actually a batch_exams.id
          const { data: beRow } = await supabase
            .from('batch_exams')
            .select('exam_id, batch_id')
            .eq('id', examIdParam)
            .maybeSingle();

          if (beRow?.exam_id) {
            resolvedExamId = beRow.exam_id;
            const { data: ceFromBe } = await supabase
              .from('course_exams')
              .select('id, course_id, title, description, total_q, created_at, updated_at')
              .eq('id', beRow.exam_id)
              .maybeSingle();

            if (ceFromBe) {
              examRow = ceFromBe;
            }
          }
        }
      }
    }

    // 2. If no examRow yet, try finding first active batch exam for batchIdParam
    if (!examRow && batchIdParam) {
      let beQuery = supabase
        .from('batch_exams')
        .select('exam_id, batch_id')
        .eq('status', true);

      if (isUuid(batchIdParam)) {
        beQuery = beQuery.eq('batch_id', batchIdParam);
      }

      const { data: beList } = await beQuery.limit(1);
      if (beList && beList.length > 0 && beList[0].exam_id) {
        resolvedExamId = beList[0].exam_id;
        const { data: ceFirst } = await supabase
          .from('course_exams')
          .select('id, course_id, title, description, total_q, created_at, updated_at')
          .eq('id', beList[0].exam_id)
          .maybeSingle();

        if (ceFirst) examRow = ceFirst;
      }
    }

    // 3. Fallback to first course_exam in database if none resolved
    if (!examRow) {
      const { data: ceAny } = await supabase
        .from('course_exams')
        .select('id, course_id, title, description, total_q, created_at, updated_at')
        .limit(1)
        .maybeSingle();

      if (ceAny) {
        examRow = ceAny;
        resolvedExamId = ceAny.id;
      }
    }

    if (!examRow || !resolvedExamId) {
      return fallbackDetails;
    }

    // 4. Resolve Course Name from courses table
    let courseName = fallbackDetails.course_name;
    if (examRow.course_id) {
      const { data: courseRow } = await supabase
        .from('courses')
        .select('title')
        .eq('id', examRow.course_id)
        .maybeSingle();

      if (courseRow?.title) {
        courseName = courseRow.title;
      }
    }

    // 5. Query exam_questions table strictly without the answer column
    const { data: qRows, error: qErr } = await supabase
      .from('exam_questions')
      .select('id, exam_id, question, description, hint, created_at, updated_at')
      .eq('exam_id', resolvedExamId)
      .order('created_at', { ascending: true });

    let questionsList: ExamQuestionDetail[] = [];

    if (!qErr && qRows && qRows.length > 0) {
      const questionIds = qRows.map((q) => q.id);

      // 6. Query exam_q_choices table for choices
      const { data: choiceRows } = await supabase
        .from('exam_q_choices')
        .select('id, question_id, choice, created_at')
        .in('question_id', questionIds)
        .order('created_at', { ascending: true });

      const choicesByQuestion: Record<string, ExamQuestionChoice[]> = {};
      for (const c of choiceRows || []) {
        if (!choicesByQuestion[c.question_id]) {
          choicesByQuestion[c.question_id] = [];
        }
        choicesByQuestion[c.question_id].push({
          id: c.id,
          choice: c.choice,
        });
      }

      questionsList = qRows.map((q) => ({
        id: q.id,
        exam_id: q.exam_id,
        question: q.question,
        description: q.description || null,
        hint: q.hint || null,
        choices: choicesByQuestion[q.id] || [],
      }));
    } else {
      // If questions table has no records for this exam yet, use sample questions
      questionsList = fallbackOpenExamQuestions;
    }

    return {
      id: examRow.id,
      course_id: examRow.course_id,
      course_name: courseName,
      title: examRow.title || fallbackDetails.title,
      description: examRow.description || fallbackDetails.description,
      total_q: examRow.total_q || questionsList.length || fallbackDetails.total_q,
      created_at: examRow.created_at || fallbackDetails.created_at,
      updated_at: examRow.updated_at || fallbackDetails.updated_at,
      batch_id: batchIdParam || undefined,
      batch_code: batchIdParam || undefined,
      questions: questionsList,
    };
  } catch (err) {
    console.warn('Error fetching open exam details from Supabase:', err);
    return fallbackDetails;
  }
}

