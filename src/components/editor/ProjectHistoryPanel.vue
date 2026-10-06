<template>
  <Teleport to="body">
  <div
    ref="panelRef"
    :style="popoverStyle"
    class="w-[360px] max-h-[70vh] flex flex-col apple-frost border border-white/60 rounded-[12px] shadow-[0px_16px_45px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] apple-popover-box z-[90] font-707 overflow-hidden"
    role="dialog"
    aria-label="Project history"
    @click.stop
  >
    <!-- Current state -->
    <div class="px-4 pt-4 pb-3 border-b border-black/5 flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <p class="text-[13px] font-medium">Project history</p>
        <button type="button" @click="emit('close')" class="size-6 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center cursor-pointer" title="Close">
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
      <p class="text-[11.5px] text-neutral-600 leading-[16px]">
        <template v-if="liveVersion > 0">
          Visitors see <span class="font-medium text-black">live v{{ liveVersion }}</span>
          <template v-if="project?.published_at">, published {{ formatWhen(project.published_at) }}</template>.
          <template v-if="project?.has_unpublished_changes"> Your edits since then are not live yet.</template>
        </template>
        <template v-else>Not published yet — only you and the superadmin can open the campaign link.</template>
      </p>
      <div v-if="liveVersion > 0" class="flex items-center gap-2 pt-1">
        <a :href="liveUrl" target="_blank" rel="noopener" class="h-[28px] px-2.5 rounded-[7px] border border-black/15 text-[11.5px] hover:bg-black/5 flex items-center gap-1.5">
          <ExternalLink class="w-3 h-3" /> View live page
        </a>
        <button
          v-if="project?.has_unpublished_changes"
          type="button"
          :disabled="busy"
          @click="discard"
          class="h-[28px] px-2.5 rounded-[7px] border border-red-200 text-red-700 text-[11.5px] hover:bg-red-50 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          <Undo2 class="w-3 h-3" /> Discard unpublished changes
        </button>
      </div>
    </div>

    <!-- Entries -->
    <div class="flex-1 overflow-y-auto px-2 py-2">
      <div v-if="loading" class="flex flex-col gap-2 p-2">
        <div v-for="i in 4" :key="i" class="h-[44px] rounded-[8px] bg-black/[0.04] animate-pulse" />
      </div>
      <p v-else-if="error" class="text-[12px] text-red-600 p-3">{{ error }}</p>
      <p v-else-if="!entries.length" class="text-[12px] text-neutral-500 p-3">
        No builds yet. Each submission, publish and restore will be listed here.
      </p>
      <div
        v-for="entry in entries"
        v-else
        :key="entry.id"
        class="group flex items-start gap-3 px-2 py-2 rounded-[8px] hover:bg-black/[0.03]"
      >
        <div class="size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" :class="kindStyle(entry.kind).dot">
          <component :is="kindStyle(entry.kind).icon" class="w-3.5 h-3.5" />
        </div>
        <div class="flex flex-col min-w-0 flex-1">
          <p class="text-[12.5px] leading-[17px]">
            <span class="font-medium">#{{ entry.revision }} {{ kindLabel(entry) }}</span>
          </p>
          <p class="text-[11px] text-neutral-500 truncate">{{ entry.created_by || 'Someone' }} · {{ formatWhen(entry.created_at) }}</p>
          <p v-if="entry.note" class="text-[11px] text-neutral-700 mt-0.5 whitespace-pre-line">“{{ entry.note }}”</p>
        </div>
        <button
          type="button"
          :disabled="busy"
          @click="restore(entry)"
          class="opacity-0 group-hover:opacity-100 focus:opacity-100 h-[26px] px-2 rounded-[6px] border border-black/15 text-[11px] hover:bg-black/5 cursor-pointer shrink-0 disabled:opacity-40 transition-opacity"
          title="Load this build into the editor. Visitors keep the live version until it is published."
        >
          Restore
        </button>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup lang="ts">
