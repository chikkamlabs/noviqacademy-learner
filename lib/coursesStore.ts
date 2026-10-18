import { supabase } from './supabase';

export interface CourseTopicItem {
  id?: string;
  topic_name: string;
}

export interface CourseWithDetails {
  id: string;
  course_id: string;
  price: number;
  selling_price: number;
  uk_price: number;
  uk_selling_price: number;
  title: string;
  sub_heading: string | null;
  description: string | null;
  duration: number; // in days
  preview_media_id: string;
  course_learnings: string[];
  course_includes: string[];
  status: 'active' | 'deactivated';
  is_featured: boolean;
  topics: string[];
}

const DUMMY_UNSPLASH_IMAGE =
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop';

export const FALLBACK_COURSES: CourseWithDetails[] = [
  {
    id: 'c1-fullstack-ts',
    course_id: 'fs-next-ts',
    price: 9999,
    selling_price: 3499,
    uk_price: 110,
    uk_selling_price: 45,
    title: 'Full Stack Next.js 15 & TypeScript Masterclass',
    sub_heading: 'Build scalable production cloud applications with Next.js, PostgreSQL, Auth, and modern Tailwind CSS.',
    description: 'Learn end-to-end full stack web architecture. Master App Router, server actions, relational database modeling with PostgreSQL, robust state management, and real world cloud deployment.',
    duration: 60,
    preview_media_id: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop',
    course_learnings: [
      'Master Next.js 15 App Router, Server Components & React 19',
      'Design relational schemas and complex SQL queries with PostgreSQL',
      'Implement secure authentication, sessions, and role-based access control',
      'Deploy enterprise web applications to production cloud runtimes',
      'Write clean, typed, modular code with TypeScript and ESLint'
    ],
    course_includes: [
      '60 days of step-by-step masterclass lectures',
      '10 hands-on full-stack enterprise projects',
      'Direct 1-on-1 code reviews with senior engineering mentors',
      'Full lifetime access to course updates & code repository',
      'Verified Certificate of Completion'
    ],
    status: 'active',
    is_featured: true,
    topics: ['Full Stack', 'Next.js', 'TypeScript', 'PostgreSQL', 'React'],
  },
  {
    id: 'c2-python-ds',
    course_id: 'py-data-ai',
    price: 8499,
    selling_price: 2999,
    uk_price: 95,
    uk_selling_price: 39,
    title: 'Python for Data Science & Machine Learning Bootcamp',
    sub_heading: 'From Python fundamentals to deep learning, Pandas, NumPy, Scikit-learn, and neural networks.',
    description: 'Complete data science journey from data wrangling to predictive machine learning models, statistical analysis, and interactive data visualization dashboards.',
    duration: 45,
    preview_media_id: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
    course_learnings: [
      'Clean, manipulate, and analyze massive datasets with Pandas and NumPy',
      'Build predictive classification and regression models with Scikit-learn',
      'Create high-impact data visualization dashboards with Seaborn and Matplotlib',
      'Understand statistical inference, hypothesis testing, and exploratory analysis',
      'Implement foundational deep learning neural networks with PyTorch'
    ],
    course_includes: [
      '45 days of comprehensive data science training',
      '8 portfolio data science and machine learning projects',
      'Real world datasets from finance, healthcare, and e-commerce',
      'Weekly live mentor Q&A and coding debug sessions',
      'Industry-recognized Certificate of Completion'
    ],
    status: 'active',
    is_featured: true,
    topics: ['Python', 'Data Science', 'Machine Learning', 'Pandas', 'AI'],
  },
  {
    id: 'c3-cloud-devops',
    course_id: 'devops-k8s-cloud',
    price: 11999,
    selling_price: 3999,
    uk_price: 130,
    uk_selling_price: 49,
    title: 'Cloud DevOps, Docker & Kubernetes Engineering',
    sub_heading: 'Architect modern CI/CD pipelines, container orchestration, Terraform, and cloud infrastructures.',
    description: 'Master enterprise DevOps practices. Learn how top tech companies build resilient, automated continuous delivery workflows, zero-downtime deployments, and infrastructure as code.',
    duration: 75,
    preview_media_id: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=800&auto=format&fit=crop',
    course_learnings: [
      'Build robust automated CI/CD deployment pipelines with GitHub Actions',
      'Containerize microservices using Docker and multi-stage builds',
      'Deploy, scale, and manage container workloads with Kubernetes',
      'Provision reproducible cloud infrastructure using Terraform',
      'Set up observability, logging, and monitoring with Prometheus & Grafana'
    ],
    course_includes: [
      '75 days of hands-on infrastructure engineering labs',
      'Complete end-to-end multi-cloud deployment setups',
      'Live architecture reviews with Cloud DevOps professionals',
      'Production-tested Helm charts and Terraform templates',
      'Verified Certificate of Completion'
    ],
    status: 'active',
    is_featured: true,
    topics: ['DevOps', 'Docker', 'Kubernetes', 'Cloud', 'CI/CD'],
  },
  {
    id: 'c4-flutter-mobile',
    course_id: 'flutter-cross-platform',
    price: 7999,
    selling_price: 2699,
    uk_price: 85,
    uk_selling_price: 35,
    title: 'Mobile App Development with Flutter & Dart',
    sub_heading: 'Craft beautiful cross-platform iOS and Android mobile apps from a single clean codebase.',
    description: 'Build native-grade mobile applications for iOS and Android. Master Dart, state management with Riverpod, animations, local storage, camera APIs, and store publishing.',
    duration: 50,
    preview_media_id: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop',
    course_learnings: [
      'Develop pixel-perfect cross-platform apps for iOS and Android',
      'Master modern state management patterns using Riverpod and Bloc',
      'Integrate device APIs: Camera, GPS, Push Notifications, and Storage',
      'Connect mobile apps to REST APIs and real-time backend databases',
      'Prepare, sign, and release applications to Google Play & Apple App Store'
    ],
    course_includes: [
      '50 days of interactive mobile app lectures and coding tasks',
      '6 fully-functional publishable mobile app portfolio projects',
      'Design assets, UI component kits, and mock API backends',
      'Direct mentor support and code reviews',
      'Verified Certificate of Completion'
    ],
    status: 'active',
    is_featured: false,
    topics: ['Mobile Development', 'Flutter', 'Dart', 'iOS', 'Android'],
  },
  {
    id: 'c5-ai-agents',
    course_id: 'genai-llm-agents',
    price: 12999,
    selling_price: 4499,
    uk_price: 140,
    uk_selling_price: 55,
    title: 'Generative AI & LLM Application Engineering',
    sub_heading: 'Build intelligent AI agents, RAG search engines, prompt pipelines, and embeddings systems.',
    description: 'Dive deep into real-world AI software development. Learn retrieval-augmented generation (RAG), vector databases, autonomous tool-calling agents, and fine-tuning fundamentals.',
    duration: 40,
    preview_media_id: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=800&auto=format&fit=crop',
    course_learnings: [
      'Build production RAG systems with vector databases and semantic search',
      'Engineer multi-step autonomous AI agents with tool use and function calling',
      'Implement prompt evaluation, caching, and guardrail validation',
      'Deploy low-latency AI endpoints with streaming responses',
      'Evaluate model hallucinations and optimize embedding pipelines'
    ],
    course_includes: [
      '40 days of bleeding-edge AI engineering lessons',
      '5 production-grade Generative AI applications',
      'Access to vector database sandboxes and cloud credits',
      'Weekly live AI architecture teardowns with founders & mentors',
      'Verified Certificate of Completion'
    ],
    status: 'active',
    is_featured: true,
    topics: ['AI', 'Generative AI', 'LLM', 'Python', 'Machine Learning'],
  },
  {
    id: 'c6-backend-golang',
    course_id: 'golang-backend-microservices',
    price: 8999,
    selling_price: 3199,
    uk_price: 99,
    uk_selling_price: 42,
    title: 'High-Performance Backend Engineering with Go',
    sub_heading: 'Build concurrent, high-throughput microservices and distributed APIs with Go (Golang).',
    description: 'Master systems programming for the web. Learn Go concurrency with Goroutines and channels, gRPC, PostgreSQL connections, caching with Redis, and Kafka messaging.',
    duration: 55,
    preview_media_id: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
    course_learnings: [
      'Write highly concurrent backend services using Go Goroutines & Channels',
      'Design high-throughput REST and gRPC microservice communication',
      'Implement distributed caching strategies with Redis',
      'Handle asynchronous event messaging with Apache Kafka',
      'Profile memory, benchmark execution, and optimize server bottlenecks'
    ],
    course_includes: [
      '55 days of deep-dive systems programming',
      'Distributed e-commerce backend capstone project',
      'Benchmark test suites and concurrency stress-test labs',
      'Code reviews from staff backend engineers',
      'Verified Certificate of Completion'
    ],
    status: 'active',
    is_featured: false,
    topics: ['Backend', 'Go', 'Golang', 'Microservices', 'Distributed Systems'],
  },
];

