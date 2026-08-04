<template>
  <div class="nextcloud-calendar-widget">
    <div class="widget-header">
      <div class="widget-summary-wrapper">
        <div class="widget-summary" v-if="showEvents">
          {{ events.length }} upcoming event{{ events.length === 1 ? '' : 's' }}
          <span class="widget-note" v-if="options.pastDays === 0">• future only</span>
        </div>
      </div>
      <div class="widget-actions" v-if="showEvents && events.length > 1">
        <label class="display-label" for="event-count-select">Show</label>
        <select id="event-count-select" v-model="selectedDisplayLimit">
          <option v-for="item in displayOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
        </select>
        <span class="display-label">events</span>
      </div>
    </div>

    <div v-if="showEvents" class="section-card">
      <ul class="events-list">
        <li v-for="(ev, idx) in events.slice(0, displayLimit)" :key="ev.uid || idx" :class="[`event-card`, { past: ev.past }]">
          <div class="summary">{{ ev.summary }}</div>
          <div class="event-top-row">
            <span class="event-date">{{ formatEventRange(ev.start, ev.end, ev.allDay) }}</span>
            <span v-if="ev.allDay" class="event-badge">All-day</span>
          </div>
          <div class="desc" v-if="ev.description">{{ ev.description }}</div>
        </li>
      </ul>
      <div v-if="events.length > displayLimit" class="more-count">
        Showing {{ displayLimit }} of {{ events.length }} events
      </div>
    </div>

    <div v-if="showTasks" class="section-card">
      <ul class="tasks-list" v-if="tasks.length">
        <li v-for="(t, idx) in tasks.slice(0, taskLimit)" :key="t.uid || idx" :class="`task ${t.status || 'NEEDS-ACTION'}`">
          <div class="task-row">
            <div class="task-summary">{{ t.summary }}</div>
            <span v-if="t.status" class="task-status">{{ t.status }}</span>
          </div>
          <div class="task-meta" v-if="t.due">
            Due: {{ formatEventDate(t.due, false) }}
          </div>
          <div class="task-desc" v-if="t.description">{{ t.description }}</div>
        </li>
      </ul>
      <div v-else class="sep"><p>No tasks found</p></div>
    </div>

    <div v-if="!events.length && !tasks.length" class="sep">
      <p>No calendar items found</p>
    </div>
  </div>
</template>

<script>
import WidgetMixin from '@/mixins/WidgetMixin';
import NextcloudMixin from '@/mixins/NextcloudMixin';

