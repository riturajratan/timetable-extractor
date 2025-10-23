# Frontend Strategy - Timetable Extraction System

**Recommended Frontend Implementation Strategy**

---

## 🎯 Overview

This document outlines the recommended frontend strategy for the Learning Yogi Timetable Extraction System. While the current prototype uses vanilla HTML/CSS/JavaScript, this strategy provides guidance for building a production-ready React application.

---

## 🛠️ Recommended Tech Stack

### Core Framework

**React 18+ with TypeScript**

**Justification:**
- Component reusability across timetable views
- Strong typing prevents runtime errors
- Excellent ecosystem for calendars and schedules
- Easy state management
- Server-side rendering capability (Next.js)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 📦 Key Libraries

### 1. State Management

**Option A: Zustand** (Recommended for simplicity)
```typescript
import create from 'zustand';

interface TimetableStore {
  timetable: TimetableData | null;
  setTimetable: (data: TimetableData) => void;
  isLoading: boolean;
  error: string | null;
}

const useTimetableStore = create<TimetableStore>((set) => ({
  timetable: null,
  isLoading: false,
  error: null,
  setTimetable: (data) => set({ timetable: data }),
}));
```

**Option B: React Query** (Recommended for API-heavy apps)
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['timetable', fileId],
  queryFn: () => extractTimetable(file),
});
```

**Why?**
- Zustand: Minimal boilerplate, perfect for simple state
- React Query: Built-in caching, refetching, optimistic updates

### 2. Calendar/Timetable Display

**FullCalendar** (Recommended)

```typescript
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

<FullCalendar
  plugins={[timeGridPlugin]}
  initialView="timeGridWeek"
  events={timetableEvents}
  slotMinTime="08:00"
  slotMaxTime="16:00"
  headerToolbar={{
    left: 'prev,next today',
    center: 'title',
    right: 'timeGridWeek,timeGridDay'
  }}
/>
```

**Alternative: DayPilot**
- More customizable
- Better for complex scheduling
- Commercial license required for production

**Alternative: Custom Grid**
```typescript
const TimetableGrid = ({ timeblocks }: Props) => {
  const byDay = groupBy(timeblocks, 'day');

  return (
    <div className="grid grid-cols-5 gap-4">
      {Object.entries(byDay).map(([day, blocks]) => (
        <DayColumn key={day} day={day} blocks={blocks} />
      ))}
    </div>
  );
};
```

### 3. File Upload

**react-dropzone**

```typescript
import { useDropzone } from 'react-dropzone';

const FileUpload = ({ onUpload }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024,
    onDrop: (files) => onUpload(files[0])
  });

  return (
    <div {...getRootProps()} className={isDragActive ? 'dragging' : ''}>
      <input {...getInputProps()} />
      <p>Drag & drop your timetable here</p>
    </div>
  );
};
```

### 4. Styling

**TailwindCSS** (Recommended)

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#ec4899',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    }
  }
}
```

**Why Tailwind?**
- Rapid development
- Consistent design system
- Responsive out of the box
- Small bundle size (purged)
- Great with component libraries

**Alternative: styled-components**
```typescript
import styled from 'styled-components';

const TimeBlock = styled.div<{ type: string }>`
  padding: 1rem;
  border-radius: 0.5rem;
  background: ${({ type }) => getColorForType(type)};
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;
```

### 5. Form Handling

**React Hook Form**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const TimetableForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(timetableSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('file')} type="file" />
      {errors.file && <span>{errors.file.message}</span>}
    </form>
  );
};
```

### 6. HTTP Client

**Axios** (with interceptors)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4012/api',
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  // Add auth token, etc.
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    return Promise.reject(error);
  }
);

export const extractTimetable = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/extract', formData);
  return data;
};
```

### 7. Build Tool

**Vite** (Recommended)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4012',
        changeOrigin: true,
      }
    }
  }
});
```

**Why Vite?**
- Lightning fast HMR
- ESM-based (modern)
- Built-in TypeScript support
- Optimized production builds

---