import { glassConfirm } from '../../services/glassDialog.ts';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAnchoredPopover } from '../common/anchoredPopover.ts';
import { X, ExternalLink, Undo2, Send, Rocket, CornerUpLeft, Trash2, History } from 'lucide-vue-next';
import { useEditorStore } from '../../stores/editorStore.ts';
import type { ProjectHistoryEntry } from '../../types/editor.ts';

const props = defineProps<{ anchor: HTMLElement | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const panelRef = ref<HTMLElement | null>(null);
const anchorRef = computed(() => props.anchor);
const { style: popoverStyle, track } = useAnchoredPopover(anchorRef as any);

function handleOutside(e: MouseEvent) {
  const target = e.target as Node;
  if (panelRef.value?.contains(target) || props.anchor?.contains(target)) return;
  emit('close');
}

const editorStore = useEditorStore();
const entries = ref<ProjectHistoryEntry[]>([]);
const loading = ref(true);
const busy = ref(false);
const error = ref('');

const project = computed(() => editorStore.userProjects.find(p => p.id === editorStore.currentProjectId) || null);
const liveVersion = computed(() => Number(project.value?.live_version || 0));
const liveUrl = computed(() => (project.value ? `/${project.value.brand_slug}/${project.value.slug}` : '/'));

async function load() {
  if (!editorStore.currentProjectId) return;
  loading.value = true;
  error.value = '';
  try {
    entries.value = await editorStore.fetchProjectHistory(editorStore.currentProjectId);
  } catch (err: any) {
    error.value = err?.message || 'Could not load the history.';
  } finally {
    loading.value = false;
  }
}

function kindLabel(entry: ProjectHistoryEntry): string {
  switch (entry.kind) {
    case 'published': return `Published as live v${entry.live_version}`;
    case 'submitted': return Number(entry.live_version || 0) > 0 ? 'Update submitted for review' : 'Submitted for review';
    case 'declined': return 'Changes requested';
    case 'discarded': return 'Unpublished edits discarded';
    case 'restored': return entry.note || 'Older build restored';
    default: return entry.kind;
  }
}

function kindStyle(kind: ProjectHistoryEntry['kind']) {
  switch (kind) {
    case 'published': return { icon: Rocket, dot: 'bg-black text-white' };
    case 'submitted': return { icon: Send, dot: 'bg-amber-100 text-amber-800' };
    case 'declined': return { icon: CornerUpLeft, dot: 'bg-red-50 text-red-700' };
    case 'discarded': return { icon: Trash2, dot: 'bg-neutral-100 text-neutral-600' };
    default: return { icon: History, dot: 'bg-neutral-100 text-neutral-600' };
  }
}

function formatWhen(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function restore(entry: ProjectHistoryEntry) {
  if (!(await glassConfirm({ title: `Restore build #${entry.revision}?`, message: 'It loads into the editor. Your current edits stay in history, and visitors keep seeing the live version until it is published.', confirmLabel: 'Restore' }))) return;
  busy.value = true;
  const res = await editorStore.restoreProjectBuild(editorStore.currentProjectId, entry.id);
  busy.value = false;
  editorStore.showToast(res.ok ? `Build #${entry.revision} loaded into the editor.` : `Could not restore: ${res.error}`);
  if (res.ok) load();
}

async function discard() {
  if (!(await glassConfirm({ title: 'Discard unpublished changes?', message: 'Every edit since the live version was published is removed from the editor. They stay in history, so Restore can bring them back.', confirmLabel: 'Discard', danger: true }))) return;
  busy.value = true;
  const res = await editorStore.transitionProject(editorStore.currentProjectId, 'discard');
  busy.value = false;
  editorStore.showToast(res.ok ? 'Back to the live version.' : `Could not discard: ${res.error}`);
  if (res.ok) load();
}

onMounted(() => {
  track(true);
  load();
  document.addEventListener('mousedown', handleOutside);
});
onUnmounted(() => document.removeEventListener('mousedown', handleOutside));
defineExpose({ reload: load });
</script>