export default {
  mixins: [WidgetMixin, NextcloudMixin],
  data() {
    return {
      events: [],
      tasks: [],
      selectedDisplayLimit: null,
    };
  },
  computed: {
    displayOptions() {
      const defaultOptions = [3, 5, 8, 10, 15];
      const limit = parseInt(this.options.limit, 10) || 5;
      const options = defaultOptions.includes(limit)
        ? [...defaultOptions]
        : [limit, ...defaultOptions].sort((a, b) => a - b);
      return [...options.map((value) => ({ value, label: String(value) })), { value: 'all', label: 'All' }];
    },
    displayLimit() {
      if (this.selectedDisplayLimit === 'all') {
        return this.events.length;
      }
      const chosen = Number(this.selectedDisplayLimit || this.options.limit || 5);
      return Number.isFinite(chosen) ? chosen : 5;
    },
    taskLimit() {
      return parseInt(this.options.taskLimit, 10) || 10;
    },
    showTasks() {
      return this.options.showTasks !== false && this.options.showTasks !== 'false';
    },
    showEvents() {
      return true;
    },
    icsUrl() {
      if (this.options.icsUrl) return this.parseAsEnvVar(this.options.icsUrl);
      if (this.options.calendarId) {
        return `${this.hostname}/remote.php/dav/calendars/${this.username}/${this.options.calendarId}`;
      }
      this.error('No calendar URL or calendarId provided in widget options');
      return null;
    },
  },
  methods: {
    allowedStatuscodes() { return [200]; },
    caldavHeaders() {
      const auth = `${this.username}:${this.password}`;
      return {
        Authorization: `Basic ${window.btoa(auth)}`,
        Accept: 'text/calendar',
      };
    },
    async fetchData() {
      if (!this.icsUrl) return;
      this.startLoading();
      try {
        // Allow public ICS URLs without Nextcloud credentials
        const useAuth = Boolean(this.options.username || this.options.password);
        if (!useAuth && this.options.password) {
          // If password present but username missing, treat as no-auth
          // (avoid enforcing NextcloudMixin app-password checks)
        }
        const headers = useAuth ? this.caldavHeaders() : { Accept: 'text/calendar' };
        const res = await this.makeRequest(this.icsUrl, headers);
        const icsText = typeof res === 'string' ? res : (res || '');
        // parse VEVENT and VTODO
        this.events = this.parseIcs(icsText || '');
        this.tasks = this.parseVtodos(icsText || '');
        this.events.sort((a, b) => {
          const aStart = a.start || 0;
          const bStart = b.start || 0;
          return aStart === bStart ? a.summary.localeCompare(b.summary) : aStart - bStart;
        });
        this.tasks.sort((a, b) => {
          const aDue = a.due || Number.MAX_SAFE_INTEGER;
          const bDue = b.due || Number.MAX_SAFE_INTEGER;
          if (aDue !== bDue) return aDue - bDue;
          return a.summary.localeCompare(b.summary);
        });
        if (useAuth) this.validCredentials = true;
      } catch (err) {
        const status = err && err.response && err.response.status;
        if (status === 401) {
          this.validCredentials = false;
          this.error('Access denied - check username/app-password');
        } else {
          this.error(err && err.message ? err.message : 'Unable to fetch calendar');
        }
      } finally {
        this.finishLoading();
      }
    },
    // Simple ICS parser sufficient for common VEVENT fields
    parseIcs(ics) {
      if (!ics || typeof ics !== 'string') return [];
      const unfolded = ics.replace(/\r?\n[ \t]/g, '');
      const parts = unfolded.split(/BEGIN:VEVENT/gi).slice(1);
      const events = parts.map((part) => {
        const body = part.split(/END:VEVENT/gi)[0];
        const lines = body.split(/\r?\n/);
        const getField = (name) => {
          const re = new RegExp(`^${name}(?:;[^:]*)?:(.*)$`, 'i');
          for (const l of lines) {
            const m = l.match(re);
            if (m) return m[1] || '';
          }
          return null;
        };
        const rawStart = getField('DTSTART');
        const rawEnd = getField('DTEND');
        const start = this.parseIcsDate(rawStart);
        const end = this.parseIcsDate(rawEnd);

        const allDay = rawStart ? /^\d{8}$/.test(rawStart.split(':').pop()) : false;
        return {
          uid: getField('UID'),
          summary: getField('SUMMARY') || '(no title)',
          description: getField('DESCRIPTION') || '',
          start,
          end,
          allDay,
          past: false,
        };
      }).filter(e => e.start);
      const now = new Date().getTime();
      // Allow showing recent past events; default to last 30 days but overridable via widget option `pastDays`.
      const pastDays = Number(this.options.pastDays);
      const hasPastDays = Number.isFinite(pastDays) && pastDays >= 0;
      const lookback = hasPastDays
        ? pastDays * 24 * 60 * 60 * 1000
        : (30 * 24 * 60 * 60 * 1000);
      return events.filter((e) => {
        e.past = e.start < now;
        if (hasPastDays && pastDays === 0) {
          return e.start >= now;
        }
        return e.start >= now - lookback;
      });
    },
    // Parse VTODO entries into tasks
    parseVtodos(ics) {
      if (!ics || typeof ics !== 'string') return [];
      const unfolded = ics.replace(/\r?\n[ \t]/g, '');
      const parts = unfolded.split(/BEGIN:VTODO/gi).slice(1);
      const tasks = parts.map((part) => {
        const body = part.split(/END:VTODO/gi)[0];
        const lines = body.split(/\r?\n/);
        const getField = (name) => {
          const re = new RegExp(`^${name}(?:;[^:]*)?:(.*)$`, 'i');
          for (const l of lines) {
            const m = l.match(re);
            if (m) return m[1] || '';
          }
          return null;
        };
        const rawDue = getField('DUE');
        const due = this.parseIcsDate(rawDue);
        const status = getField('STATUS') || 'NEEDS-ACTION';
        return {
          uid: getField('UID'),
          summary: getField('SUMMARY') || '(no title)',
          description: getField('DESCRIPTION') || '',
          due,
          status,
        };
      }).filter(t => t.summary);
      return tasks;
    },
    parseIcsDate(raw) {
      if (!raw) return null;
      const parts = raw.split(':');
      const dateStr = parts[parts.length - 1];
      if (/^\d{8}$/.test(dateStr)) {
        const y = dateStr.slice(0, 4);
        const m = dateStr.slice(4, 6);
        const d = dateStr.slice(6, 8);
        return new Date(`${y}-${m}-${d}T00:00:00`).getTime();
      }
      if (/^\d{8}T\d{6}Z$/.test(dateStr)) {
        const iso = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}T${dateStr.slice(9, 11)}:${dateStr.slice(11, 13)}:${dateStr.slice(13, 15)}Z`;
        return Date.parse(iso);
      }
      if (/^\d{8}T\d{6}$/.test(dateStr)) {
        const iso = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}T${dateStr.slice(9, 11)}:${dateStr.slice(11, 13)}:${dateStr.slice(13, 15)}`;
        return Date.parse(iso);
      }
      const parsed = Date.parse(dateStr);
      return Number.isNaN(parsed) ? null : parsed;
    },
    formatEventDate(timestamp, allDay) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: allDay ? 'numeric' : undefined,
      }).format(date);
    },
    formatTime(timestamp) {
      if (!timestamp) return '';
      return new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(timestamp));
    },
    formatEventRange(start, end, allDay) {
      if (!start) return '';
      if (!end || end === start) {
        return allDay ? this.formatEventDate(start, true) : `${this.formatEventDate(start, false)} ${this.formatTime(start)}`;
      }
      const sameDay = new Date(start).toDateString() === new Date(end).toDateString();
      if (allDay) {
        const normalizedEnd = new Date(end);
        normalizedEnd.setDate(normalizedEnd.getDate() - 1);
        return `${this.formatEventDate(start, true)} – ${this.formatEventDate(normalizedEnd.getTime(), true)}`;
      }
      if (sameDay) {
        return `${this.formatEventDate(start, false)} ${this.formatTime(start)} – ${this.formatTime(end)}`;
      }
      return `${this.formatEventDate(start, false)} ${this.formatTime(start)} – ${this.formatEventDate(end, false)} ${this.formatTime(end)}`;
    },
  },
  created() {
    this.overrideUpdateInterval = 60 * 60; // hourly by default
  },
};
</script>

