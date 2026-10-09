<template>
  <div class="flex flex-col gap-4 w-full" @keydown.esc="handleEscape">
    <!-- Toolbar -->
    <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-3 w-full select-none">
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
        <!-- Search -->
        <div class="relative w-full sm:max-w-[340px]">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input
            id="guest-search-input"
            ref="searchRef"
            v-model="search"
            type="text"
            placeholder="Search name, email, WhatsApp, Access ID…"
            class="w-full h-[36px] pl-9 pr-10 rounded-[8px] bg-white border border-black/12 text-[12.5px] font-707 text-black placeholder:text-neutral-400 outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all"
          />
          <kbd v-if="!search" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400 border border-black/10 rounded px-1.5 py-[1px]">/</kbd>
          <button v-else type="button" @click="search = ''" class="absolute right-2 top-1/2 -translate-y-1/2 size-5 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center cursor-pointer">
            <X class="w-3 h-3" />
          </button>
        </div>

        <!-- Status segmented filter -->
        <div class="flex items-center gap-1 p-0.5 rounded-[8px] bg-black/[0.04] border border-black/5 text-[11px] font-707 overflow-x-auto no-scrollbar">
          <button
            v-for="f in statusFilters"
            :key="f.value"
            type="button"
            @click="statusFilter = f.value"
            class="px-2.5 py-1 rounded-[6px] transition-all cursor-pointer whitespace-nowrap tabular-nums"
            :class="statusFilter === f.value ? 'bg-white text-black font-medium shadow-[0_1px_2px_rgba(0,0,0,0.08)]' : 'text-neutral-500 hover:text-black'"
          >
            {{ f.label }} <span class="text-neutral-400 ml-0.5">{{ f.count }}</span>
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Check-in filter -->
        <div class="flex items-center gap-1 p-0.5 rounded-[8px] bg-black/[0.04] border border-black/5 text-[11px]">
          <button
            v-for="c in checkFilters"
            :key="c.value"
            type="button"
            @click="checkFilter = c.value"
            class="px-2.5 py-1 rounded-[6px] transition-all cursor-pointer whitespace-nowrap"
            :class="checkFilter === c.value ? 'bg-white text-black font-medium shadow-[0_1px_2px_rgba(0,0,0,0.08)]' : 'text-neutral-500 hover:text-black'"
          >
            {{ c.label }}
          </button>
        </div>

        <!-- Entries registered twice (only when there are any) -->
        <button
          v-if="duplicateCount > 0"
          type="button"
          @click="duplicatesOnly = !duplicatesOnly"
          class="h-[32px] px-2.5 rounded-[8px] border text-[11px] font-medium cursor-pointer whitespace-nowrap transition-colors"
          :class="duplicatesOnly ? 'bg-bronze-100 border-bronze-300 text-bronze-800' : 'bg-white border-black/12 text-neutral-700 hover:bg-black/5'"
          title="Guests who registered more than once"
        >
          Duplicates {{ duplicateCount }}
        </button>

        <!-- Columns menu -->
        <div class="relative" ref="columnsMenuRef">
          <button
            type="button"
            @click="isColumnsOpen = !isColumnsOpen"
            class="h-[32px] px-2.5 rounded-[8px] border border-black/12 bg-white hover:bg-black/5 flex items-center gap-1.5 text-[11.5px] font-medium cursor-pointer transition-colors"
            title="Show / hide columns"
          >
            <Columns3 class="w-3.5 h-3.5" />
            <span class="hidden md:inline">Columns</span>
          </button>
          <Transition name="hub-pop">
            <div v-if="isColumnsOpen" class="absolute right-0 top-[calc(100%+6px)] z-40 w-[240px] apple-frost border border-black/10 rounded-[12px] shadow-[0px_24px_60px_rgba(0,0,0,0.16)] p-1.5">
              <p class="px-2.5 pt-1.5 pb-1 text-[10px] uppercase tracking-[0.12em] text-neutral-400">Visible columns</p>
              <label
                v-for="col in toggleableColumns"
                :key="col.key"
                class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[7px] hover:bg-black/5 cursor-pointer text-[12px]"
              >
                <input type="checkbox" class="hub-check" :checked="!hiddenColumns.has(col.key)" @change="toggleColumn(col.key)" />
                <span class="truncate">{{ col.label }}</span>
              </label>
              <div class="h-px bg-black/5 my-1" />
              <div class="flex items-center justify-between px-2.5 py-1.5 text-[12px]">
                <span>Compact rows</span>
                <button type="button" @click="compact = !compact" class="hub-switch" :class="compact ? 'is-on' : ''" role="switch" :aria-checked="compact"><span /></button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Export -->
        <button
          id="guest-export-csv"
          type="button"
          @click="exportCsv(selected.size ? selectedRows : sortedRows)"
          class="h-[32px] px-3 rounded-[8px] bg-black text-white hover:bg-neutral-800 flex items-center gap-1.5 text-[11.5px] font-medium cursor-pointer transition-colors"
          :title="selected.size ? 'Export selected guests' : 'Export filtered guests'"
        >
          <Download class="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>

    <!-- Result meta -->
    <div class="flex items-center justify-between text-[11.5px] text-neutral-500 select-none -mt-1">
      <span class="tabular-nums">
        Showing <b class="text-black font-medium">{{ sortedRows.length }}</b> of {{ rows.length }} guests
        <template v-if="hasActiveFilters"> · <button type="button" @click="clearFilters" class="underline underline-offset-2 hover:text-black cursor-pointer">Clear filters</button></template>
      </span>
      <span class="hidden md:inline">Shift-click to select a range · Click a row for details</span>
    </div>

    <!-- Table -->
    <div class="w-full border-[#d9d9d9] border-[0.5px] border-solid rounded-[10px] overflow-hidden bg-white">
      <div class="overflow-x-auto max-h-[64vh] overflow-y-auto hub-table-scroll">
        <table class="w-full text-left border-collapse min-w-[880px]">
          <thead class="sticky top-0 z-10 bg-white/95 backdrop-blur-md">
            <tr class="border-b border-[#e6e6e6] text-[10.5px] uppercase tracking-[0.1em] text-neutral-500 select-none">
              <th class="w-[44px] pl-4 pr-1 py-3">
                <input
                  type="checkbox"
                  class="hub-check"
                  :checked="allVisibleSelected"
                  :indeterminate.prop="someVisibleSelected && !allVisibleSelected"
                  @change="toggleSelectAll"
                  aria-label="Select all"
                />
              </th>
              <th v-for="col in visibleColumns" :key="col.key" class="px-3 py-3 font-medium whitespace-nowrap" :class="col.thClass">
                <button
                  v-if="col.sortable"
                  type="button"
                  @click="toggleSort(col.key)"
                  class="inline-flex items-center gap-1 uppercase tracking-[0.1em] hover:text-black cursor-pointer"
                  :class="sortKey === col.key ? 'text-black' : ''"
                >
                  {{ col.label }}
                  <ArrowUpDown v-if="sortKey !== col.key" class="w-3 h-3 opacity-40" />
                  <ArrowUp v-else-if="sortDir === 'asc'" class="w-3 h-3" />
                  <ArrowDown v-else class="w-3 h-3" />
                </button>
                <span v-else>{{ col.label }}</span>
              </th>
              <th class="w-[44px] pr-4" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(s, idx) in pagedRows"
              :key="s.id"
              class="group border-b border-[#efefef] last:border-b-0 transition-colors cursor-pointer"
              :class="[
                selected.has(s.id) ? 'bg-black/[0.035]' : 'hover:bg-neutral-50',
                drawerId === s.id ? 'bg-black/[0.05]' : ''
              ]"
              @click="openDrawer(s.id)"
            >
              <td class="pl-4 pr-1" :class="rowPad" @click.stop="toggleRow(s.id, idx, $event)">
                <input type="checkbox" class="hub-check pointer-events-none" :checked="selected.has(s.id)" :aria-label="`Select ${guestName(s)}`" />
              </td>

              <template v-for="col in visibleColumns" :key="col.key">
                <!-- Guest -->
                <td v-if="col.key === 'guest'" class="px-3" :class="rowPad">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div
                      class="rounded-full flex items-center justify-center text-[10.5px] font-medium shrink-0"
                      :class="[compact ? 'size-6' : 'size-8', normalizeStatus(s.status) === 'winner' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700 border border-black/5']"
                    >
                      {{ initials(guestName(s)) }}
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="text-[12.5px] font-medium text-black truncate max-w-[220px]">{{ guestName(s) }}</span>
                      <span
                        v-if="s.duplicate_of"
                        class="shrink-0 px-1.5 py-0.5 rounded-[5px] border border-bronze-300 bg-bronze-50 text-bronze-800 text-[9.5px] font-medium tracking-wide"
                        title="This guest registered more than once. Their pass still works at the door — review and delete the extra entry if it is a repeat."
                      >Duplicate</span>
                      <span v-if="!compact" class="text-[11px] text-neutral-500 truncate max-w-[220px]">{{ guestEmail(s) || 'No email' }}</span>
                    </div>
                  </div>
                </td>

                <td v-else-if="col.key === 'email'" class="px-3 text-[12px] text-neutral-700 whitespace-nowrap" :class="rowPad">{{ guestEmail(s) || '—' }}</td>

                <td v-else-if="col.key === 'phone'" class="px-3 text-[12px] text-neutral-700 font-mono whitespace-nowrap" :class="rowPad">
                  <a v-if="guestPhone(s)" :href="whatsappLink(guestPhone(s))" target="_blank" rel="noopener" @click.stop class="hover:underline underline-offset-2">{{ guestPhone(s) }}</a>
                  <span v-else class="text-neutral-300">—</span>
                </td>

                <td v-else-if="col.key === 'access'" class="px-3 whitespace-nowrap" :class="rowPad">
                  <span class="font-mono text-[11px] px-1.5 py-0.5 rounded-[5px] bg-black/[0.04] border border-black/5 text-neutral-700">{{ accessId(s) }}</span>
                </td>

                <td v-else-if="col.key === 'campaign'" class="px-3 text-[12px] text-neutral-700 whitespace-nowrap max-w-[180px] truncate" :class="rowPad">{{ campaignTitle(s.page_id) }}</td>

                <td v-else-if="col.key === 'status'" class="px-3 whitespace-nowrap" :class="rowPad" @click.stop>
                  <button
                    type="button"
                    @click="openStatusMenu(s.id, $event)"
                    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium border cursor-pointer hover:shadow-sm transition-shadow"
                    :class="statusBadgeClass(s.status)"
                  >
                    <span class="size-1.5 rounded-full" :class="statusDotClass(s.status)" />
                    {{ statusLabel(s.status) }}
                    <ChevronDown class="w-3 h-3 opacity-60" />
                  </button>
                </td>

                <td v-else-if="col.key === 'checked_in_at'" class="px-3 whitespace-nowrap" :class="rowPad" @click.stop>
                  <button
                    type="button"
                    @click="toggleCheckIn(s)"
                    class="inline-flex items-center gap-1.5 text-[11.5px] px-2 py-1 rounded-[6px] cursor-pointer transition-colors"
                    :class="s.checked_in_at ? 'text-moss-700 hover:bg-moss-50' : 'text-neutral-400 hover:text-black hover:bg-black/5'"
                    :title="s.checked_in_at ? 'Undo check-in' : 'Mark as checked in'"
                  >
                    <CircleCheck v-if="s.checked_in_at" class="w-3.5 h-3.5" />
                    <Circle v-else class="w-3.5 h-3.5" />
                    <span class="tabular-nums">{{ s.checked_in_at ? formatTime(s.checked_in_at) : 'Not in' }}</span>
                  </button>
                </td>

                <td v-else-if="col.key === 'created_at'" class="px-3 text-[11.5px] text-neutral-500 whitespace-nowrap tabular-nums" :class="rowPad">{{ formatDateTime(s.created_at) }}</td>

                <!-- Custom answer columns -->
                <td v-else class="px-3 text-[12px] text-neutral-700 whitespace-nowrap max-w-[200px] truncate" :class="rowPad" :title="formatValue(s.form_data?.[col.key])">
                  <span v-if="formatValue(s.form_data?.[col.key])">{{ formatValue(s.form_data?.[col.key]) }}</span>
                  <span v-else class="text-neutral-300">—</span>
                </td>
              </template>

              <td class="pr-4 text-right" :class="rowPad">
                <ChevronRight class="w-4 h-4 text-neutral-300 group-hover:text-black transition-colors inline" />
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Load more -->
        <div v-if="sortedRows.length > renderLimit" class="flex justify-center py-4 border-t border-[#efefef]">
          <button type="button" @click="renderLimit += 150" class="px-4 py-1.5 rounded-[8px] border border-black/15 text-[12px] font-medium hover:bg-black hover:text-white transition-colors cursor-pointer">
            Show {{ Math.min(150, sortedRows.length - renderLimit) }} more
          </button>
        </div>

        <!-- Empty -->
        <div v-if="!sortedRows.length" class="flex flex-col items-center justify-center py-16 text-center select-none">
          <div class="size-12 rounded-full bg-black/5 flex items-center justify-center text-neutral-400 mb-3">
            <Users class="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 class="font-medium text-[15px] text-black mb-1">{{ rows.length ? 'No guests match' : 'No guests yet' }}</h3>
          <p class="text-[12px] text-neutral-500 max-w-[340px]">
            {{ rows.length ? 'Try a different search or clear the filters.' : 'Entries appear here the moment someone submits your published campaign.' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Floating inline status menu -->
    <Teleport to="body">
      <Transition name="hub-pop">
        <div
          v-if="statusMenu"
          ref="statusMenuRef"
          class="fixed z-[80] w-[190px] apple-frost border border-black/10 rounded-[12px] shadow-[0px_24px_60px_rgba(0,0,0,0.18)] p-1.5 font-707"
          :style="{ top: `${statusMenu.y}px`, left: `${statusMenu.x}px` }"
        >
          <button
            v-for="o in STATUS_OPTIONS"
            :key="o.value"
            type="button"
            @click="applyStatus([statusMenu.id], o.value)"
            class="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[7px] hover:bg-black/5 cursor-pointer text-[12px] text-left"
          >
            <span class="size-2 rounded-full border" :class="o.value === 'winner' ? 'bg-black border-black' : [statusDotClass(o.value), 'border-transparent']" />
            <span class="flex-1">{{ o.label }}</span>
            <Check v-if="statusMenuRowStatus === o.value" class="w-3.5 h-3.5" />
          </button>
        </div>
      </Transition>
    </Teleport>

    <!-- Ticket email progress -->
    <Teleport to="body">
      <div v-if="ticketSender.progress.value" class="fixed top-[16px] inset-x-0 z-[80] flex justify-center pointer-events-none px-4 font-707">
        <div class="pointer-events-auto flex flex-col gap-1.5 px-4 py-3 rounded-[14px] bg-[#0c0d0e]/[0.92] backdrop-blur-2xl border border-white/10 text-white shadow-[0_24px_60px_rgba(0,0,0,0.35)] w-full max-w-[420px]">
          <div class="flex items-center justify-between gap-3">
            <span class="text-[12px] font-medium tabular-nums">
              {{ ticketSender.progress.value.finished ? 'Tickets finished' : 'Sending tickets' }} · {{ ticketSender.progress.value.done }} / {{ ticketSender.progress.value.total }}
            </span>
            <button v-if="!ticketSender.progress.value.finished" type="button" @click="ticketSender.cancel()" class="px-2.5 h-[26px] rounded-[8px] text-[11.5px] hover:bg-white/10 cursor-pointer">Stop</button>
            <button v-else type="button" @click="ticketSender.dismiss()" class="px-2.5 h-[26px] rounded-[8px] text-[11.5px] hover:bg-white/10 cursor-pointer">Close</button>
          </div>
          <div class="h-1 rounded-full bg-white/15 overflow-hidden">
            <div class="h-full bg-white transition-all" :style="{ width: `${ticketSender.progress.value.total ? (ticketSender.progress.value.done / ticketSender.progress.value.total) * 100 : 0}%` }" />
          </div>
          <p class="text-[11px] text-white/70 tabular-nums">
            {{ ticketSender.progress.value.sent }} sent · {{ ticketSender.progress.value.skipped }} skipped · {{ ticketSender.progress.value.failed }} failed
            <span v-if="ticketSender.progress.value.current"> · {{ ticketSender.progress.value.current }}</span>
          </p>
          <p v-if="!ticketSender.progress.value.finished" class="text-[11px] text-white/60">Keep this tab open until it finishes.</p>
          <p v-if="ticketSender.progress.value.stopReason" class="text-[11px] text-bronze-300">{{ ticketSender.progress.value.stopReason }}</p>
        </div>
      </div>
    </Teleport>

    <!-- Floating bulk action bar (editor-style dark glass) -->
    <Teleport to="body">
      <Transition name="hub-bar">
        <div v-if="selected.size" class="fixed bottom-[24px] inset-x-0 z-[70] flex justify-center pointer-events-none px-4 font-707">
          <div class="pointer-events-auto flex items-center gap-1 pl-4 pr-1.5 py-1.5 rounded-[14px] bg-[#0c0d0e]/[0.92] backdrop-blur-2xl border border-white/10 text-white shadow-[0_24px_60px_rgba(0,0,0,0.35)] max-w-full overflow-x-auto no-scrollbar">
            <span class="text-[12px] font-medium whitespace-nowrap tabular-nums pr-2">{{ selected.size }} selected</span>
            <div class="w-px h-5 bg-white/15 mx-1" />
            <button
              v-for="o in STATUS_OPTIONS"
              :key="o.value"
              type="button"
              @click="applyStatus([...selected], o.value)"
              class="px-2.5 h-[30px] rounded-[8px] text-[11.5px] hover:bg-white/10 cursor-pointer whitespace-nowrap transition-colors"
            >
              {{ o.label }}
            </button>
            <div class="w-px h-5 bg-white/15 mx-1" />
            <button type="button" @click="sendTickets(selectedRows)" :disabled="!!ticketSender.progress.value && !ticketSender.progress.value.finished" class="px-2.5 h-[30px] rounded-[8px] text-[11.5px] hover:bg-white/10 cursor-pointer flex items-center gap-1.5 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed" title="Email each selected guest their e-ticket PDF">
              <Mail class="w-3.5 h-3.5" /> Send ticket
            </button>
            <button type="button" @click="exportCsv(selectedRows)" class="px-2.5 h-[30px] rounded-[8px] text-[11.5px] hover:bg-white/10 cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
              <Download class="w-3.5 h-3.5" /> Export
            </button>
            <button type="button" @click="deleteRows([...selected])" class="px-2.5 h-[30px] rounded-[8px] text-[11.5px] text-oxblood-200 hover:bg-oxblood-600/20 hover:text-oxblood-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
              <Trash2 class="w-3.5 h-3.5" /> Delete
            </button>
            <button type="button" @click="selected = new Set()" class="size-[30px] rounded-[8px] hover:bg-white/10 flex items-center justify-center cursor-pointer shrink-0" title="Clear selection (Esc)">
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Guest detail drawer -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div v-if="drawerRow" class="fixed inset-0 z-[75] bg-white/40 backdrop-blur-[2px]" @click="drawerId = null" />
      </Transition>
      <Transition name="hub-drawer">
        <aside
          v-if="drawerRow"
          class="fixed top-0 right-0 bottom-0 z-[76] w-full sm:w-[440px] apple-frost-strong border-l border-black/10 shadow-[-24px_0_60px_rgba(0,0,0,0.12)] flex flex-col font-707"
          role="dialog"
          aria-label="Guest details"
        >
          <div class="flex items-center justify-between px-5 h-[56px] border-b border-black/5 shrink-0">
            <div class="flex items-center gap-1">
              <button type="button" @click="stepDrawer(-1)" class="size-8 rounded-[8px] hover:bg-black/5 flex items-center justify-center cursor-pointer disabled:opacity-30" :disabled="drawerIndex <= 0" title="Previous guest">
                <ChevronUp class="w-4 h-4" />
              </button>
              <button type="button" @click="stepDrawer(1)" class="size-8 rounded-[8px] hover:bg-black/5 flex items-center justify-center cursor-pointer disabled:opacity-30" :disabled="drawerIndex >= sortedRows.length - 1" title="Next guest">
                <ChevronDown class="w-4 h-4" />
              </button>
              <span class="text-[11px] text-neutral-400 ml-1 tabular-nums">{{ drawerIndex + 1 }} / {{ sortedRows.length }}</span>
            </div>
            <button type="button" @click="drawerId = null" class="size-[32px] bg-black/5 hover:bg-black/10 rounded-full flex items-center justify-center cursor-pointer" title="Close">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">
            <!-- Identity -->
            <div class="flex items-center gap-4">
              <div class="size-14 rounded-full flex items-center justify-center text-[17px] font-medium shrink-0" :class="normalizeStatus(drawerRow.status) === 'winner' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700 border border-black/5'">
                {{ initials(guestName(drawerRow)) }}
              </div>
              <div class="min-w-0">
                <h3 class="text-[19px] leading-[24px] font-medium truncate">{{ guestName(drawerRow) }}</h3>
                <p v-if="drawerRow.duplicate_of" class="text-[11px] text-bronze-800 bg-bronze-50 border border-bronze-200 rounded-[6px] px-2 py-1 mt-1 w-fit">
                  Registered more than once — this is an extra entry. Its pass still works at the door.
                </p>
                <p class="text-[12px] text-neutral-500 truncate">{{ guestEmail(drawerRow) || 'No email provided' }}</p>
              </div>
            </div>

            <!-- Access ID card -->
            <div class="rounded-[14px] bg-[#0c0d0e] text-white p-4 relative overflow-hidden">
              <div class="absolute inset-0 opacity-[0.07] hub-grid" />
              <p class="text-[10px] uppercase tracking-[0.18em] text-white/50 relative">Access ID</p>
              <div class="flex items-center justify-between gap-3 mt-1 relative">
                <span class="font-mono text-[20px] tracking-[0.06em] truncate">{{ accessId(drawerRow) }}</span>
                <button type="button" @click="copy(accessId(drawerRow))" class="h-[28px] px-2.5 rounded-[7px] bg-white/10 hover:bg-white/20 text-[11px] flex items-center gap-1.5 cursor-pointer shrink-0">
                  <Copy class="w-3.5 h-3.5" /> Copy
                </button>
              </div>
              <div class="flex items-center gap-2 mt-3 text-[11px] relative" :class="drawerRow.checked_in_at ? 'text-moss-300' : 'text-white/50'">
                <span class="size-1.5 rounded-full" :class="drawerRow.checked_in_at ? 'bg-moss-300' : 'bg-white/30'" />
                {{ drawerRow.checked_in_at ? `Checked in ${formatDateTime(drawerRow.checked_in_at)}${drawerRow.checked_in_by ? ` · by ${drawerRow.checked_in_by}` : ''}` : 'Not checked in yet' }}
              </div>
            </div>

            <!-- Status -->
            <div class="flex flex-col gap-2">
              <p class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">Status</p>
              <div class="grid grid-cols-3 gap-1 p-1 rounded-[10px] bg-black/[0.04] border border-black/5">
                <button
                  v-for="o in STATUS_OPTIONS"
                  :key="o.value"
                  type="button"
                  @click="applyStatus([drawerRow.id], o.value)"
                  class="h-[30px] rounded-[7px] text-[11.5px] cursor-pointer transition-all"
                  :class="normalizeStatus(drawerRow.status) === o.value ? (o.value === 'winner' ? 'bg-black text-white font-medium' : 'bg-white text-black font-medium shadow-[0_1px_2px_rgba(0,0,0,0.08)]') : 'text-neutral-500 hover:text-black'"
                >
                  {{ o.label }}
                </button>
              </div>
            </div>

            <!-- Answers -->
            <div class="flex flex-col gap-2">
              <p class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">Form answers</p>
              <div class="rounded-[12px] border border-black/8 bg-white divide-y divide-black/5">
                <div class="flex items-start justify-between gap-4 px-3.5 py-2.5">
                  <span class="text-[12px] text-neutral-500">WhatsApp</span>
                  <a v-if="guestPhone(drawerRow)" :href="whatsappLink(guestPhone(drawerRow))" target="_blank" rel="noopener" class="text-[12px] font-mono text-right hover:underline underline-offset-2">{{ guestPhone(drawerRow) }}</a>
                  <span v-else class="text-[12px] text-neutral-300">—</span>
                </div>
                <div v-for="k in drawerAnswerKeys" :key="k" class="flex items-start justify-between gap-4 px-3.5 py-2.5">
                  <span class="text-[12px] text-neutral-500 shrink-0 max-w-[45%]">{{ k }}</span>
                  <span class="text-[12px] text-right break-words min-w-0">{{ formatValue(drawerRow.form_data?.[k]) || '—' }}</span>
                </div>
              </div>
            </div>

            <!-- Meta -->
            <div class="flex flex-col gap-2">
              <p class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">Record</p>
              <div class="rounded-[12px] border border-black/8 bg-white divide-y divide-black/5 text-[12px]">
                <div class="flex justify-between px-3.5 py-2.5"><span class="text-neutral-500">Campaign</span><span class="text-right truncate ml-4">{{ campaignTitle(drawerRow.page_id) }}</span></div>
                <div class="flex justify-between px-3.5 py-2.5"><span class="text-neutral-500">Submitted</span><span class="tabular-nums">{{ formatDateTime(drawerRow.created_at) }}</span></div>
                <div class="flex justify-between px-3.5 py-2.5"><span class="text-neutral-500">Record ID</span><span class="font-mono text-[11px] text-neutral-500 truncate ml-4">{{ drawerRow.id }}</span></div>
              </div>
            </div>
          </div>

          <!-- Drawer footer -->
          <div class="flex items-center gap-2 px-5 py-4 border-t border-black/5 shrink-0">
            <button
              type="button"
              @click="toggleCheckIn(drawerRow)"
              class="flex-1 h-[40px] rounded-[10px] text-[12.5px] font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
              :class="drawerRow.checked_in_at ? 'border border-black/15 hover:bg-black/5' : 'bg-black text-white hover:bg-neutral-800'"
            >
              <component :is="drawerRow.checked_in_at ? LogOut : LogIn" class="w-4 h-4" />
              {{ drawerRow.checked_in_at ? 'Undo check-in' : 'Check in guest' }}
            </button>
            <button type="button" @click="deleteRows([drawerRow.id])" class="size-[40px] rounded-[10px] border border-oxblood-200 text-oxblood-600 hover:bg-oxblood-600 hover:text-white flex items-center justify-center cursor-pointer transition-colors" title="Delete guest">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </aside>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { glassConfirm } from '../../services/glassDialog.ts';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import {
  Search, X, Download, Columns3, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronUp, ChevronRight,
  Check, Circle, CircleCheck, Users, Trash2, Copy, LogIn, LogOut, Mail
} from 'lucide-vue-next';
import { useTicketSender } from './useTicketSender.ts';
import {
  type Submission, type GuestStatus, STATUS_OPTIONS, normalizeStatus, statusLabel, statusBadgeClass, statusDotClass,
  guestName, guestEmail, guestPhone, customFieldKeys, formatValue, initials, accessId, formatDateTime, formatTime,
  buildCsv, downloadText, patchSubmission, bulkSetStatus, bulkDelete
} from './hubUtils.ts';

const props = defineProps<{
  rows: Submission[];
  campaignTitle: (pageId: string) => string;
  showCampaignColumn: boolean;
  exportName: string;
}>();

const emit = defineEmits<{
  (e: 'updated', rows: Submission[]): void;
  (e: 'removed', ids: string[]): void;
  (e: 'toast', msg: string): void;
}>();

/* ---------- Filters ---------- */
const search = ref('');
const statusFilter = ref<'all' | GuestStatus>('all');
const checkFilter = ref<'any' | 'in' | 'out'>('any');
const duplicatesOnly = ref(false);
const duplicateCount = computed(() => props.rows.filter(r => r.duplicate_of).length);
const searchRef = ref<HTMLInputElement | null>(null);

const statusFilters = computed(() => [
  { value: 'all' as const, label: 'All', count: props.rows.length },
  ...STATUS_OPTIONS.map(o => ({ value: o.value, label: o.label, count: props.rows.filter(r => normalizeStatus(r.status) === o.value).length }))
]);

const checkFilters = [
  { value: 'any' as const, label: 'Any' },
  { value: 'in' as const, label: 'Checked in' },
  { value: 'out' as const, label: 'Not in' }
];

const hasActiveFilters = computed(() => !!search.value.trim() || statusFilter.value !== 'all' || checkFilter.value !== 'any' || duplicatesOnly.value);

function clearFilters() {
  search.value = '';
  statusFilter.value = 'all';
  checkFilter.value = 'any';
  duplicatesOnly.value = false;
}

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase();
  return props.rows.filter(s => {
    if (statusFilter.value !== 'all' && normalizeStatus(s.status) !== statusFilter.value) return false;
    if (checkFilter.value === 'in' && !s.checked_in_at) return false;
    if (checkFilter.value === 'out' && s.checked_in_at) return false;
    if (duplicatesOnly.value && !s.duplicate_of) return false;
    if (!q) return true;
    const hay = [guestName(s), guestEmail(s), guestPhone(s), accessId(s), ...Object.values(s.form_data || {}).map(formatValue)]
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
});

/* ---------- Columns ---------- */
interface Col { key: string; label: string; sortable?: boolean; thClass?: string; custom?: boolean }

const customKeys = computed(() => customFieldKeys(props.rows));

const allColumns = computed<Col[]>(() => {
  const cols: Col[] = [
    { key: 'guest', label: 'Guest', sortable: true },
    { key: 'phone', label: 'WhatsApp' },
    { key: 'access', label: 'Access ID' }
  ];
  if (props.showCampaignColumn) cols.push({ key: 'campaign', label: 'Campaign', sortable: true });
  customKeys.value.forEach(k => cols.push({ key: k, label: k, sortable: true, custom: true }));
  cols.push(
    { key: 'status', label: 'Status', sortable: true },
    { key: 'checked_in_at', label: 'Check-in', sortable: true },
    { key: 'created_at', label: 'Submitted', sortable: true }
  );
  return cols;
});

const STORAGE_KEY = 'hub_guest_table_prefs';
const savedPrefs = (() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
})();
const hiddenColumns = ref<Set<string>>(new Set(savedPrefs.hidden || []));
const compact = ref<boolean>(!!savedPrefs.compact);
const isColumnsOpen = ref(false);
const columnsMenuRef = ref<HTMLElement | null>(null);

watch([hiddenColumns, compact], () => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ hidden: [...hiddenColumns.value], compact: compact.value })); } catch { /* ignore */ }
}, { deep: true });

