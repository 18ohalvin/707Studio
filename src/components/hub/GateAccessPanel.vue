<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[80] bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4 font-707" @click.self="$emit('close')">
      <div class="w-full max-w-[640px] max-h-[88vh] rounded-[16px] bg-white border border-black/10 shadow-[0px_24px_60px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden">
        <div class="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
          <div class="min-w-0">
            <p class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">Gate access</p>
            <p class="text-[20px] font-medium leading-tight truncate">{{ projectTitle }}</p>
            <p class="text-[12.5px] text-neutral-500 mt-1">Accounts for door security. They can only open the Door Scanner for this campaign, and stop working at the time you set.</p>
          </div>
          <button type="button" @click="$emit('close')" class="size-[34px] rounded-[9px] hover:bg-black/5 flex items-center justify-center cursor-pointer shrink-0" title="Close"><X class="w-4 h-4" /></button>
        </div>

        <div class="px-5 pb-5 overflow-y-auto flex flex-col gap-4">
          <!-- Shown once: the password is not stored anywhere the studio can read it back -->
          <div v-if="credentials" class="rounded-[12px] border border-black bg-black text-white p-4 flex flex-col gap-3">
            <p class="text-[12px] text-white/70">{{ credentials.reset ? 'New password' : 'Account created' }} — shown only now. Copy it and hand it to the person.</p>
            <dl class="grid grid-cols-[88px_1fr] gap-y-1.5 text-[14px]">
              <dt class="text-white/60">Username</dt><dd class="font-medium select-text">{{ credentials.username }}</dd>
              <dt class="text-white/60">Password</dt><dd class="font-medium font-mono tracking-[0.04em] select-text">{{ credentials.password }}</dd>
              <dt class="text-white/60">Sign in at</dt><dd class="select-text break-all">{{ loginUrl }}</dd>
            </dl>
            <div class="flex items-center gap-2">
              <button type="button" @click="copyCredentials" class="h-[34px] px-3.5 rounded-[9px] bg-white text-black text-[12.5px] font-medium cursor-pointer hover:bg-neutral-200 flex items-center gap-1.5"><Copy class="w-3.5 h-3.5" /> Copy login details</button>
              <button type="button" @click="credentials = null" class="h-[34px] px-3 rounded-[9px] text-[12.5px] text-white/70 hover:bg-white/10 cursor-pointer">Done</button>
            </div>
          </div>

          <!-- Accounts -->
          <div class="flex flex-col gap-2">
            <p class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">Accounts <span class="tabular-nums">{{ accounts.length }}</span></p>
            <p v-if="loading" class="text-[13px] text-neutral-400 py-3">Loading…</p>
            <p v-else-if="!accounts.length" class="text-[13px] text-neutral-500 py-2">No gate account yet. Create one below.</p>
            <div v-for="a in accounts" :key="a.id" class="rounded-[12px] border border-black/10 px-3.5 py-3 flex items-center gap-3">
              <div class="min-w-0 flex-1">
                <p class="text-[15px] font-medium leading-tight truncate flex items-center gap-2">
                  {{ a.username }}
                  <span class="px-2 py-0.5 rounded-full text-[10.5px] font-medium border" :class="statusClass(a)">{{ statusLabel(a) }}</span>
                </p>
                <p class="text-[12px] text-neutral-500">{{ isExpired(a) ? 'Expired' : 'Valid until' }} {{ formatWhen(a.expiresAt) }}</p>
              </div>
              <template v-if="removing === a.id">
                <button type="button" @click="removing = null" class="h-[32px] px-3 rounded-[8px] border border-black/15 text-[12px] font-medium cursor-pointer hover:bg-black/5">Keep</button>
                <button type="button" @click="remove(a)" class="h-[32px] px-3 rounded-[8px] bg-oxblood-700 text-white text-[12px] font-medium cursor-pointer hover:bg-oxblood-800">Remove</button>
              </template>
              <template v-else>
                <button type="button" @click="extend(a)" :disabled="busy" class="h-[32px] px-2.5 rounded-[8px] border border-black/15 text-[12px] font-medium cursor-pointer hover:bg-black/5 disabled:opacity-40" title="Add one more day">+1 day</button>
                <button type="button" @click="toggleSuspend(a)" :disabled="busy" class="h-[32px] px-2.5 rounded-[8px] border border-black/15 text-[12px] font-medium cursor-pointer hover:bg-black/5 disabled:opacity-40">{{ a.status === 'suspended' ? 'Activate' : 'Suspend' }}</button>
                <button type="button" @click="resetPassword(a)" :disabled="busy" class="h-[32px] px-2.5 rounded-[8px] border border-black/15 text-[12px] font-medium cursor-pointer hover:bg-black/5 disabled:opacity-40">New password</button>
                <button type="button" @click="removing = a.id" class="size-[32px] rounded-[8px] hover:bg-oxblood-50 text-oxblood-600 flex items-center justify-center cursor-pointer" title="Remove"><Trash2 class="w-4 h-4" /></button>
              </template>
            </div>
          </div>

          <!-- Create -->
          <form class="rounded-[12px] border border-black/10 bg-black/[0.02] p-3.5 flex flex-col gap-3" @submit.prevent="create">
            <p class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">New gate account</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-semibold text-neutral-700 uppercase">Username</span>
                <input v-model="username" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="e.g. gate-a" class="h-[38px] px-3 rounded-[8px] bg-white border border-black/15 text-[13px] outline-none focus:border-black" />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-semibold text-neutral-700 uppercase">Valid until</span>
                <input v-model="expires" type="datetime-local" class="h-[38px] px-3 rounded-[8px] bg-white border border-black/15 text-[13px] outline-none focus:border-black" />
              </label>
            </div>
            <p v-if="error" class="text-[12.5px] text-oxblood-700">{{ error }}</p>
            <div class="flex items-center justify-between gap-3">
              <p class="text-[11.5px] text-neutral-500">A password is made for you and shown once. At most 31 days.</p>
              <button type="submit" :disabled="busy || !username.trim()" class="h-[36px] px-4 rounded-[9px] bg-black text-white text-[13px] font-medium cursor-pointer hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-default shrink-0">Create account</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { X, Copy, Trash2 } from 'lucide-vue-next';
