<template>
  <div class="w-full flex flex-col gap-6 font-707">
    <!-- Header banner -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-[16px] border border-black/10 bg-white">
      <div>
        <div class="flex items-center gap-2">
          <p class="text-[11px] uppercase tracking-[0.14em] text-neutral-500 font-medium">Traffic & Capacity Architecture</p>
          <span class="px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-moss-50 text-moss-700 border border-moss-200">
            Stanley Pop-Up Mode Active
          </span>
        </div>
        <h2 class="text-[24px] font-medium tracking-tight mt-1">Live Capacity & WhatsApp Queue Settings</h2>
        <p class="text-[13.5px] text-neutral-500 max-w-[640px] mt-1 leading-relaxed">
          Atur kapasitas maksimal booth di Senayan City, ambang batas panggil antrean, toleransi nomor terlewat, dan kustomisasi seluruh format pesan WhatsApp otomatis.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="loadSettings"
          class="h-[40px] px-4 rounded-[10px] border border-black/15 bg-white text-[13px] font-medium hover:bg-black/5 transition-colors cursor-pointer flex items-center gap-2"
        >
          <RefreshCw class="w-4 h-4" :class="isLoading ? 'animate-spin' : ''" /> Reset
        </button>
        <button
          type="button"
          @click="saveSettings"
          :disabled="isSaving"
          class="apple-cta-btn h-[40px] px-5 rounded-[10px] bg-black text-white text-[13px] font-medium cursor-pointer disabled:opacity-40 flex items-center gap-2"
        >
          <Check class="w-4 h-4" /> {{ isSaving ? 'Saving…' : 'Save Settings' }}
        </button>
      </div>
    </div>

    <!-- 1. Live Capacity & Queue Threshold Parameters -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Card A: Max Capacity -->
      <div class="p-5 rounded-[16px] border border-black/10 bg-white flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <p class="text-[11px] uppercase tracking-[0.12em] text-neutral-500 font-medium">Batas Kapasitas Booth</p>
          <Users class="w-4 h-4 text-neutral-400" />
        </div>
        <div class="flex items-baseline gap-2">
          <input
            v-model.number="form.maxCapacity"
            type="number"
            min="1"
            max="1000"
            class="w-[90px] h-[48px] px-3 rounded-[10px] border border-black/15 text-[26px] font-medium font-mono tabular-nums text-black outline-none focus:border-black"
          />
          <span class="text-[14px] text-neutral-500">orang maksimal di dalam</span>
        </div>
        <p class="text-[12px] text-neutral-400 leading-snug">
          Batas aman pengunjung di dalam area booth Stanley. Door scanner otomatis memberi peringatan saat kuota ini tercapai.
        </p>
      </div>

      <!-- Card B: Alert Threshold Distance -->
      <div class="p-5 rounded-[16px] border border-black/10 bg-white flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <p class="text-[11px] uppercase tracking-[0.12em] text-neutral-500 font-medium">Jarak Alert WhatsApp</p>
          <BellRing class="w-4 h-4 text-neutral-400" />
        </div>
        <div class="flex items-baseline gap-2">
          <input
            v-model.number="form.notifyThreshold"
            type="number"
            min="1"
            max="100"
            class="w-[90px] h-[48px] px-3 rounded-[10px] border border-black/15 text-[26px] font-medium font-mono tabular-nums text-black outline-none focus:border-black"
          />
          <span class="text-[14px] text-neutral-500">nomor sebelum giliran</span>
        </div>
        <p class="text-[12px] text-neutral-400 leading-snug">
          Misal diset 10: saat nomor #60 dipanggil, customer nomor #61–#70 otomatis mendapat WA untuk segera merapat ke gate.
        </p>
      </div>

      <!-- Card C: Skipped Tolerance -->
      <div class="p-5 rounded-[16px] border border-black/10 bg-white flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <p class="text-[11px] uppercase tracking-[0.12em] text-neutral-500 font-medium">Toleransi Nomor Terlewat</p>
          <ClockAlert class="w-4 h-4 text-neutral-400" />
        </div>
        <div class="flex items-baseline gap-2">
          <input
            v-model.number="form.skippedTolerance"
            type="number"
            min="1"
            max="50"
            class="w-[90px] h-[48px] px-3 rounded-[10px] border border-black/15 text-[26px] font-medium font-mono tabular-nums text-black outline-none focus:border-black"
          />
          <span class="text-[14px] text-neutral-500">nomor toleransi</span>
        </div>
        <p class="text-[12px] text-neutral-400 leading-snug">
          Maksimal nomor terlewat sebelum tiket otomatis hangus dan customer mendapat pesan untuk mengambil antrean baru.
        </p>
      </div>
    </div>

    <!-- 2. Live Queue Calling Controller -->
    <div class="p-6 rounded-[16px] border border-black/10 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <p class="text-[11px] uppercase tracking-[0.14em] text-neutral-500 font-medium">Live Queue Caller</p>
        <div class="flex items-baseline gap-3 mt-1">
          <span class="text-[34px] font-medium font-mono tabular-nums">#{{ form.currentCalledNumber }}</span>
          <span class="text-[13px] text-neutral-500">Sedang Dipanggil / Serving Now</span>
        </div>
        <p class="text-[12.5px] text-neutral-400 mt-1">
          Memajukan nomor antrean akan otomatis memicu pengiriman WhatsApp mendekat (jarak {{ form.notifyThreshold }} nomor) dan menghanguskan yang terlewat > {{ form.skippedTolerance }} nomor.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="stepCaller(-1)"
          :disabled="form.currentCalledNumber <= 1"
          class="h-[44px] px-3.5 rounded-[10px] border border-black/15 text-[14px] font-medium hover:bg-black/5 disabled:opacity-30 cursor-pointer"
        >
          -1 Mundur
        </button>
        <button
          type="button"
          @click="stepCaller(1)"
          class="apple-cta-btn h-[44px] px-5 rounded-[10px] bg-black text-white text-[14px] font-medium cursor-pointer flex items-center gap-2"
        >
          <Volume2 class="w-4 h-4" /> Panggil Berikutnya (#{{ form.currentCalledNumber + 1 }})
        </button>
      </div>
    </div>

    <!-- 3. Editable WhatsApp Message Templates -->
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-[18px] font-medium">Format Pesan WhatsApp Otomatis (Editable)</h3>
          <p class="text-[13px] text-neutral-500">
            Klik tag variabel di bawah kotak untuk menyisipkan variabel dinamis seperti <code class="font-mono text-black font-semibold">&#123;&#123;name&#125;&#125;</code> atau <code class="font-mono text-black font-semibold">&#123;&#123;queue_number&#125;&#125;</code>.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Template 1: Welcome -->
        <div class="p-5 rounded-[16px] border border-black/10 bg-white flex flex-col gap-2.5">
          <div class="flex items-center justify-between">
            <span class="text-[12px] font-medium text-black">1. Saat Customer Sukses Daftar OTS</span>
            <span class="text-[11px] font-mono text-neutral-400">Trigger: Submit Form</span>
          </div>
          <textarea
            v-model="form.waTemplates.welcome"
            rows="4"
            class="w-full p-3 rounded-[10px] bg-black/[0.03] border border-black/15 text-[13px] leading-relaxed font-707 outline-none focus:border-black focus:bg-white transition-colors resize-y"
          />
          <div class="flex flex-wrap gap-1.5 text-[11px]">
            <button type="button" @click="insertTag('welcome', 'name')" class="px-2 py-0.5 rounded-[6px] bg-neutral-100 hover:bg-black/10 cursor-pointer">+ &#123;&#123;name&#125;&#125;</button>
            <button type="button" @click="insertTag('welcome', 'queue_number')" class="px-2 py-0.5 rounded-[6px] bg-neutral-100 hover:bg-black/10 cursor-pointer">+ &#123;&#123;queue_number&#125;&#125;</button>
            <button type="button" @click="insertTag('welcome', 'party_size')" class="px-2 py-0.5 rounded-[6px] bg-neutral-100 hover:bg-black/10 cursor-pointer">+ &#123;&#123;party_size&#125;&#125;</button>
            <button type="button" @click="insertTag('welcome', 'link')" class="px-2 py-0.5 rounded-[6px] bg-neutral-100 hover:bg-black/10 cursor-pointer">+ &#123;&#123;link&#125;&#125;</button>
          </div>
        </div>

        <!-- Template 2: Approaching (Jarak 10 Nomor) -->
        <div class="p-5 rounded-[16px] border border-black/10 bg-white flex flex-col gap-2.5">
          <div class="flex items-center justify-between">
            <span class="text-[12px] font-medium text-black">2. Notifikasi Bersiap & Merapat (Jarak 10 Nomor)</span>
            <span class="text-[11px] font-mono text-neutral-400">Trigger: Caller -10</span>
          </div>
          <textarea
            v-model="form.waTemplates.approaching"
            rows="4"
            class="w-full p-3 rounded-[10px] bg-black/[0.03] border border-black/15 text-[13px] leading-relaxed font-707 outline-none focus:border-black focus:bg-white transition-colors resize-y"
          />
          <div class="flex flex-wrap gap-1.5 text-[11px]">
            <button type="button" @click="insertTag('approaching', 'name')" class="px-2 py-0.5 rounded-[6px] bg-neutral-100 hover:bg-black/10 cursor-pointer">+ &#123;&#123;name&#125;&#125;</button>
            <button type="button" @click="insertTag('approaching', 'queue_number')" class="px-2 py-0.5 rounded-[6px] bg-neutral-100 hover:bg-black/10 cursor-pointer">+ &#123;&#123;queue_number&#125;&#125;</button>
            <button type="button" @click="insertTag('approaching', 'current_called')" class="px-2 py-0.5 rounded-[6px] bg-neutral-100 hover:bg-black/10 cursor-pointer">+ &#123;&#123;current_called&#125;&#125;</button>
          </div>
        </div>

        <!-- Template 3: Ready for Entry -->
        <div class="p-5 rounded-[16px] border border-black/10 bg-white flex flex-col gap-2.5">
          <div class="flex items-center justify-between">
            <span class="text-[12px] font-medium text-black">3. Panggilan Masuk (Giliran Tiba)</span>
            <span class="text-[11px] font-mono text-neutral-400">Trigger: Called Now</span>
          </div>
          <textarea
            v-model="form.waTemplates.ready"
            rows="4"
            class="w-full p-3 rounded-[10px] bg-black/[0.03] border border-black/15 text-[13px] leading-relaxed font-707 outline-none focus:border-black focus:bg-white transition-colors resize-y"
          />
          <div class="flex flex-wrap gap-1.5 text-[11px]">
            <button type="button" @click="insertTag('ready', 'name')" class="px-2 py-0.5 rounded-[6px] bg-neutral-100 hover:bg-black/10 cursor-pointer">+ &#123;&#123;name&#125;&#125;</button>
            <button type="button" @click="insertTag('ready', 'queue_number')" class="px-2 py-0.5 rounded-[6px] bg-neutral-100 hover:bg-black/10 cursor-pointer">+ &#123;&#123;queue_number&#125;&#125;</button>
            <button type="button" @click="insertTag('ready', 'access_id')" class="px-2 py-0.5 rounded-[6px] bg-neutral-100 hover:bg-black/10 cursor-pointer">+ &#123;&#123;access_id&#125;&#125;</button>
          </div>
        </div>

        <!-- Template 4: Skipped / Expired -->
        <div class="p-5 rounded-[16px] border border-black/10 bg-white flex flex-col gap-2.5">
          <div class="flex items-center justify-between">
            <span class="text-[12px] font-medium text-black">4. Nomor Terlewat & Dinyatakan Hangus (> 5 Nomor)</span>
            <span class="text-[11px] font-mono text-oxblood-600 font-medium">Trigger: Skipped > 5</span>
          </div>
          <textarea
            v-model="form.waTemplates.expired"
            rows="4"
            class="w-full p-3 rounded-[10px] bg-black/[0.03] border border-black/15 text-[13px] leading-relaxed font-707 outline-none focus:border-black focus:bg-white transition-colors resize-y"
          />
          <div class="flex flex-wrap gap-1.5 text-[11px]">
            <button type="button" @click="insertTag('expired', 'name')" class="px-2 py-0.5 rounded-[6px] bg-neutral-100 hover:bg-black/10 cursor-pointer">+ &#123;&#123;name&#125;&#125;</button>
            <button type="button" @click="insertTag('expired', 'queue_number')" class="px-2 py-0.5 rounded-[6px] bg-neutral-100 hover:bg-black/10 cursor-pointer">+ &#123;&#123;queue_number&#125;&#125;</button>
            <button type="button" @click="insertTag('expired', 'skipped_tolerance')" class="px-2 py-0.5 rounded-[6px] bg-neutral-100 hover:bg-black/10 cursor-pointer">+ &#123;&#123;skipped_tolerance&#125;&#125;</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { RefreshCw, Check, Users, BellRing, ClockAlert, Volume2 } from 'lucide-vue-next';
import {
  fetchQueueSettings,
  saveQueueSettingsApi,
  callNextQueue,
  type QueueSettingsData
} from './hubUtils.ts';

const props = defineProps<{
  pageId: string;
}>();

const emit = defineEmits<{
  (e: 'toast', msg: string): void;
}>();

const isLoading = ref(false);
const isSaving = ref(false);

const form = reactive<QueueSettingsData>({
  enabled: true,
  maxCapacity: 50,
  notifyThreshold: 10,
  skippedTolerance: 5,
  currentCalledNumber: 1,
  waTemplates: {
    welcome: 'Halo {{name}}! Kamu terdaftar di antrean Stanley Pop-Up Senayan City dengan Nomor Antrean #{{queue_number}} (Party: {{party_size}} orang). Pantau status antreanmu di: {{link}}',
    approaching: 'Halo {{name}}! Nomor antreanmu (#{{queue_number}}) sudah dekat! Panggilan saat ini sudah di sekitar nomormu. Mohon segera merapat ke area antrean Stanley Senayan City.',
    ready: 'Halo {{name}}! Giliranmu untuk masuk telah tiba. Silakan tunjukkan QR Pass / Access ID {{access_id}} kepada usher di pintu masuk.',
    expired: 'Mohon maaf {{name}}, nomor antreanmu (#{{queue_number}}) telah terlewat lebih dari {{skipped_tolerance}} nomor dan dinyatakan hangus. Silakan scan QR kembali untuk mengambil nomor antrean baru jika masih ingin berkunjung.'
  }
});

async function loadSettings() {
  if (!props.pageId) return;
  isLoading.value = true;
  try {
    const data = await fetchQueueSettings(props.pageId);
    if (data) {
      Object.assign(form, data);
      if (data.waTemplates) Object.assign(form.waTemplates, data.waTemplates);
    }
  } catch (err: any) {
    emit('toast', err?.message || 'Gagal memuat pengaturan antrean');
  } finally {
    isLoading.value = false;
  }
}

async function saveSettings() {
  if (!props.pageId) return;
  isSaving.value = true;
  try {
    const res = await saveQueueSettingsApi(props.pageId, form);
    if (res) {
      Object.assign(form, res);
      emit('toast', 'Pengaturan kapasitas & pesan WhatsApp berhasil disimpan!');
    }
  } catch (err: any) {
    emit('toast', err?.message || 'Gagal menyimpan pengaturan');
  } finally {
    isSaving.value = false;
  }
}

async function stepCaller(delta: number) {
  const target = Math.max(1, form.currentCalledNumber + delta);
  form.currentCalledNumber = target;
  if (!props.pageId) return;
  try {
    const res = await callNextQueue(props.pageId, target);
    if (res) {
      emit('toast', `Memanggil antrean #${target}. ${res.approachingCount} notifikasi terkirim.`);
    }
  } catch (err: any) {
    emit('toast', err?.message || 'Gagal memajukan nomor antrean');
  }
}

function insertTag(field: 'welcome' | 'approaching' | 'ready' | 'expired', tag: string) {
  form.waTemplates[field] += ` {{${tag}}}`;
}

onMounted(() => {
  loadSettings();
});
</script>
