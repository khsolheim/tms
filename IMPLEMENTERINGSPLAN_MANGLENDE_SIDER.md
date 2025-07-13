# IMPLEMENTERINGSPLAN FOR MANGLENDE SIDER

## 1. DASHBOARD IMPLEMENTERING

### 1.1 Database-tabeller
```sql
-- Dashboard widgets konfigurasjon
CREATE TABLE dashboard_widgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    widget_type VARCHAR(50),
    position_x INTEGER,
    position_y INTEGER,
    width INTEGER,
    height INTEGER,
    config JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Dashboard nøkkeltall cache
CREATE TABLE dashboard_metrics (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50),
    value JSONB,
    last_updated TIMESTAMP DEFAULT NOW()
);
```

### 1.2 Komponenter som trengs

#### DashboardWidget.tsx
```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardWidgetProps {
  type: 'metrics' | 'chart' | 'list' | 'activity';
  title: string;
  config: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  type,
  title,
  config,
  position,
  size
}) => {
  const renderWidgetContent = () => {
    switch (type) {
      case 'metrics':
        return <MetricsCard config={config} />;
      case 'chart':
        return <ChartWidget config={config} />;
      case 'list':
        return <ActivityFeed config={config} />;
      default:
        return <div>Ukjent widget-type</div>;
    }
  };

  return (
    <div
      className="absolute"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderWidgetContent()}
        </CardContent>
      </Card>
    </div>
  );
};
```