## 🏗️ Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Loading.tsx
│   │   └── ErrorMessage.tsx
│   ├── upload/
│   │   ├── FileUpload.tsx
│   │   ├── UploadProgress.tsx
│   │   └── UploadZone.tsx
│   ├── timetable/
│   │   ├── TimetableView.tsx
│   │   ├── TimetableGrid.tsx
│   │   ├── DayColumn.tsx
│   │   ├── TimeBlock.tsx
│   │   └── TimetableFilters.tsx
│   ├── stats/
│   │   ├── StatsCard.tsx
│   │   └── StatsGrid.tsx
│   └── metadata/
│       ├── MetadataSection.tsx
│       └── MetadataItem.tsx
├── hooks/
│   ├── useTimetableExtraction.ts
│   ├── useFileUpload.ts
│   └── useTimetableView.ts
├── services/
│   ├── api.ts
│   ├── timetableService.ts
│   └── fileService.ts
├── types/
│   ├── timetable.ts
│   └── api.ts
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── colors.ts
├── store/
│   └── timetableStore.ts
├── pages/
│   ├── Home.tsx
│   ├── Upload.tsx
│   └── Results.tsx
└── App.tsx
```

### Key Components

#### 1. FileUpload Component

```typescript
interface FileUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isLoading }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    onDrop: (files) => onUpload(files[0]),
    disabled: isLoading,
  });

  return (
    <div {...getRootProps()} className="upload-zone">
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the file here...</p>
      ) : (
        <p>Drag & drop your timetable, or click to select</p>
      )}
    </div>
  );
};
```

#### 2. TimetableGrid Component

```typescript
interface TimetableGridProps {
  timeblocks: TimeBlock[];
  viewMode: 'week' | 'day';
}

const TimetableGrid: React.FC<TimetableGridProps> = ({ timeblocks, viewMode }) => {
  const groupedBlocks = groupByDay(timeblocks);

  if (viewMode === 'week') {
    return (
      <div className="grid grid-cols-5 gap-4">
        {WEEKDAYS.map((day) => (
          <DayColumn key={day} day={day} blocks={groupedBlocks[day] || []} />
        ))}
      </div>
    );
  }

  return <DayView blocks={timeblocks} />;
};
```

#### 3. TimeBlock Component

```typescript
interface TimeBlockProps {
  block: TimeBlock;
  onClick?: () => void;
}

