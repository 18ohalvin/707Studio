import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useEditorStore } from '../../stores/editorStore.ts';
import { useAuthStore } from '../../stores/authStore.ts';
import type { ProjectItem } from '../../types/editor.ts';
import { fetchSubmissions, type Submission } from './hubUtils.ts';

/**
 * The guest list of the selected campaign (or all campaigns this account can
 * see), kept near-live by polling. Shared by the Campaign Hub and the
 * stand-alone Door Scanner page, which both pick the campaign from ?project=.
 */
export function useCampaignGuests(opts: { pollMs?: number; requireProject?: boolean } = {}) {
  const route = useRoute();
  const editorStore = useEditorStore();
  const authStore = useAuthStore();

  const rows = ref<Submission[]>([]);
  const isLoading = ref(false);
  const isInitialLoad = ref(true);
  const loadError = ref('');
  const lastSyncedAt = ref<number | null>(null);
  const selectedProjectId = ref<string>(String(route.query.project || 'all'));

  const projects = computed<ProjectItem[]>(() => editorStore.userProjects);
  const selectedProject = computed(() => projects.value.find(p => p.id === selectedProjectId.value) || null);

  function idsForProject(p: ProjectItem): string[] {
    return [p.id, ...(p.pages || []).map(pg => pg.id)].filter(Boolean);
  }

  /** null = no filter (superadmin, all campaigns). [] = nothing this account may see. */
  const pageIds = computed<string[] | null>(() => {
    if (selectedProject.value) return idsForProject(selectedProject.value);
    // The door scanner works on exactly one campaign: with none chosen it loads and scans nothing.
    if (opts.requireProject) return [];
    if (authStore.isSuperAdmin) return null;
    return projects.value.flatMap(idsForProject);
  });

  const titleByPageId = computed(() => {
    const map = new Map<string, string>();
    projects.value.forEach(p => idsForProject(p).forEach(id => map.set(id, p.title)));
    return map;
  });

  function campaignTitle(pageId: string): string {
    return titleByPageId.value.get(pageId) || 'Unlinked campaign';
  }

  let requestSeq = 0;
  async function refresh(): Promise<number | null> {
    if (pageIds.value && pageIds.value.length === 0) {
      rows.value = [];
      isInitialLoad.value = false;
      lastSyncedAt.value = Date.now();
      return 0;
    }
    const seq = ++requestSeq;
    isLoading.value = true;
    try {
      const data = await fetchSubmissions(pageIds.value);
      if (seq !== requestSeq) return null; // a newer campaign selection superseded this request
      rows.value = data;
      loadError.value = '';
      lastSyncedAt.value = Date.now();
      return data.length;
    } catch (err: any) {
      if (seq !== requestSeq) return null;
      loadError.value = err?.message ? `Couldn't reach the guest database (${err.message}).` : "Couldn't reach the guest database.";
      return null;
    } finally {
      if (seq === requestSeq) {
        isLoading.value = false;
        isInitialLoad.value = false;
      }
    }
  }

  function mergeRows(updated: Submission[]) {
    if (!updated.length) return;
    const byId = new Map(updated.map(u => [u.id, u]));
    rows.value = rows.value.map(r => byId.get(r.id) || r);
  }

  function removeRows(ids: string[]) {
    const set = new Set(ids);
    rows.value = rows.value.filter(r => !set.has(r.id));
  }

  watch(() => pageIds.value?.join(','), () => {
    isInitialLoad.value = rows.value.length === 0;
    refresh();
  });

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  onMounted(async () => {
    if (!editorStore.userProjects.length) {
      try { await editorStore.loadProjects(); } catch { /* falls back to cached projects */ }
    }
    refresh();
    // Door staff and raffle hosts need near-live numbers from other devices.
    pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible' && !isLoading.value) refresh();
    }, opts.pollMs ?? 15000);
  });

  onUnmounted(() => {
    if (pollTimer) clearInterval(pollTimer);
  });

  return {
    rows, isLoading, isInitialLoad, loadError, lastSyncedAt,
    selectedProjectId, projects, selectedProject, pageIds,
    campaignTitle, refresh, mergeRows, removeRows
  };
}