#### MetricsCard.tsx
```typescript
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Building, FileText } from 'lucide-react';

interface MetricsCardProps {
  config: {
    type: 'bedrifter' | 'elever' | 'kontrakter' | 'oppgaver';
    value: number;
    change: number;
    period: string;
  };
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ config }) => {
  const getIcon = () => {
    switch (config.type) {
      case 'bedrifter':
        return <Building className="h-8 w-8 text-blue-600" />;
      case 'elever':
        return <Users className="h-8 w-8 text-green-600" />;
      case 'kontrakter':
        return <FileText className="h-8 w-8 text-purple-600" />;
      default:
        return <TrendingUp className="h-8 w-8 text-gray-600" />;
    }
  };

  const getTitle = () => {
    switch (config.type) {
      case 'bedrifter':
        return 'Aktive Bedrifter';
      case 'elever':
        return 'Registrerte Elever';
      case 'kontrakter':
        return 'Aktive Kontrakter';
      default:
        return 'Oppgaver';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{getTitle()}</p>
            <p className="text-2xl font-bold text-gray-900">{config.value}</p>
            <div className="flex items-center mt-2">
              {config.change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm ml-1 ${config.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(config.change)}% {config.period}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

### 1.3 Oppdatert Dashboard.tsx
```typescript
import React, { useState, useEffect } from 'react';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface DashboardData {
  metrics: {
    bedrifter: { value: number; change: number };
    elever: { value: number; change: number };
    kontrakter: { value: number; change: number };
    oppgaver: { value: number; change: number };
  };
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
  widgets: Array<{
    id: string;
    type: string;
    title: string;
    config: any;
    position: { x: number; y: number };
    size: { width: number; height: number };
  }>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Feil ved henting av dashboard-data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Laster dashboard...</div>;
  }

  if (!dashboardData) {
    return <div>Kunne ikke laste dashboard-data</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Velkommen tilbake, {user?.name}!
        </h1>
        <QuickActions />
      </div>

      {/* Nøkkeltall */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard config={{ type: 'bedrifter', ...dashboardData.metrics.bedrifter, period: 'denne måneden' }} />
        <MetricsCard config={{ type: 'elever', ...dashboardData.metrics.elever, period: 'denne måneden' }} />
        <MetricsCard config={{ type: 'kontrakter', ...dashboardData.metrics.kontrakter, period: 'denne måneden' }} />
        <MetricsCard config={{ type: 'oppgaver', ...dashboardData.metrics.oppgaver, period: 'denne måneden' }} />
      </div>

      {/* Widgets */}
      <div className="relative min-h-[600px] bg-gray-50 rounded-lg p-4">
        {dashboardData.widgets.map((widget) => (
          <DashboardWidget
            key={widget.id}
            type={widget.type as any}
            title={widget.title}
            config={widget.config}
            position={widget.position}
            size={widget.size}
          />
        ))}
      </div>

      {/* Aktivitetsfeed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed activities={dashboardData.recentActivity} />
      </div>
    </div>
  );
}
```

## 2. KALENDER IMPLEMENTERING

### 2.1 Database-tabeller
```sql
-- Kalenderhendelser
CREATE TABLE calendar_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    event_type VARCHAR(50) DEFAULT 'general',
    user_id INTEGER REFERENCES users(id),
    resource_id INTEGER,
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_all_day BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Kalenderressurser
CREATE TABLE calendar_resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Kalenderpåminnelser
CREATE TABLE calendar_reminders (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES calendar_events(id) ON DELETE CASCADE,
    reminder_time TIMESTAMP NOT NULL,
    reminder_type VARCHAR(50) DEFAULT 'email',
    is_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.2 Komponenter som trengs

#### CalendarView.tsx
```typescript
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventModal } from './EventModal';
import { api } from '@/lib/api';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color?: string;
  extendedProps: {
    description?: string;
    eventType?: string;
    resourceId?: number;
  };
}

export const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/calendar/events');
      const formattedEvents = response.data.map((event: any) => ({
        id: event.id.toString(),
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        color: event.color,
        extendedProps: {
          description: event.description,
          eventType: event.event_type,
          resourceId: event.resource_id
        }
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Feil ved henting av kalenderhendelser:', error);
    }
  };

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
    setIsModalOpen(true);
  };

  const handleDateSelect = (selectInfo: any) => {
    setSelectedEvent({
      id: '',
      title: '',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      extendedProps: {}
    });
    setIsModalOpen(true);
  };

  const handleEventSave = async (eventData: any) => {
    try {
      if (eventData.id) {
        await api.put(`/calendar/events/${eventData.id}`, eventData);
      } else {
        await api.post('/calendar/events', eventData);
      }
      fetchEvents();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Feil ved lagring av hendelse:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Kalender</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('dayGridMonth')}
            className={`px-4 py-2 rounded ${view === 'dayGridMonth' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Måned
          </button>
          <button
            onClick={() => setView('timeGridWeek')}
            className={`px-4 py-2 rounded ${view === 'timeGridWeek' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Uke
          </button>
          <button
            onClick={() => setView('timeGridDay')}
            className={`px-4 py-2 rounded ${view === 'timeGridDay' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Dag
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={false}
          initialView={view}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={async (info) => {
            try {
              await api.put(`/calendar/events/${info.event.id}`, {
                start_time: info.event.start,
                end_time: info.event.end
              });
            } catch (error) {
              console.error('Feil ved oppdatering av hendelse:', error);
              info.revert();
            }
          }}
          eventResize={async (info) => {
            try {
              await api.put(`/calendar/events/${info.event.id}`, {
                start_time: info.event.start,
                end_time: info.event.end
              });
            } catch (error) {
              console.error('Feil ved oppdatering av hendelse:', error);
              info.revert();
            }
          }}
        />
      </div>

      {isModalOpen && (
        <EventModal
          event={selectedEvent}
          onSave={handleEventSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
```

### 2.3 Oppdatert Kalender.tsx
```typescript
import React from 'react';
import { CalendarView } from '@/components/calendar/CalendarView';

export default function Kalender() {
  return (
    <div className="container mx-auto px-4 py-6">
      <CalendarView />
    </div>
  );
}
```

## 3. NYHETER IMPLEMENTERING

### 3.1 Database-tabeller
```sql
-- Nyhetsartikler
CREATE TABLE news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id INTEGER REFERENCES users(id),
    category_id INTEGER REFERENCES news_categories(id),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    featured_image VARCHAR(255),
    slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Nyhetskategorier
CREATE TABLE news_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slug VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Nyhetsabonnementer
CREATE TABLE news_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    category_id INTEGER REFERENCES news_categories(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, category_id)
);
```

### 3.2 Komponenter som trengs

#### NewsList.tsx
```typescript
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  author: {
    name: string;
  };
  category: {
    name: string;
  };
  published_at: string;
  featured_image?: string;
  slug: string;
}

interface NewsCategory {
  id: number;
  name: string;
  slug: string;
}

export const NewsList: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/news/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Feil ved henting av kategorier:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await api.get(`/news/articles?${params}`);
      setArticles(response.data);
    } catch (error) {
      console.error('Feil ved henting av artikler:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div>Laster nyheter...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Nyheter</h1>
        <Button>Skriv ny artikkel</Button>
      </div>

      <div className="flex space-x-4">
        <Input
          placeholder="Søk i nyheter..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Velg kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle kategorier</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Card key={article.id} className="hover:shadow-lg transition-shadow">
            {article.featured_image && (
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            )}
            <CardHeader>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{article.category.name}</span>
                <span>{formatDate(article.published_at)}</span>
              </div>
              <CardTitle className="text-lg">{article.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 line-clamp-3">{article.excerpt}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">Av {article.author.name}</span>
                <Button variant="outline" size="sm">
                  Les mer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
```

### 3.3 Oppdatert Nyheter.tsx
```typescript
import React from 'react';
import { NewsList } from '@/components/news/NewsList';

export default function Nyheter() {
  return (
    <div className="container mx-auto px-4 py-6">
      <NewsList />
    </div>
  );
}
```

## 4. OPPGAVER KOMPLETT IMPLEMENTERING

### 4.1 Database-tabeller
```sql
-- Prosjekter
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    manager_id INTEGER REFERENCES users(id),
    priority VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Oppgaver
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_id INTEGER REFERENCES projects(id),
    assigned_to INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(20) DEFAULT 'medium',
    due_date DATE,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tidsregistrering
CREATE TABLE time_entries (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id),
    user_id INTEGER REFERENCES users(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 Komponenter som trengs

#### TaskList.tsx
```typescript
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  assigned_to: {
    name: string;
  };
  project: {
    name: string;
  };
  estimated_hours: number;
  actual_hours: number;
}

export const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Feil ved henting av oppgaver:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO');
  };

  if (loading) {
    return <div>Laster oppgaver...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Oppgaver</h1>
        <Button>Ny oppgave</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <div className="flex space-x-2">
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Prosjekt:</span>
                  <span>{task.project.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tildelt:</span>
                  <span>{task.assigned_to.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Frist:</span>
                  <span>{formatDate(task.due_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Timer:</span>
                  <span>{task.actual_hours || 0} / {task.estimated_hours || 0}</span>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <Button variant="outline" size="sm">
                  Rediger
                </Button>
                <Button variant="outline" size="sm">
                  Tidsregistrering
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
```

### 4.3 Oppdatert Oppgaver/Index.tsx
```typescript
import React from 'react';
import { TaskList } from '@/components/tasks/TaskList';

export default function Oppgaver() {
  return (
    <div className="container mx-auto px-4 py-6">
      <TaskList />
    </div>
  );
}
```

## 5. KONKLUSJON

Denne implementeringsplanen gir en detaljert oversikt over hvordan de manglende sidene kan implementeres. Hver seksjon inneholder:

1. **Database-tabeller** - Nødvendige tabeller for funksjonalitet
2. **Komponenter** - React-komponenter med TypeScript
3. **Oppdaterte sider** - Hvordan eksisterende sider skal oppdateres

**Neste steg**:
1. Implementer database-tabellene
2. Lag komponentene i riktige mapper
3. Oppdater eksisterende sider
4. Test funksjonalitet
5. Implementer API-endepunkter på backend

**Estimert tid for implementering**: 2-3 uker med 2-3 utviklere