const toggleableColumns = computed(() => allColumns.value.filter(c => c.key !== 'guest'));
const visibleColumns = computed(() => allColumns.value.filter(c => !hiddenColumns.value.has(c.key)));

function toggleColumn(key: string) {
  const next = new Set(hiddenColumns.value);
  next.has(key) ? next.delete(key) : next.add(key);
  hiddenColumns.value = next;
}

const rowPad = computed(() => (compact.value ? 'py-1.5' : 'py-2.5'));

/* ---------- Sorting ---------- */
const sortKey = ref<string>('created_at');
const sortDir = ref<'asc' | 'desc'>('desc');

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDir.value = key === 'created_at' || key === 'checked_in_at' ? 'desc' : 'asc';
  }
}

function sortValue(s: Submission, key: string): string | number {
  switch (key) {
    case 'guest': return guestName(s).toLowerCase();
    case 'campaign': return props.campaignTitle(s.page_id).toLowerCase();
    case 'status': return STATUS_OPTIONS.findIndex(o => o.value === normalizeStatus(s.status));
    case 'checked_in_at': return s.checked_in_at ? new Date(s.checked_in_at).getTime() : 0;
    case 'created_at': return new Date(s.created_at).getTime();
    default: {
      const v = formatValue(s.form_data?.[key]);
      const n = Number(v);
      return v !== '' && !isNaN(n) ? n : v.toLowerCase();
    }
  }
}