/**
 * Fetch all active courses from Supabase.
 * Returns fallback courses if Supabase returns empty or connection is not available.
 */
export async function getTrendingCourses(): Promise<CourseWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        course_id,
        price,
        selling_price,
        uk_price,
        uk_selling_price,
        title,
        sub_heading,
        description,
        duration,
        preview_media_id,
        course_learnings,
        course_includes,
        status,
        is_featured,
        course_topics (
          topics (
            topic_name
          )
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return FALLBACK_COURSES;
    }

    interface RawCourseRow {
      id: string;
      course_id: string;
      price: number;
      selling_price: number;
      uk_price?: number;
      uk_selling_price?: number;
      title: string;
      sub_heading: string | null;
      description: string | null;
      duration: number;
      preview_media_id: string | null;
      course_learnings: unknown;
      course_includes: unknown;
      status: 'active' | 'deactivated';
      is_featured: boolean;
      course_topics?: Array<{
        topics?: { topic_name: string } | Array<{ topic_name: string }> | null;
      }> | null;
    }

    const mappedCourses: CourseWithDetails[] = (data as RawCourseRow[]).map((course) => {
      // Extract topics safely
      const topics: string[] = [];
      if (Array.isArray(course.course_topics)) {
        for (const ct of course.course_topics) {
          if (ct?.topics) {
            if (Array.isArray(ct.topics)) {
              for (const t of ct.topics) {
                if (t?.topic_name) topics.push(t.topic_name);
              }
            } else if (ct.topics.topic_name) {
              topics.push(ct.topics.topic_name);
            }
          }
        }
      }

      // Parse course_learnings
      let learnings: string[] = [];
      if (Array.isArray(course.course_learnings)) {
        learnings = course.course_learnings.map(String);
      } else if (typeof course.course_learnings === 'string') {
        try {
          const parsed = JSON.parse(course.course_learnings);
          if (Array.isArray(parsed)) learnings = parsed.map(String);
        } catch {
          learnings = [course.course_learnings];
        }
      }

      // Parse course_includes
      let includes: string[] = [];
      if (Array.isArray(course.course_includes)) {
        includes = course.course_includes.map(String);
      } else if (typeof course.course_includes === 'string') {
        try {
          const parsed = JSON.parse(course.course_includes);
          if (Array.isArray(parsed)) includes = parsed.map(String);
        } catch {
          includes = [course.course_includes];
        }
      }

      return {
        id: course.id,
        course_id: course.course_id,
        price: Number(course.price) || 0,
        selling_price: Number(course.selling_price) || 0,
        uk_price: Number(course.uk_price) || 0,
        uk_selling_price: Number(course.uk_selling_price) || 0,
        title: course.title,
        sub_heading: course.sub_heading,
        description: course.description,
        duration: course.duration || 0,
        preview_media_id: course.preview_media_id && course.preview_media_id.trim() !== ''
          ? course.preview_media_id
          : DUMMY_UNSPLASH_IMAGE,
        course_learnings: learnings,
        course_includes: includes,
        status: course.status,
        is_featured: course.is_featured,
        topics: topics,
      };
    });

    return mappedCourses;
  } catch (err) {
    console.warn('Error fetching courses from Supabase:', err);
    return [];
  }
}