import { apiFetch } from '../../services/apiClient.ts';

/**
 * Door-security accounts for one campaign, run from its Campaign Hub. Each one can open the
 * Door Scanner for this campaign only and stops working at the time set here; the server
 * enforces both (see gateAccounts.ts and gateGuard.ts).
 */
const props = defineProps<{ projectId: string; projectTitle: string }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'toast', msg: string): void }>();

interface GateAccount { id: string; username: string; status: string; expiresAt: string | null; createdAt: string }

const accounts = ref<GateAccount[]>([]);
const loading = ref(true);
const busy = ref(false);
const error = ref('');
const removing = ref<string | null>(null);
const credentials = ref<{ username: string; password: string; reset: boolean } | null>(null);

const username = ref('');
const expires = ref(defaultExpiry());

const loginUrl = computed(() => `${window.location.origin}/login`);
const DAY = 86_400_000;

/** Tomorrow 23:59 local: the event day and a little after. */
function defaultExpiry(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(23, 59, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatWhen(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
const isExpired = (a: GateAccount) => Boolean(a.expiresAt) && new Date(a.expiresAt as string).getTime() <= Date.now();
const statusLabel = (a: GateAccount) => (isExpired(a) ? 'Expired' : a.status === 'suspended' ? 'Suspended' : 'Active');
const statusClass = (a: GateAccount) =>
  isExpired(a) ? 'bg-bronze-50 text-bronze-800 border-bronze-300'
  : a.status === 'suspended' ? 'bg-oxblood-50 text-oxblood-700 border-oxblood-200'
  : 'bg-moss-50 text-moss-800 border-moss-200';

async function call(path: string, init: RequestInit = {}) {
  const res = await apiFetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) }
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) throw new Error(json?.error || `Request failed (${res.status})`);
  return json;
}

async function load() {
  try {
    accounts.value = (await call(`/api/gate-accounts?project=${encodeURIComponent(props.projectId)}`)).data;
    error.value = '';
  } catch (err: any) {
    error.value = err?.message || 'Could not load the gate accounts.';
  } finally {
    loading.value = false;
  }
}

async function create() {
  if (busy.value || !username.value.trim()) return;
  busy.value = true;
  error.value = '';
  try {
    const at = new Date(expires.value);
    if (Number.isNaN(at.getTime())) throw new Error('Set an expiry date and time.');
    const json = await call('/api/gate-accounts', {
      method: 'POST',
      body: JSON.stringify({ project: props.projectId, username: username.value.trim(), expiresAt: at.toISOString() })
    });
    credentials.value = { username: json.data.username, password: json.password, reset: false };
    username.value = '';
    await load();
  } catch (err: any) {
    error.value = err?.message || 'Could not create the account.';
  } finally {
    busy.value = false;
  }
}

async function resetPassword(a: GateAccount) {
  busy.value = true;
  try {
    const json = await call(`/api/gate-accounts/${encodeURIComponent(a.id)}/reset-password`, { method: 'POST' });
    credentials.value = { username: a.username, password: json.password, reset: true };
  } catch (err: any) {
    emit('toast', err?.message || 'Could not reset the password.');
  } finally {
    busy.value = false;
  }
}

async function patch(a: GateAccount, body: Record<string, unknown>, done: string) {
  busy.value = true;
  try {
    await call(`/api/gate-accounts/${encodeURIComponent(a.id)}`, { method: 'PATCH', body: JSON.stringify(body) });
    await load();
    emit('toast', done);
  } catch (err: any) {
    emit('toast', err?.message || 'Could not update the account.');
  } finally {
    busy.value = false;
  }
}

const toggleSuspend = (a: GateAccount) =>
  patch(a, { status: a.status === 'suspended' ? 'active' : 'suspended' }, a.status === 'suspended' ? `${a.username} is active again.` : `${a.username} is suspended. Their tablet is cut off now.`);

/** One more day, counted from the later of now and the current expiry. */
function extend(a: GateAccount) {
  const base = Math.max(Date.now(), a.expiresAt ? new Date(a.expiresAt).getTime() : 0);
  return patch(a, { expiresAt: new Date(base + DAY).toISOString() }, `${a.username} now valid one day longer.`);
}

async function remove(a: GateAccount) {
  removing.value = null;
  busy.value = true;
  try {
    await call(`/api/gate-accounts/${encodeURIComponent(a.id)}`, { method: 'DELETE' });
    await load();
    emit('toast', `${a.username} removed.`);
  } catch (err: any) {
    emit('toast', err?.message || 'Could not remove the account.');
  } finally {
    busy.value = false;
  }
}

async function copyCredentials() {
  if (!credentials.value) return;
  const text = `707 Door Scanner — ${props.projectTitle}\nUsername: ${credentials.value.username}\nPassword: ${credentials.value.password}\nSign in: ${loginUrl.value}`;
  try {
    await navigator.clipboard.writeText(text);
    emit('toast', 'Login details copied.');
  } catch {
    emit('toast', 'Could not copy — select the details and copy them manually.');
  }
}

onMounted(load);
</script>