const sortedRows = computed(() => {
  const dir = sortDir.value === 'asc' ? 1 : -1;
  const key = sortKey.value;
  return [...filteredRows.value].sort((a, b) => {
    const va = sortValue(a, key);
    const vb = sortValue(b, key);
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });
});

const renderLimit = ref(150);
const pagedRows = computed(() => sortedRows.value.slice(0, renderLimit.value));
watch([search, statusFilter, checkFilter, duplicatesOnly], () => (renderLimit.value = 150));

/* ---------- Selection ---------- */
const selected = ref<Set<string>>(new Set());
let lastClickedIndex = -1;

const selectedRows = computed(() => props.rows.filter(r => selected.value.has(r.id)));
const allVisibleSelected = computed(() => sortedRows.value.length > 0 && sortedRows.value.every(r => selected.value.has(r.id)));
const someVisibleSelected = computed(() => sortedRows.value.some(r => selected.value.has(r.id)));

function toggleSelectAll() {
  const next = new Set(selected.value);
  if (allVisibleSelected.value) sortedRows.value.forEach(r => next.delete(r.id));
  else sortedRows.value.forEach(r => next.add(r.id));
  selected.value = next;
}

function toggleRow(id: string, idx: number, e: MouseEvent) {
  const next = new Set(selected.value);
  if (e.shiftKey && lastClickedIndex >= 0) {
    const [a, b] = [Math.min(lastClickedIndex, idx), Math.max(lastClickedIndex, idx)];
    const shouldSelect = !next.has(id);
    pagedRows.value.slice(a, b + 1).forEach(r => (shouldSelect ? next.add(r.id) : next.delete(r.id)));
  } else {
    next.has(id) ? next.delete(id) : next.add(id);
  }
  lastClickedIndex = idx;
  selected.value = next;
}