const TimeBlock: React.FC<TimeBlockProps> = ({ block, onClick }) => {
  const bgColor = getColorForType(block.subject_type);

  return (
    <div
      className={`timeblock ${bgColor}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="flex justify-between items-start">
        <span className="time">{block.start_time} - {block.end_time}</span>
        <span className="duration">{block.duration_minutes}m</span>
      </div>
      <h3 className="subject">{block.subject}</h3>
      <span className={`badge type-${block.subject_type}`}>
        {block.subject_type}
      </span>
      {block.notes && <p className="notes">{block.notes}</p>}
    </div>
  );
};
```

### Custom Hooks

#### useTimetableExtraction Hook

```typescript
const useTimetableExtraction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TimetableData | null>(null);

  const extract = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await extractTimetable(file);
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
  };

  return { data, isLoading, error, extract, reset };
};
```

---

## 🎨 UI/UX Patterns

### 1. Loading States

**Skeleton Loaders**
```typescript
const TimetableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-24 bg-gray-200 rounded mb-4" />
    ))}
  </div>
);
```

**Progress Indicators**
```typescript
const UploadProgress = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div
      className="bg-primary h-2 rounded-full transition-all"
      style={{ width: `${progress}%` }}
    />
  </div>
);
```

### 2. Error States

```typescript
const ErrorMessage = ({ error, onRetry }: Props) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-center gap-2">
      <AlertCircle className="text-red-500" />
      <h3 className="font-semibold text-red-900">Extraction Failed</h3>
    </div>
    <p className="text-red-700 mt-2">{error}</p>
    <button onClick={onRetry} className="mt-4 btn-secondary">
      Try Again
    </button>
  </div>
);
```

### 3. Empty States

```typescript
const EmptyState = () => (
  <div className="text-center py-12">
    <FileIcon className="w-24 h-24 mx-auto text-gray-300" />
    <h3 className="mt-4 text-lg font-medium">No Timetable Uploaded</h3>
    <p className="text-gray-500 mt-2">
      Upload a timetable to get started
    </p>
  </div>
);
```

### 4. Success Animations

```typescript
import { motion } from 'framer-motion';

const SuccessAnimation = () => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', duration: 0.5 }}
  >
    <CheckCircle className="w-16 h-16 text-green-500" />
  </motion.div>
);
```

---

## 📱 Responsive Design

### Breakpoints (Tailwind)

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
};
```

### Mobile-First Approach

```typescript
<div className="
  grid grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
  gap-4
">
  {/* Responsive grid */}
</div>
```

### Touch-Friendly Design

- Minimum tap target: 44x44px
- Swipe gestures for navigation
- Pull-to-refresh for data reload
- Bottom navigation on mobile

---

## ♿ Accessibility

### WCAG 2.1 AA Compliance

1. **Keyboard Navigation**
```typescript
<button
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  aria-label="Upload timetable"
>
  Upload
</button>
```

2. **Screen Reader Support**
```typescript
<div role="region" aria-label="Timetable view">
  <div role="list" aria-label="Monday schedule">
    {blocks.map((block) => (
      <div key={block.id} role="listitem">
        <span className="sr-only">
          {block.subject} from {block.start_time} to {block.end_time}
        </span>
      </div>
    ))}
  </div>
</div>
```

3. **Color Contrast**
- Minimum 4.5:1 for normal text
- 3:1 for large text
- Use semantic colors with sufficient contrast

4. **Focus Indicators**
```css
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

---

## 🚀 Performance Optimization

### 1. Code Splitting

```typescript
const TimetableView = lazy(() => import('./TimetableView'));

<Suspense fallback={<Loading />}>
  <TimetableView />
</Suspense>
```

### 2. Memoization

```typescript
const TimeBlockList = memo(({ blocks }: Props) => {
  return (
    <>
      {blocks.map(block => (
        <TimeBlock key={block.id} block={block} />
      ))}
    </>
  );
});
```

### 3. Virtual Scrolling

For large timetables:
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={timeblocks.length}
  itemSize={80}
>
  {({ index, style }) => (
    <div style={style}>
      <TimeBlock block={timeblocks[index]} />
    </div>
  )}
</FixedSizeList>
```

### 4. Image Optimization

```typescript
<Image
  src={timetableImage}
  alt="Timetable"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

---

## 🧪 Testing Strategy

### Unit Tests (Jest + React Testing Library)

```typescript
describe('TimeBlock', () => {
  it('renders subject name', () => {
    const block = createMockBlock({ subject: 'Maths' });
    render(<TimeBlock block={block} />);
    expect(screen.getByText('Maths')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    const block = createMockBlock();
    render(<TimeBlock block={block} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
describe('Timetable Upload Flow', () => {
  it('uploads file and displays results', async () => {
    render(<App />);

    const file = new File(['content'], 'timetable.png', { type: 'image/png' });
    const input = screen.getByLabelText('Upload file');

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('Maths')).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
test('complete timetable extraction flow', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await page.setInputFiles('input[type="file"]', 'test-timetable.png');

  await page.waitForSelector('.timetable-results');

  await expect(page.locator('.subject')).toHaveCount(25);
});
```

---

## 🔐 Security Best Practices

1. **Input Sanitization**
```typescript
const sanitizeFilename = (filename: string) =>
  filename.replace(/[^a-zA-Z0-9.-]/g, '_');
```

2. **XSS Prevention**
```typescript
import DOMPurify from 'dompurify';

const SafeHTML = ({ html }: { html: string }) => (
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
);
```

3. **CSRF Protection**
```typescript
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
```

---

## 📊 Analytics Integration

```typescript
import { analytics } from './analytics';

const trackTimetableExtraction = (file: File, success: boolean) => {
  analytics.track('Timetable Extracted', {
    fileType: file.type,
    fileSize: file.size,
    success,
    timestamp: new Date().toISOString(),
  });
};
```

---

## 🌐 Internationalization (i18n)

```typescript
import { useTranslation } from 'react-i18next';

const TimetableView = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('timetable.title')}</h1>
      <p>{t('timetable.description')}</p>
    </div>
  );
};
```

---

## 📦 Production Build

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "jest",
    "test:e2e": "playwright test"
  }
}
```

**Build Optimization:**
- Tree shaking
- Code splitting
- Asset optimization
- Source maps (for debugging)
- Bundle analysis (webpack-bundle-analyzer)

---

## 🚀 Deployment

### Vercel (Recommended for React)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "framework": "vite"
}
```

### Netlify

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 📝 Summary

**Recommended Stack:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Zustand (state management)
- React Query (API state)
- FullCalendar (timetable display)
- react-dropzone (file upload)
- Axios (HTTP client)

**Why This Stack?**
- Modern and performant
- Excellent developer experience
- Strong typing and safety
- Production-ready out of the box
- Scalable for future growth

This combination provides the best balance of developer experience, performance, and maintainability for the Timetable Extraction System.