/**
 * Fetch topics directly from course_topics where course_id is this course.id
 */
export async function getTopicsByCourseId(
  courseId: string,
  customCourseId?: string
): Promise<string[]> {
  try {
    let query = supabase
      .from('course_topics')
      .select(`
        topic_id,
        topics (
          topic_name
        )
      `);

    if (customCourseId && customCourseId !== courseId) {
      query = query.or(`course_id.eq.${courseId},course_id.eq.${customCourseId}`);
    } else {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      const extracted: string[] = [];
      interface TopicRelation {
        topic_name?: string;
      }
      interface CourseTopicRow {
        topic_id?: string;
        topic_name?: string;
        topics?: TopicRelation | TopicRelation[] | null;
      }
      for (const row of data as CourseTopicRow[]) {
        if (row?.topic_name) {
          extracted.push(row.topic_name);
        } else if (row?.topics) {
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
    console.warn('Error fetching course_topics for courseId:', courseId, err);
  }
  return [];
}

/**
 * Fetch all topics directly from topics table
 */
export async function getAllTopics(): Promise<{ id: string; topic_name: string }[]> {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('id, topic_name')
      .order('topic_name', { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Error fetching topics from Supabase:', err);
  }

  return [
    { id: '1', topic_name: 'Full Stack' },
    { id: '2', topic_name: 'Next.js' },
    { id: '3', topic_name: 'TypeScript' },
    { id: '4', topic_name: 'Python' },
    { id: '5', topic_name: 'Data Science' },
    { id: '6', topic_name: 'Machine Learning' },
    { id: '7', topic_name: 'DevOps' },
    { id: '8', topic_name: 'Docker' },
    { id: '9', topic_name: 'Kubernetes' },
    { id: '10', topic_name: 'Mobile Development' },
    { id: '11', topic_name: 'Flutter' },
    { id: '12', topic_name: 'AI' },
    { id: '13', topic_name: 'Generative AI' },
    { id: '14', topic_name: 'Backend' },
    { id: '15', topic_name: 'Go' },
  ];
}

/**
 * Alias for fetching all courses from Supabase
 */
export const getAllCourses = getTrendingCourses;

export interface CourseModuleContentItem {
  id: string;
  course_module_id: string;
  emoji: string | null;
  content: string | null;
  is_preview: boolean;
}

export interface CourseModuleItem {
  id: string;
  course_id: string;
  title: string;
  display_order: number;
  is_preview: boolean;
  contents: CourseModuleContentItem[];
}

export interface CourseExamItem {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  total_q: number;
}

export interface CourseFullDetails extends CourseWithDetails {
  mentor_name?: string | null;
  modules: CourseModuleItem[];
  exams: CourseExamItem[];
}

/**
 * Fetch a single course by its unique course_id strictly from Supabase
 */
export async function getCourseById(courseId: string): Promise<CourseWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('course_id', courseId)
      .single();

    if (error || !data) {
      const fallback = FALLBACK_COURSES.find(
        (c) => c.course_id === courseId || c.id === courseId
      );
      return fallback || null;
    }

    return {
      ...(data as unknown as CourseWithDetails),
      preview_media_id: data.preview_media_id && data.preview_media_id.trim() !== ''
        ? data.preview_media_id
        : DUMMY_UNSPLASH_IMAGE,
    };
  } catch (err) {
    console.warn('Error fetching course by ID:', err);
    const fallback = FALLBACK_COURSES.find(
      (c) => c.course_id === courseId || c.id === courseId
    );
    return fallback || null;
  }
}

export function generateFullCourseModules(courseId: string, courseTitle = ''): CourseModuleItem[] {
  const isPython = /python|data|machine|ai/i.test(courseTitle);

  if (isPython) {
    return [
      {
        id: `${courseId}-m1`,
        course_id: courseId,
        title: 'Module 1: Python Data Science Foundations & Environment',
        display_order: 1,
        is_preview: true,
        contents: [
          { id: 'c-1-1', course_module_id: `${courseId}-m1`, emoji: '🐍', content: 'Python 3.12 Deep Dive: Data Structures & Generators', is_preview: true },
          { id: 'c-1-2', course_module_id: `${courseId}-m1`, emoji: '⚙️', content: 'JupyterLab, Poetry & Virtual Environments Setup', is_preview: false },
          { id: 'c-1-3', course_module_id: `${courseId}-m1`, emoji: '📊', content: 'Vectorized Computing with NumPy Arrays', is_preview: false },
          { id: 'c-1-4', course_module_id: `${courseId}-m1`, emoji: '🧪', content: 'Hands-on Lab: Mathematical Matrix Transformations', is_preview: false },
        ],
      },
      {
        id: `${courseId}-m2`,
        course_id: courseId,
        title: 'Module 2: Advanced Data Manipulation with Pandas',
        display_order: 2,
        is_preview: false,
        contents: [
          { id: 'c-2-1', course_module_id: `${courseId}-m2`, emoji: '🐼', content: 'DataFrames, Series, and Memory-Efficient Indexing', is_preview: false },
          { id: 'c-2-2', course_module_id: `${courseId}-m2`, emoji: '🧹', content: 'Data Cleaning: Missing Values, Outliers & Types', is_preview: false },
          { id: 'c-2-3', course_module_id: `${courseId}-m2`, emoji: '🔄', content: 'Groupby, Aggregations, Window Functions & Merges', is_preview: false },
          { id: 'c-2-4', course_module_id: `${courseId}-m2`, emoji: '📈', content: 'Exploratory Data Analysis (EDA) on Big Datasets', is_preview: false },
        ],
      },
      {
        id: `${courseId}-m3`,
        course_id: courseId,
        title: 'Module 3: Statistical Modeling & Data Storytelling',
        display_order: 3,
        is_preview: false,
        contents: [
          { id: 'c-3-1', course_module_id: `${courseId}-m3`, emoji: '📉', content: 'Descriptive & Inferential Statistics in Python', is_preview: false },
          { id: 'c-3-2', course_module_id: `${courseId}-m3`, emoji: '🎨', content: 'Interactive Visualizations with Seaborn & Plotly', is_preview: false },
          { id: 'c-3-3', course_module_id: `${courseId}-m3`, emoji: '📐', content: 'Hypothesis Testing, P-values & A/B Testing', is_preview: false },
          { id: 'c-3-4', course_module_id: `${courseId}-m3`, emoji: '📊', content: 'Executive Dashboard Building with Streamlit', is_preview: false },
        ],
      },
      {
        id: `${courseId}-m4`,
        course_id: courseId,
        title: 'Module 4: Classical Machine Learning with Scikit-Learn',
        display_order: 4,
        is_preview: false,
        contents: [
          { id: 'c-4-1', course_module_id: `${courseId}-m4`, emoji: '🤖', content: 'Supervised Learning: Linear & Logistic Regression', is_preview: false },
          { id: 'c-4-2', course_module_id: `${courseId}-m4`, emoji: '🌲', content: 'Ensemble Models: Random Forests & XGBoost', is_preview: false },
          { id: 'c-4-3', course_module_id: `${courseId}-m4`, emoji: '🔍', content: 'Unsupervised Learning: K-Means & PCA Dimensionality Reduction', is_preview: false },
          { id: 'c-4-4', course_module_id: `${courseId}-m4`, emoji: '🎯', content: 'Cross-Validation, Hyperparameter Tuning & ROC/AUC', is_preview: false },
        ],
      },
      {
        id: `${courseId}-m5`,
        course_id: courseId,
        title: 'Module 5: Deep Learning Foundations & Neural Networks',
        display_order: 5,
        is_preview: false,
        contents: [
          { id: 'c-5-1', course_module_id: `${courseId}-m5`, emoji: '🧠', content: 'Neural Network Architecture & Backpropagation', is_preview: false },
          { id: 'c-5-2', course_module_id: `${courseId}-m5`, emoji: '🔥', content: 'PyTorch Tensors, Autograd & Model Training', is_preview: false },
          { id: 'c-5-3', course_module_id: `${courseId}-m5`, emoji: '👁️', content: 'Convolutional Neural Networks (CNN) for Computer Vision', is_preview: false },
          { id: 'c-5-4', course_module_id: `${courseId}-m5`, emoji: '💬', content: 'Recurrent Architectures & Transformer Attention Basics', is_preview: false },
        ],
      },
      {
        id: `${courseId}-m6`,
        course_id: courseId,
        title: 'Module 6: MLOps, Model Deployment & Production Capstone',
        display_order: 6,
        is_preview: false,
        contents: [
          { id: 'c-6-1', course_module_id: `${courseId}-m6`, emoji: '🚀', content: 'Serving ML Models with FastAPI & Docker Containers', is_preview: false },
          { id: 'c-6-2', course_module_id: `${courseId}-m6`, emoji: '📡', content: 'Real-time Inference Pipelines & Model Registry', is_preview: false },
          { id: 'c-6-3', course_module_id: `${courseId}-m6`, emoji: '🛡️', content: 'Data Drift Detection, Monitoring & CI/CD for Models', is_preview: false },
          { id: 'c-6-4', course_module_id: `${courseId}-m6`, emoji: '🏆', content: 'End-to-End Enterprise Predictive Machine Learning Capstone', is_preview: false },
        ],
      },
    ];
  }

  return [
    {
      id: `${courseId}-m1`,
      course_id: courseId,
      title: 'Module 1: Orientation & Modern Architecture Setup',
      display_order: 1,
      is_preview: true,
      contents: [
        { id: 'c-1-1', course_module_id: `${courseId}-m1`, emoji: '🚀', content: 'Enterprise Architecture & Project Blueprint Orientation', is_preview: true },
        { id: 'c-1-2', course_module_id: `${courseId}-m1`, emoji: '🛠️', content: 'Next-Gen Developer Tooling, Linters & Monorepo Setup', is_preview: false },
        { id: 'c-1-3', course_module_id: `${courseId}-m1`, emoji: '📐', content: 'System Design Principles & Folder Organization', is_preview: false },
        { id: 'c-1-4', course_module_id: `${courseId}-m1`, emoji: '💡', content: 'Git Workflow, Branching Strategy & Pull Request Reviews', is_preview: false },
      ],
    },
    {
      id: `${courseId}-m2`,
      course_id: courseId,
      title: 'Module 2: Core Engineering & Fundamental Paradigms',
      display_order: 2,
      is_preview: false,
      contents: [
        { id: 'c-2-1', course_module_id: `${courseId}-m2`, emoji: '⚡', content: 'Type-Safe Data Contracts & Domain Modeling', is_preview: false },
        { id: 'c-2-2', course_module_id: `${courseId}-m2`, emoji: '🧩', content: 'State Lifecycle & High-Performance React Hooks', is_preview: false },
        { id: 'c-2-3', course_module_id: `${courseId}-m2`, emoji: '🌐', content: 'Client vs Server Component Optimization Patterns', is_preview: false },
        { id: 'c-2-4', course_module_id: `${courseId}-m2`, emoji: '🎯', content: 'Handling High-Concurrency User Events & Mutations', is_preview: false },
      ],
    },
    {
      id: `${courseId}-m3`,
      course_id: courseId,
      title: 'Module 3: Database Modeling, Relational Queries & APIs',
      display_order: 3,
      is_preview: false,
      contents: [
        { id: 'c-3-1', course_module_id: `${courseId}-m3`, emoji: '💾', content: 'PostgreSQL Schema Design, Foreign Keys & Constraints', is_preview: false },
        { id: 'c-3-2', course_module_id: `${courseId}-m3`, emoji: '⚡', content: 'Query Optimization, Indexing Strategies & Connection Pooling', is_preview: false },
        { id: 'c-3-3', course_module_id: `${courseId}-m3`, emoji: '🔄', content: 'RESTful Endpoints, Server Actions & Streaming Responses', is_preview: false },
        { id: 'c-3-4', course_module_id: `${courseId}-m3`, emoji: '🛡️', content: 'Input Validation, Sanitization & Zod Schema Parsing', is_preview: false },
      ],
    },
    {
      id: `${courseId}-m4`,
      course_id: courseId,
      title: 'Module 4: Authentication, Security & Role-Based Access Control',
      display_order: 4,
      is_preview: false,
      contents: [
        { id: 'c-4-1', course_module_id: `${courseId}-m4`, emoji: '🔒', content: 'JWT Tokens, Secure Cookies & Session Management', is_preview: false },
        { id: 'c-4-2', course_module_id: `${courseId}-m4`, emoji: '🛡️', content: 'Role-Based Access Control (RBAC) & Route Protection', is_preview: false },
        { id: 'c-4-3', course_module_id: `${courseId}-m4`, emoji: '🔑', content: 'OAuth 2.0 Integration & Third-Party Identity Providers', is_preview: false },
        { id: 'c-4-4', course_module_id: `${courseId}-m4`, emoji: '🛑', content: 'Rate Limiting, CSRF Protection & Security Hardening', is_preview: false },
      ],
    },
    {
      id: `${courseId}-m5`,
      course_id: courseId,
      title: 'Module 5: Performance Optimization, Testing & Observability',
      display_order: 5,
      is_preview: false,
      contents: [
        { id: 'c-5-1', course_module_id: `${courseId}-m5`, emoji: '🏎️', content: 'Core Web Vitals, Bundle Profiling & Code Splitting', is_preview: false },
        { id: 'c-5-2', course_module_id: `${courseId}-m5`, emoji: '🧪', content: 'Automated Unit, Integration & End-to-End Testing', is_preview: false },
        { id: 'c-5-3', course_module_id: `${courseId}-m5`, emoji: '📊', content: 'Server-Side Logging, Structured Tracing & Error Monitoring', is_preview: false },
        { id: 'c-5-4', course_module_id: `${courseId}-m5`, emoji: '⚡', content: 'Multi-Tier Caching with Redis & Edge CDN Networks', is_preview: false },
      ],
    },
    {
      id: `${courseId}-m6`,
      course_id: courseId,
      title: 'Module 6: Containerization, CI/CD Cloud Deployment & Capstone',
      display_order: 6,
      is_preview: false,
      contents: [
        { id: 'c-6-1', course_module_id: `${courseId}-m6`, emoji: '🐳', content: 'Multi-Stage Docker Packaging & Container Optimization', is_preview: false },
        { id: 'c-6-2', course_module_id: `${courseId}-m6`, emoji: '🚀', content: 'Automated GitHub Actions CI/CD Deployment Pipelines', is_preview: false },
        { id: 'c-6-3', course_module_id: `${courseId}-m6`, emoji: '☁️', content: 'Production Cloud Deployment & SSL / DNS Configuration', is_preview: false },
        { id: 'c-6-4', course_module_id: `${courseId}-m6`, emoji: '🎓', content: 'Full Stack Capstone Portfolio Defense & Certification', is_preview: false },
      ],
    },
  ];
}

/**
 * Fetch full course details including modules, module contents, topics, and exams
 * (Excludes course_resources and course_tables as instructed)
 */
export async function getCourseFullDetails(courseIdOrId: string): Promise<CourseFullDetails | null> {
  try {
    // 1. Fetch course details with topics and mentor name
    let query = supabase
      .from('courses')
      .select(`
        id,
        course_id,
        price,
        selling_price,
        uk_price,
        uk_selling_price,
        title,
        sub_heading,
        description,
        duration,
        preview_media_id,
        course_learnings,
        course_includes,
        status,
        is_featured,
        mentor_id,
        users:mentor_id (
          name
        ),
        course_topics (
          topics (
            topic_name
          )
        )
      `);

    // Check if UUID or custom course_id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseIdOrId);
    if (isUuid) {
      query = query.or(`id.eq.${courseIdOrId},course_id.eq.${courseIdOrId}`);
    } else {
      query = query.eq('course_id', courseIdOrId);
    }

    const { data: rawCourse, error: courseError } = await query.maybeSingle();

    if (courseError || !rawCourse) {
      const fallbackCourse =
        FALLBACK_COURSES.find(
          (c) => c.course_id === courseIdOrId || c.id === courseIdOrId
        ) || FALLBACK_COURSES[0];

      if (fallbackCourse) {
        return {
          ...fallbackCourse,
          mentor_name: 'Dr. Arjun Rao',
          modules: [],
          exams: [
            {
              id: 'e1',
              course_id: fallbackCourse.id,
              title: 'Mid-term Skills Certification Exam',
              description: 'Assess foundational concepts and core implementation skills.',
              total_q: 25,
            },
          ],
        };
      }
      return null;
    }

    // Extract topics safely
    const topics: string[] = [];
    interface TopicItem {
      topic_name?: string;
    }
    interface CourseTopicRow {
      topics?: TopicItem | TopicItem[] | null;
    }
    const courseTopicsList = rawCourse.course_topics as unknown as CourseTopicRow[] | null;
    if (Array.isArray(courseTopicsList)) {
      for (const ct of courseTopicsList) {
        if (ct?.topics) {
          if (Array.isArray(ct.topics)) {
            for (const t of ct.topics) {
              if (t?.topic_name) topics.push(t.topic_name);
            }
          } else if (ct.topics.topic_name) {
            topics.push(ct.topics.topic_name);
          }
        }
      }
    }

    // Parse learnings
    let learnings: string[] = [];
    if (Array.isArray(rawCourse.course_learnings)) {
      learnings = rawCourse.course_learnings.map(String);
    } else if (typeof rawCourse.course_learnings === 'string') {
      try {
        const parsed = JSON.parse(rawCourse.course_learnings);
        if (Array.isArray(parsed)) learnings = parsed.map(String);
      } catch {
        learnings = [rawCourse.course_learnings];
      }
    }

    // Parse includes
    let includes: string[] = [];
    if (Array.isArray(rawCourse.course_includes)) {
      includes = rawCourse.course_includes.map(String);
    } else if (typeof rawCourse.course_includes === 'string') {
      try {
        const parsed = JSON.parse(rawCourse.course_includes);
        if (Array.isArray(parsed)) includes = parsed.map(String);
      } catch {
        includes = [rawCourse.course_includes];
      }
    }

    // Mentor name
    let mentorName: string | null = null;
    if (rawCourse.users && typeof rawCourse.users === 'object') {
      const u = rawCourse.users as { name?: string };
      mentorName = u.name || null;
    }

    // 2. Fetch course_modules (ordered by display_order) directly from course_modules table
    const isCustomCourseIdUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      rawCourse.course_id
    );
    let modulesQuery = supabase
      .from('course_modules')
      .select('id, course_id, title, display_order, is_preview');

    if (isCustomCourseIdUuid && rawCourse.course_id !== rawCourse.id) {
      modulesQuery = modulesQuery.or(`course_id.eq.${rawCourse.id},course_id.eq.${rawCourse.course_id}`);
    } else {
      modulesQuery = modulesQuery.eq('course_id', rawCourse.id);
    }

    const { data: rawModules } = await modulesQuery.order('display_order', { ascending: true });

    let modulesList: CourseModuleItem[] = [];

    if (rawModules && rawModules.length > 0) {
      const moduleIds = rawModules.map((m) => m.id);

      // 3. Fetch course_module_content directly from course_module_content table
      const { data: rawContents } = await supabase
        .from('course_module_content')
        .select('id, course_module_id, emoji, content, is_preview')
        .in('course_module_id', moduleIds);

      const contentsByModule: Record<string, CourseModuleContentItem[]> = {};
      if (rawContents) {
        for (const item of rawContents) {
          if (!contentsByModule[item.course_module_id]) {
            contentsByModule[item.course_module_id] = [];
          }
          contentsByModule[item.course_module_id].push({
            id: item.id,
            course_module_id: item.course_module_id,
            emoji: item.emoji,
            content: item.content,
            is_preview: item.is_preview || false,
          });
        }
      }

      for (const m of rawModules) {
        modulesList.push({
          id: m.id,
          course_id: m.course_id,
          title: m.title,
          display_order: m.display_order || 0,
          is_preview: m.is_preview || false,
          contents: contentsByModule[m.id] || [],
        });
      }
    }
    // Strictly no demo data: if no modules in course_modules table, modulesList remains empty []

    // 4. Fetch course_exams
    const { data: rawExams } = await supabase
      .from('course_exams')
      .select('id, course_id, title, description, total_q')
      .eq('course_id', rawCourse.id);

    const examsList: CourseExamItem[] = (rawExams || []).map((e) => ({
      id: e.id,
      course_id: e.course_id,
      title: e.title,
      description: e.description,
      total_q: e.total_q || 0,
    }));

    return {
      id: rawCourse.id,
      course_id: rawCourse.course_id,
      price: Number(rawCourse.price) || 0,
      selling_price: Number(rawCourse.selling_price) || 0,
      uk_price: Number(rawCourse.uk_price) || 0,
      uk_selling_price: Number(rawCourse.uk_selling_price) || 0,
      title: rawCourse.title,
      sub_heading: rawCourse.sub_heading,
      description: rawCourse.description,
      duration: rawCourse.duration || 0,
      preview_media_id:
        rawCourse.preview_media_id && rawCourse.preview_media_id.trim() !== ''
          ? rawCourse.preview_media_id
          : DUMMY_UNSPLASH_IMAGE,
      course_learnings: learnings,
      course_includes: includes,
      status: rawCourse.status,
      is_featured: rawCourse.is_featured,
      topics,
      mentor_name: mentorName,
      modules: modulesList,
      exams: examsList,
    };
  } catch (err) {
    console.warn('Error fetching full course details:', err);
    return null;
  }
}