// Drop selections that no longer exist (deleted / campaign switched)
watch(() => props.rows, rows => {
  const ids = new Set(rows.map(r => r.id));
  const next = new Set([...selected.value].filter(id => ids.has(id)));
  if (next.size !== selected.value.size) selected.value = next;
});

/* ---------- Inline status menu ---------- */
const statusMenu = ref<{ id: string; x: number; y: number } | null>(null);
const statusMenuRef = ref<HTMLElement | null>(null);
const statusMenuRowStatus = computed(() => {
  const r = props.rows.find(x => x.id === statusMenu.value?.id);
  return r ? normalizeStatus(r.status) : null;
});

function openStatusMenu(id: string, e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const menuH = 200;
  const y = rect.bottom + menuH > window.innerHeight ? rect.top - menuH - 6 : rect.bottom + 6;
  statusMenu.value = { id, x: Math.min(rect.left, window.innerWidth - 200), y };
}

/* ---------- Mutations ---------- */
async function applyStatus(ids: string[], status: GuestStatus) {
  statusMenu.value = null;
  if (!ids.length) return;
  // Optimistic: reflect instantly, roll back on failure
  const previous = props.rows.filter(r => ids.includes(r.id));
  emit('updated', previous.map(r => ({ ...r, status })));
  try {
    const updated = ids.length === 1
      ? [await patchSubmission(ids[0], { status })].filter(Boolean) as Submission[]
      : await bulkSetStatus(ids, status);
    if (updated.length) emit('updated', updated);
    emit('toast', ids.length === 1 ? `Marked as ${statusLabel(status)}.` : `${ids.length} guests marked as ${statusLabel(status)}.`);
    if (ids.length > 1) selected.value = new Set();
  } catch (err: any) {
    emit('updated', previous);
    emit('toast', `Couldn't update status: ${err?.message || 'network error'}`);
  }
}