<style scoped>
.nextcloud-calendar-widget {
  color: #ffffff !important;
  background: rgba(28, 34, 44, 0.92);
  padding: 0.85rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
}
.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.4rem;
}
.widget-summary,
.section-meta,
.widget-note,
.display-label {
  color: #b8c4d1;
  font-size: 0.86rem;
  margin: 0;
  line-height: 1.2;
}
.event-card {
  margin-bottom: 0.65rem;
  padding: 0.85rem;
  border-radius: 0.85rem;
  background: rgba(255, 255, 255, 0.06);
  transition: background 0.25s ease, opacity 0.25s ease;
}
.event-card.past {
  opacity: 0.5;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.event-card.past .summary,
.event-card.past .event-date {
  color: rgba(255, 255, 255, 0.7);
}
.event-card.past .event-badge {
  background: rgba(255, 255, 255, 0.12);
  color: #d0d8e8;
}
.widget-note {
  margin-left: 0.45rem;
}
.widget-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-top: 0;
}
.widget-actions label,
.widget-actions .display-label {
  margin: 0;
}
.section-card {
  padding: 0.25rem 0 0;
  margin-bottom: 0.45rem;
}
.section-meta {
  font-size: 0.86rem;
  line-height: 1.2;
}
.events-list,
.tasks-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.event-card,
.tasks-list li {
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.8rem;
  padding: 0.8rem;
  margin-bottom: 0.45rem;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  transition: transform 120ms ease, background 120ms ease;
}
.event-card:hover,
.tasks-list li:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.14) !important;
}
.event-top-row,
.task-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.65rem;
  margin-top: 0.2rem;
}
.event-date {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.92rem;
  color: #dce4ff;
}
.summary,
.task-summary {
  color: #ffffff;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.35;
}
.summary {
  margin-bottom: 0.15rem;
}
.desc,
.task-desc {
  margin-top: 0.25rem;
  color: #c8c8c8 !important;
  font-size: 0.92rem;
  line-height: 1.4;
}
.task-meta {
  font-size: 0.85rem;
  color: #b8c4d1 !important;
}
.task-status,
.event-badge {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}
.widget-actions select {
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  padding: 0.35rem 0.75rem;
  min-width: 4.2rem;
  outline: none;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  appearance: none;
}
.widget-actions select:focus {
  border-color: rgba(255, 255, 255, 0.26);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15), 0 0 0 2px rgba(255, 255, 255, 0.08);
}
.widget-actions select option {
  background: rgba(255, 255, 255, 0.96);
  color: #1a202a;
}
.more-count,
.sep p {
  color: #a9b2c3;
  font-size: 0.86rem;
}
</style>