/* ---------- Ticket emails ---------- */
const ticketSender = useTicketSender();

async function sendTickets(rows: Submission[]) {
  if (!rows.length) return;
  const checks = rows.map(r => ticketSender.eligibility(r));
  const eligible = rows.filter((_, i) => checks[i].ok);
  const count = (why: string) => checks.filter(c => !c.ok && (c as any).why === why).length;
  if (!eligible.length) {
    emit('toast', `Nobody to send to: ${count('sent')} already got their ticket, ${count('status')} have no place, ${count('email')} have no email.`);
    return;
  }
  const notes = [
    count('sent') ? `${count('sent')} already received their ticket by email and are skipped.` : '',
    count('status') ? `${count('status')} are waitlisted or declined and are skipped.` : '',
    count('email') ? `${count('email')} have no email and are skipped.` : '',
    count('design') ? `${count('design')} belong to a campaign without a Ticket page and are skipped.` : ''
  ].filter(Boolean).join(' ');
  const ok = await glassConfirm({
    title: `Email the ticket to ${eligible.length} ${eligible.length === 1 ? 'guest' : 'guests'}?`,
    message: `Each guest gets an email with their e-ticket PDF — the same ticket, details and QR as at registration. The PDFs are made one by one in this browser, so keep this tab open until it finishes (a few seconds per guest). ${notes}`.trim(),
    confirmLabel: 'Send tickets'
  });
  if (!ok) return;
  selected.value = new Set();
  const stamp = new Date().toISOString();
  const result = await ticketSender.run(eligible, id => {
    const row = props.rows.find(r => r.id === id);
    if (row) emit('updated', [{ ...row, ticket_emailed_at: stamp }]);
  });
  emit('toast', `Tickets: ${result.sent} sent${result.failed ? `, ${result.failed} failed` : ''}${result.skipped ? `, ${result.skipped} skipped` : ''}.`);
}

async function toggleCheckIn(s: Submission) {
  const checkIn = !s.checked_in_at;
  emit('updated', [{ ...s, checked_in_at: checkIn ? new Date().toISOString() : null }]);
  try {
    const updated = await patchSubmission(s.id, { checked_in: checkIn, operator: 'Studio' });
    if (updated) emit('updated', [updated]);
    emit('toast', checkIn ? `${guestName(s)} checked in.` : `Check-in undone for ${guestName(s)}.`);
  } catch (err: any) {
    emit('updated', [s]);
    emit('toast', `Couldn't update check-in: ${err?.message || 'network error'}`);
  }
}

async function deleteRows(ids: string[]) {
  if (!ids.length) return;
  const label = ids.length === 1 ? guestName(props.rows.find(r => r.id === ids[0])!) : `${ids.length} guests`;
  if (!(await glassConfirm({ title: `Delete ${label}?`, message: "This permanently removes them from the guest database. It can't be undone.", confirmLabel: 'Delete', danger: true }))) return;
  try {
    const removed = await bulkDelete(ids);
    emit('removed', removed);
    if (drawerId.value && removed.includes(drawerId.value)) drawerId.value = null;
    selected.value = new Set([...selected.value].filter(id => !removed.includes(id)));
    emit('toast', removed.length === ids.length ? `Deleted ${label}.` : `Deleted ${removed.length} of ${ids.length} — the rest could not be removed.`);
  } catch (err: any) {
    emit('toast', `Couldn't delete: ${err?.message || 'network error'}`);
  }
}

function exportCsv(rows: Submission[]) {
  if (!rows.length) {
    emit('toast', 'Nothing to export.');
    return;
  }
  const stamp = new Date().toISOString().slice(0, 10);
  downloadText(`707-guests-${props.exportName}-${stamp}.csv`, buildCsv(rows, customKeys.value, props.campaignTitle));
  emit('toast', `Exported ${rows.length} guest${rows.length === 1 ? '' : 's'} to CSV.`);
}

/* ---------- Drawer ---------- */
const drawerId = ref<string | null>(null);
const drawerRow = computed(() => props.rows.find(r => r.id === drawerId.value) || null);
const drawerIndex = computed(() => sortedRows.value.findIndex(r => r.id === drawerId.value));
const drawerAnswerKeys = computed(() => {
  if (!drawerRow.value) return [];
  const own = Object.keys(drawerRow.value.form_data || {});
  return customFieldKeys([drawerRow.value]).filter(k => own.includes(k));
});

function openDrawer(id: string) {
  statusMenu.value = null;
  drawerId.value = id;
}

function stepDrawer(delta: number) {
  const next = sortedRows.value[drawerIndex.value + delta];
  if (next) drawerId.value = next.id;
}

/* ---------- Misc ---------- */
function whatsappLink(phone: string): string {
  let digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    emit('toast', 'Access ID copied.');
  } catch {
    emit('toast', text);
  }
}

function handleEscape() {
  if (statusMenu.value) statusMenu.value = null;
  else if (drawerId.value) drawerId.value = null;
  else if (selected.value.size) selected.value = new Set();
}

function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
  if (e.key === '/' && !typing) {
    e.preventDefault();
    searchRef.value?.focus();
  } else if (e.key === 'Escape') {
    if (typing) (target as HTMLInputElement).blur();
    handleEscape();
  } else if (drawerId.value && !typing && (e.key === 'ArrowDown' || e.key === 'j')) {
    e.preventDefault();
    stepDrawer(1);
  } else if (drawerId.value && !typing && (e.key === 'ArrowUp' || e.key === 'k')) {
    e.preventDefault();
    stepDrawer(-1);
  }
}

function handleDocClick(e: MouseEvent) {
  const t = e.target as Node;
  if (statusMenu.value && statusMenuRef.value && !statusMenuRef.value.contains(t)) statusMenu.value = null;
  if (isColumnsOpen.value && columnsMenuRef.value && !columnsMenuRef.value.contains(t)) isColumnsOpen.value = false;
}

function closeFloating() {
  statusMenu.value = null;
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  document.addEventListener('mousedown', handleDocClick);
  window.addEventListener('scroll', closeFloating, true);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('mousedown', handleDocClick);
  window.removeEventListener('scroll', closeFloating, true);
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }

.hub-check {
  appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.25);
  background: #fff;
  display: inline-grid;
  place-content: center;
  cursor: pointer;
  transition: background 0.12s ease, border-color 0.12s ease;
  vertical-align: middle;
}
.hub-check:checked,
.hub-check:indeterminate {
  background: #000;
  border-color: #000;
}
.hub-check:checked::after {
  content: '';
  width: 8px;
  height: 4.5px;
  border-left: 1.6px solid #fff;
  border-bottom: 1.6px solid #fff;
  transform: rotate(-45deg) translate(0.5px, -1px);
}
.hub-check:indeterminate::after {
  content: '';
  width: 7px;
  height: 1.6px;
  background: #fff;
  border-radius: 1px;
}

.hub-switch {
  width: 30px;
  height: 18px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.15);
  position: relative;
  cursor: pointer;
  transition: background 0.18s ease;
}
.hub-switch span {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1.2);
}
.hub-switch.is-on { background: #000; }
.hub-switch.is-on span { transform: translateX(12px); }

.hub-table-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
.hub-table-scroll::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.12); border-radius: 8px; }

.hub-grid {
  background-image: linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px);
  background-size: 14px 14px;
}

.hub-pop-enter-active, .hub-pop-leave-active { transition: opacity 0.16s ease, transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1.2); }
.hub-pop-enter-from, .hub-pop-leave-to { opacity: 0; transform: translateY(4px) scale(0.98); }

.hub-bar-enter-active, .hub-bar-leave-active { transition: opacity 0.2s ease, transform 0.32s cubic-bezier(0.2, 0.9, 0.3, 1.15); }
.hub-bar-enter-from, .hub-bar-leave-to { opacity: 0; transform: translateY(24px); }

.hub-fade-enter-active, .hub-fade-leave-active { transition: opacity 0.2s ease; }
.hub-fade-enter-from, .hub-fade-leave-to { opacity: 0; }

.hub-drawer-enter-active, .hub-drawer-leave-active { transition: transform 0.34s cubic-bezier(0.2, 0.9, 0.25, 1); }
.hub-drawer-enter-from, .hub-drawer-leave-to { transform: translateX(100%); }
</style>
