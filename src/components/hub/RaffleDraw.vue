<template>
  <div class="flex flex-col gap-4 w-full font-sans font-light tracking-normal" @click="showInfo = false">
    
    <!-- Top Action & Info Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/10">
      <div class="flex items-center gap-2">
        <h2 class="text-[16px] font-medium text-black tracking-normal">Raffle & Stage Draw</h2>
        
        <!-- Info Tooltip -->
        <div class="relative inline-flex items-center" @click.stop>
          <button
            type="button"
            @click="showInfo = !showInfo"
            class="size-4 rounded-full text-neutral-400 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
            title="Draw rules & cryptographic fairness"
          >
            <Info class="w-3.5 h-3.5" />
          </button>
          <div
            v-if="showInfo"
            class="absolute top-full left-0 mt-2 w-72 p-3 rounded-[12px] bg-black text-white text-[11px] font-light leading-relaxed shadow-xl z-30 animate-apple-pop"
          >
            Winners are selected with cryptographic random sampling (Web Crypto CSPRNG). Duplicate registrations are automatically deduplicated. Results remain in staging until you confirm.
            <div class="absolute bottom-full left-3.5 border-4 border-transparent border-b-black" />
          </div>
        </div>

        <span class="text-neutral-300">•</span>
        <span class="text-[12px] text-neutral-500 font-light">
          <strong class="font-medium text-black tabular-nums">{{ eligible.length }}</strong> eligible candidates
        </span>
      </div>

      <!-- Single Unified Stage Mode Launch Button -->
      <button
        type="button"
        @click="openStageMode"
        class="h-[34px] px-3.5 rounded-[9px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium flex items-center gap-2 cursor-pointer transition-colors apple-press shadow-xs shrink-0"
        title="Open full-screen stage mode for live projector display"
      >
        <Maximize2 class="w-3.5 h-3.5 text-neutral-300" />
        <span>Launch Stage Screen</span>
      </button>
    </div>

    <!-- Main Workspace: Left Settings vs Right Results & Roster -->
    <div class="grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-4 w-full items-start">
      
      <!-- ============================================================== -->
      <!-- LEFT: DRAW CONFIGURATION CONSOLE                               -->
      <!-- ============================================================== -->
      <div class="rounded-[16px] border border-black/10 bg-white p-5 flex flex-col gap-4 shadow-xs">
        
        <!-- Section 1: Candidate Pool -->
        <div class="flex flex-col gap-2">
          <span class="text-[11px] font-medium uppercase tracking-normal text-neutral-500">Candidate Pool</span>
          
          <div class="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-[10px] border border-black/5">
            <button
              v-for="opt in poolOptions"
              :key="opt.value"
              type="button"
              @click="poolRule = opt.value"
              class="px-2.5 py-2 rounded-[8px] text-[11.5px] font-sans flex flex-col items-start transition-all cursor-pointer text-left"
              :class="poolRule === opt.value ? 'bg-white text-black font-medium shadow-xs' : 'text-neutral-500 hover:text-black font-light'"
            >
              <div class="flex items-center justify-between w-full">
                <span class="truncate">{{ opt.shortLabel }}</span>
                <span class="text-[10px] tabular-nums font-mono opacity-60 ml-1">{{ poolCounts[opt.value] }}</span>
              </div>
            </button>
          </div>

          <!-- Exclude Previous Winners Checkbox -->
          <label v-if="!isWaitlistDraw" class="flex items-center gap-2 cursor-pointer pt-0.5">
            <input 
              v-model="excludePastWinners" 
              type="checkbox" 
              class="size-3.5 rounded border-black/20 accent-black cursor-pointer" 
            />
            <span class="text-[12px] text-neutral-600 font-light select-none">Exclude previous winners</span>
          </label>
        </div>

        <!-- Section 2: Winner Count Stepper + Quick Presets -->
        <div class="flex flex-col gap-2 pt-1 border-t border-black/5">
          <div class="flex items-center justify-between text-[11.5px]">
            <span class="text-[11px] font-medium uppercase tracking-normal text-neutral-500">
              {{ isWaitlistDraw ? 'Candidates to Release' : 'Winners to Draw' }}
            </span>
            <span class="text-neutral-400 font-mono text-[10.5px]">max {{ eligible.length }}</span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Stepper -->
            <div class="flex items-center bg-neutral-100 rounded-[9px] border border-black/5 p-0.5">
              <button
                type="button"
                @click="winnerCount = Math.max(1, winnerCount - 1)"
                class="size-8 rounded-[7px] hover:bg-white flex items-center justify-center text-neutral-700 hover:text-black cursor-pointer transition-colors"
                title="Decrease"
              >
                <Minus class="w-3.5 h-3.5" />
              </button>
              <input
                v-model.number="winnerCount"
                type="number"
                min="1"
                :max="Math.max(1, eligible.length)"
                class="w-12 h-8 bg-transparent text-center text-[13px] font-medium font-mono tabular-nums outline-none"
              />
              <button
                type="button"
                @click="winnerCount = Math.min(Math.max(1, eligible.length), winnerCount + 1)"
                class="size-8 rounded-[7px] hover:bg-white flex items-center justify-center text-neutral-700 hover:text-black cursor-pointer transition-colors"
                title="Increase"
              >
                <Plus class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Quick Presets -->
            <div class="flex items-center gap-1 flex-1">
              <button
                v-for="preset in [1, 3, 5, 10]"
                :key="preset"
                type="button"
                @click="winnerCount = Math.min(preset, Math.max(1, eligible.length))"
                class="flex-1 h-8 rounded-[8px] text-[11.5px] font-sans font-medium transition-all cursor-pointer flex items-center justify-center"
                :class="winnerCount === preset ? 'bg-black text-white shadow-xs' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-light'"
              >
                {{ preset }}
              </button>
            </div>
          </div>
        </div>

        <!-- Section 3: Draw Trigger Action -->
        <div class="flex flex-col gap-2 pt-2 border-t border-black/5">
          <button
            id="raffle-draw-btn"
            type="button"
            :disabled="!eligible.length || isDrawing || isSaving"
            @click="draw"
            class="apple-press h-[42px] rounded-[10px] bg-black text-white text-[13px] font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
          >
            <Shuffle class="w-4 h-4" :class="isDrawing ? 'animate-spin' : ''" />
            <span>{{ isDrawing ? 'Drawing…' : (drawn.length ? 'Draw Again' : (isWaitlistDraw ? `Release ${winnerCount} from Waitlist` : `Draw ${winnerCount} Winner${winnerCount > 1 ? 's' : ''}`)) }}</span>
          </button>

          <p v-if="!eligible.length" class="text-[11.5px] text-neutral-400 text-center font-light">
            No candidates match current pool rules.
          </p>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- RIGHT: STAGED RESULTS & CONFIRMED WINNERS ROSTER               -->
      <!-- ============================================================== -->
      <div class="flex flex-col gap-4 min-w-0">
        
        <!-- CARD A: ACTIVE STAGING / DRAW RESULTS -->
        <div class="rounded-[16px] border border-black/10 bg-white p-5 flex flex-col gap-4 shadow-xs min-h-[220px]">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
            <div class="flex items-center gap-2">
              <span class="text-[14px] font-medium text-black">
                {{ drawn.length ? (isWaitlistDraw ? 'Waitlist Candidates Drawn' : 'Staged Winners') : 'Active Draw Stage' }}
              </span>
              <span v-if="drawn.length" class="px-2 py-0.5 rounded-[5px] bg-amber-50 border border-amber-200 text-amber-800 text-[10.5px] font-medium">
                {{ drawn.length }} selected · Not saved yet
              </span>
            </div>

            <!-- Staging Actions -->
            <div v-if="drawn.length && !isDrawing" class="flex items-center gap-2">
              <button
                v-if="isSaving && prepStep"
                type="button"
                @click="ticketSender.cancel()"
                class="h-[30px] px-3 rounded-[8px] border border-black/15 text-[12px] hover:bg-black/5 cursor-pointer"
              >
                Stop
              </button>
              <template v-else>
                <button
                  type="button"
                  :disabled="isSaving"
                  @click="drawn = []"
                  class="h-[30px] px-3 rounded-[8px] border border-black/15 text-[12px] hover:bg-black/5 cursor-pointer disabled:opacity-40 transition-colors"
                >
                  Discard
                </button>
                <button
                  type="button"
                  :disabled="isSaving"
                  @click="draw"
                  class="h-[30px] px-3 rounded-[8px] border border-black/15 text-[12px] hover:bg-black/5 cursor-pointer disabled:opacity-40 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw class="w-3 h-3" />
                  <span>Re-roll</span>
                </button>
                <button
                  id="raffle-confirm-btn"
                  type="button"
                  :disabled="isSaving"
                  @click="confirmWinners"
                  class="apple-press h-[30px] px-3.5 rounded-[8px] bg-black text-white text-[12px] font-medium hover:bg-neutral-800 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check class="w-3.5 h-3.5" />
                  <span>{{ isSaving ? (prepStep ? `Preparing tickets ${prepStep.done}/${prepStep.total}…` : 'Saving…') : (isWaitlistDraw ? `Release ${drawn.length} from Waitlist` : `Confirm & Save ${drawn.length} Winner${drawn.length === 1 ? '' : 's'}`) }}</span>
                </button>
              </template>
            </div>
          </div>

          <!-- State 1: Shuffling live animation -->
          <div v-if="isDrawing" class="flex-1 flex flex-col items-center justify-center py-10 gap-2.5">
            <div class="size-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-800 animate-pulse">
              <Sparkles class="w-5 h-5 animate-spin" />
            </div>
            <p class="text-[24px] font-medium tabular-nums tracking-tight text-black">{{ shuffleName }}</p>
            <p class="text-[11.5px] text-neutral-500 font-light">Cycling through {{ eligible.length }} verified entries…</p>
          </div>

          <!-- State 2: Winner(s) Drawn -->
          <div v-else-if="drawn.length" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div
              v-for="(s, i) in drawn"
              :key="s.id"
              class="p-3 rounded-[12px] bg-neutral-50/80 border border-black/5 flex items-center gap-3"
            >
              <div class="size-9 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-medium shrink-0">
                {{ initials(guestName(s)) }}
              </div>
              <div class="flex flex-col min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-mono text-neutral-400 font-medium">#{{ i + 1 }}</span>
                  <span class="text-[13px] font-medium text-black truncate">{{ guestName(s) }}</span>
                </div>
                <span class="text-[11px] text-neutral-500 font-light truncate">
                  {{ maskEmail(guestEmail(s)) || guestPhone(s) || '—' }}
                </span>
              </div>
              <div class="flex flex-col items-end gap-1 shrink-0">
                <span class="text-[11px] font-mono text-neutral-600 bg-white px-2 py-0.5 rounded-[5px] border border-black/5">
                  {{ accessId(s) }}
                </span>
                <span v-if="s.checked_in_at" class="text-[9.5px] px-1.5 py-0.2 rounded-full bg-moss-50 text-moss-700 border border-moss-200">
                  At venue
                </span>
              </div>
            </div>
          </div>

          <!-- State 3: Idle / Empty State -->
          <div v-else class="flex-1 flex flex-col items-center justify-center text-center py-10 gap-2.5 select-none">
            <div class="size-11 rounded-[12px] bg-neutral-100 flex items-center justify-center text-neutral-600">
              <Gift class="w-5 h-5" />
            </div>
            <p class="text-[13.5px] font-medium text-black">Ready to Draw</p>
            <p class="text-[12px] text-neutral-500 font-light max-w-[340px] leading-relaxed">
              Select your candidate pool and winner count on the left, then click Draw. You can re-roll as often as needed before confirming.
            </p>
          </div>
        </div>

        <!-- CARD B: CONFIRMED WINNERS ROSTER -->
        <div class="rounded-[16px] border border-black/10 bg-white p-5 flex flex-col gap-3 shadow-xs">
          <div class="flex items-center justify-between pb-2.5 border-b border-black/5">
            <div class="flex items-center gap-2">
              <h3 class="text-[14px] font-medium text-black">Confirmed Winners</h3>
              <span class="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-medium tabular-nums">
                {{ winners.length }}
              </span>
            </div>

            <button
              v-if="winners.length"
              type="button"
              @click="exportWinners"
              class="h-[30px] px-3 rounded-[8px] border border-black/15 text-[11.5px] hover:bg-black/5 cursor-pointer flex items-center gap-1.5 transition-colors font-medium text-neutral-700"
            >
              <Download class="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <p v-if="!winners.length" class="text-[12px] text-neutral-400 font-light py-4 text-center">
            No winners confirmed yet. Drawn candidates will appear here once saved.
          </p>

          <div v-else class="flex flex-col divide-y divide-black/5 max-h-[360px] overflow-y-auto pr-1">
            <div 
              v-for="(s, idx) in winners" 
              :key="s.id" 
              class="flex items-center gap-3 py-2.5 first:pt-1 last:pb-1"
            >
              <span class="w-6 text-[11px] font-mono text-neutral-400 tabular-nums">#{{ idx + 1 }}</span>
              <div class="size-7 rounded-full bg-neutral-100 border border-black/5 flex items-center justify-center text-[10.5px] font-medium shrink-0">
                {{ initials(guestName(s)) }}
              </div>
              <div class="flex flex-col min-w-0 flex-1">
                <span class="text-[12.5px] font-medium text-black truncate">{{ guestName(s) }}</span>
                <span class="text-[10.5px] text-neutral-400 font-light truncate">{{ maskEmail(guestEmail(s)) || guestPhone(s) || '—' }}</span>
              </div>
              <span class="text-[11px] font-mono text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded-[5px] border border-black/5">
                {{ accessId(s) }}
              </span>
              <span v-if="s.checked_in_at" class="text-[10px] px-1.5 py-0.5 rounded-full bg-moss-50 text-moss-700 border border-moss-200 font-light">
                At venue
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- CINEMATIC FULL-SCREEN STAGE MODE (For Projectors & Live Events)-->
    <!-- ============================================================== -->
    <Teleport to="body">
      <Transition name="stage-fade">
        <div
          v-if="isStageModeOpen"
          class="fixed inset-0 z-[120] bg-[#0b0c0d] text-white flex flex-col justify-between p-6 sm:p-10 font-sans font-light tracking-normal select-none overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <!-- Confetti Canvas -->
          <canvas ref="confettiCanvas" class="absolute inset-0 pointer-events-none z-20"></canvas>

          <!-- Top Stage Bar -->
          <div class="relative z-30 flex items-center justify-between w-full border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium bg-white/10 border border-white/15 text-white/95">
                <span class="size-2 rounded-full bg-moss-500 shrink-0" />
                LIVE RAFFLE STAGE
              </span>
              <span class="text-[13px] text-white/30 hidden sm:inline">|</span>
              <span class="text-[13.5px] text-white/80 font-medium truncate max-w-[340px]">{{ campaignTitle || exportName }}</span>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-[12px] text-white/50 tabular-nums hidden sm:inline">
                {{ eligible.length }} candidate{{ eligible.length === 1 ? '' : 's' }} in pool
              </span>
              <button
                type="button"
                @click="closeStageMode"
                class="h-[34px] px-3.5 rounded-[9px] bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[12px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Exit Stage Mode (Esc)"
              >
                <Minimize2 class="w-3.5 h-3.5" /> <span>Exit (Esc)</span>
              </button>
            </div>
          </div>

          <!-- Main Stage Centerpiece -->
          <div class="relative z-30 flex-1 flex flex-col items-center justify-center text-center my-6 max-w-4xl mx-auto w-full">
            <!-- State 1: Shuffling / In Progress -->
            <div v-if="isDrawing" class="flex flex-col items-center justify-center gap-6 animate-pulse">
              <div class="size-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <Sparkles class="w-8 h-8 text-amber-300 animate-spin" />
              </div>
              <div class="flex flex-col items-center gap-2">
                <p class="text-[12px] uppercase tracking-normal text-white/50 font-medium">Drawing Lucky Winner</p>
                <h1 class="text-[38px] sm:text-[64px] md:text-[80px] font-medium tracking-tight text-white font-mono leading-none drop-shadow-[0_8px_30px_rgba(255,255,255,0.3)]">
                  {{ shuffleName }}
                </h1>
                <p class="text-[13.5px] text-white/60 font-mono mt-2">Cycling {{ eligible.length }} entries...</p>
              </div>
            </div>

            <!-- State 2: Winner(s) Revealed -->
            <div v-else-if="drawn.length" class="flex flex-col items-center justify-center w-full gap-6">
              <div class="flex flex-col items-center gap-1.5">
                <span class="px-3.5 py-1 rounded-full text-[11px] uppercase tracking-normal font-medium bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  🎉 Winner{{ drawn.length > 1 ? 's' : '' }} Selected
                </span>
                <h2 class="text-[32px] sm:text-[44px] font-medium text-white tracking-tight">
                  Congratulations!
                </h2>
              </div>

              <!-- Winners Card Grid -->
              <div 
                class="w-full grid gap-4 max-h-[55vh] overflow-y-auto p-2"
                :class="drawn.length === 1 ? 'grid-cols-1 max-w-[460px]' : drawn.length <= 4 ? 'grid-cols-1 sm:grid-cols-2 max-w-[760px]' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl'"
              >
                <div
                  v-for="(s, idx) in drawn"
                  :key="s.id"
                  class="relative p-5 rounded-[18px] bg-white/[0.08] backdrop-blur-xl border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.5)] flex items-center gap-4 text-left transition-all hover:bg-white/[0.12]"
                >
                  <div class="size-13 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-black font-medium text-[17px] flex items-center justify-center shrink-0 shadow-lg">
                    {{ initials(guestName(s)) }}
                  </div>
                  <div class="flex flex-col min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="text-[11px] font-mono text-amber-300 uppercase tracking-wider font-medium">#{{ idx + 1 }} Winner</span>
                      <span v-if="s.checked_in_at" class="text-[10px] px-1.5 py-0.2 rounded-full bg-moss-500/20 text-moss-300 border border-moss-500/30">At Venue</span>
                    </div>
                    <h3 class="text-[19px] font-medium text-white truncate leading-snug">{{ guestName(s) }}</h3>
                    <p class="text-[12px] text-white/60 font-mono truncate">{{ maskEmail(guestEmail(s)) || guestPhone(s) || '—' }}</p>
                    <p class="text-[11px] text-white/40 font-mono mt-0.5">Pass ID: {{ accessId(s) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- State 3: Ready to Draw (Idle) -->
            <div v-else class="flex flex-col items-center justify-center gap-6">
              <div class="size-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                <Trophy class="w-10 h-10 text-amber-300/80" />
              </div>
              <div class="flex flex-col items-center gap-2">
                <span class="text-[12px] uppercase tracking-normal text-white/50 font-medium">Ready for Live Selection</span>
                <h1 class="text-[36px] sm:text-[54px] font-medium text-white tracking-tight leading-tight">
                  {{ isWaitlistDraw ? 'Waitlist Draw' : 'Official Prize Draw' }}
                </h1>
                <p class="text-[15px] text-white/60 max-w-[480px]">
                  Drawing <strong class="text-white font-mono">{{ winnerCount }}</strong> lucky {{ isWaitlistDraw ? 'guest' : 'winner' }}{{ winnerCount > 1 ? 's' : '' }} from a pool of <strong class="text-white font-mono">{{ eligible.length }}</strong> verified entries.
                </p>
              </div>

              <button
                type="button"
                :disabled="!eligible.length || isDrawing"
                @click="draw"
                class="apple-press h-[56px] px-10 rounded-[14px] bg-white text-black font-medium text-[17px] tracking-tight hover:bg-neutral-200 cursor-pointer shadow-[0_12px_36px_rgba(255,255,255,0.2)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-3 mt-4"
              >
                <Shuffle class="w-5 h-5" />
                <span>Start Lucky Draw</span>
              </button>
            </div>
          </div>

          <!-- Bottom Stage Controls -->
          <div class="relative z-30 flex items-center justify-between w-full border-t border-white/10 pt-4">
            <div class="flex items-center gap-2">
              <span class="text-[12px] text-white/50">Winners:</span>
              <div class="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-[8px] p-1">
                <button
                  type="button"
                  :disabled="isDrawing || isSaving"
                  @click="winnerCount = Math.max(1, winnerCount - 1)"
                  class="size-7 rounded-[6px] hover:bg-white/10 flex items-center justify-center text-white/80 cursor-pointer disabled:opacity-30"
                >
                  <Minus class="w-3.5 h-3.5" />
                </button>
                <span class="w-8 text-center text-[13px] font-mono font-medium tabular-nums text-white">{{ winnerCount }}</span>
                <button
                  type="button"
                  :disabled="isDrawing || isSaving || winnerCount >= eligible.length"
                  @click="winnerCount = Math.min(Math.max(1, eligible.length), winnerCount + 1)"
                  class="size-7 rounded-[6px] hover:bg-white/10 flex items-center justify-center text-white/80 cursor-pointer disabled:opacity-30"
                >
                  <Plus class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Stage Action Buttons -->
            <div v-if="drawn.length && !isDrawing" class="flex items-center gap-3">
              <button
                type="button"
                :disabled="isSaving"
                @click="draw"
                class="h-[40px] px-4 rounded-[10px] bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[13px] font-medium flex items-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw class="w-4 h-4" /> <span>Draw Again</span>
              </button>
              <button
                type="button"
                :disabled="isSaving"
                @click="confirmWinners"
                class="apple-press h-[40px] px-5 rounded-[10px] bg-white text-black font-medium text-[13px] hover:bg-neutral-100 flex items-center gap-2 cursor-pointer shadow-[0_8px_20px_rgba(255,255,255,0.15)] transition-all"
              >
                <Check class="w-4 h-4" /> <span>{{ isSaving ? 'Saving…' : 'Confirm Winners' }}</span>
              </button>
            </div>
            <div v-else class="text-[12px] text-white/40">
              Press <kbd class="px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono text-[11px]">Space</kbd> to draw · <kbd class="px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono text-[11px]">Esc</kbd> to exit
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { 
  Shuffle, Check, Gift, Download, Plus, Minus, Maximize2, Minimize2, 
  Sparkles, Trophy, RotateCcw, Info 
} from 'lucide-vue-next';
import { glassConfirm } from '../../services/glassDialog.ts';
import { useTicketSender } from './useTicketSender.ts';
import {
  type Submission, normalizeStatus, guestName, guestEmail, guestPhone, initials, accessId, maskEmail,
  secureSample, secureRandomInt, bulkSetStatus, buildCsv, customFieldKeys, downloadText
} from './hubUtils.ts';

const props = defineProps<{
  rows: Submission[];
  exportName: string;
  campaignTitle?: string;
}>();

const emit = defineEmits<{
  (e: 'updated', rows: Submission[]): void;
  (e: 'toast', msg: string): void;
}>();

type PoolRule = 'registered' | 'confirmed' | 'checked_in' | 'waitlisted';
const poolOptions: { value: PoolRule; label: string; shortLabel: string; hint: string }[] = [
  { value: 'registered', label: 'All Registered', shortLabel: 'All Registered', hint: 'Excludes declined and waitlisted guests' },
  { value: 'confirmed', label: 'Confirmed Only', shortLabel: 'Confirmed Only', hint: 'Guests marked as Confirmed' },
  { value: 'checked_in', label: 'At Venue', shortLabel: 'At Venue', hint: 'Checked in at the entrance door' },
  { value: 'waitlisted', label: 'Waitlist Release', shortLabel: 'Waitlist Release', hint: 'Move guests off waitlist & issue tickets' }
];

const poolRule = ref<PoolRule>('registered');
const excludePastWinners = ref(true);
const winnerCount = ref(1);
const drawn = ref<Submission[]>([]);
const isDrawing = ref(false);
const isSaving = ref(false);
const shuffleName = ref('');
const showInfo = ref(false);

const isStageModeOpen = ref(false);
const confettiCanvas = ref<HTMLCanvasElement | null>(null);
let confettiAnimId: number | null = null;

function openStageMode() {
  isStageModeOpen.value = true;
}

function closeStageMode() {
  isStageModeOpen.value = false;
  if (confettiAnimId) {
    cancelAnimationFrame(confettiAnimId);
    confettiAnimId = null;
  }
}

function triggerConfetti() {
  if (!confettiCanvas.value) return;
  const canvas = confettiCanvas.value;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const colors = ['#f59e0b', '#d97706', '#fbbf24', '#ffffff', '#10b981', '#3b82f6'];
  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    w: number;
    h: number;
    color: string;
    rotation: number;
    vrot: number;
  }> = [];

  for (let i = 0; i < 140; i++) {
    particles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 260,
      y: window.innerHeight / 2 - 120,
      vx: (Math.random() - 0.5) * 18,
      vy: Math.random() * -14 - 5,
      w: Math.random() * 8 + 6,
      h: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 12
    });
  }

  const startTime = Date.now();
  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const elapsed = Date.now() - startTime;
    let alive = 0;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.98; // drag
      p.rotation += p.vrot;

      if (p.y < canvas.height + 50) alive++;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (alive > 0 && elapsed < 4500) {
      confettiAnimId = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
  confettiAnimId = requestAnimationFrame(render);
}

function handleKeyDown(e: KeyboardEvent) {
  if (!isStageModeOpen.value) return;
  if (e.key === 'Escape') {
    closeStageMode();
  } else if (e.key === ' ' && !isDrawing.value && !drawn.value.length) {
    e.preventDefault();
    draw();
  }
}

const poolCounts = computed(() => {
  const base = props.rows.filter(s => !s.duplicate_of);
  return {
    registered: base.filter(s => {
      const st = normalizeStatus(s.status);
      return st !== 'declined' && st !== 'waitlisted' && (!excludePastWinners.value || st !== 'winner');
    }).length,
    confirmed: base.filter(s => {
      const st = normalizeStatus(s.status);
      return st === 'confirmed' || (!excludePastWinners.value && st === 'winner');
    }).length,
    checked_in: base.filter(s => Boolean(s.checked_in_at)).length,
    waitlisted: base.filter(s => normalizeStatus(s.status) === 'waitlisted').length,
  };
});

const eligible = computed(() =>
  props.rows.filter(s => {
    const status = normalizeStatus(s.status);
    // One chance per person: an entry flagged as a repeat registration does not enter twice.
    if (s.duplicate_of) return false;
    if (poolRule.value === 'waitlisted') return status === 'waitlisted';
    if (status === 'declined' || status === 'waitlisted') return false;
    if (excludePastWinners.value && status === 'winner') return false;
    if (poolRule.value === 'confirmed') return status === 'confirmed' || (!excludePastWinners.value && status === 'winner');
    if (poolRule.value === 'checked_in') return Boolean(s.checked_in_at);
    return true;
  })
);

const winners = computed(() => props.rows.filter(s => normalizeStatus(s.status) === 'winner'));

// A draw made against rules that have since changed is no longer valid.
watch([poolRule, excludePastWinners], () => (drawn.value = []));

let shuffleTimer: ReturnType<typeof setInterval> | null = null;

function draw() {
  const pool = eligible.value;
  if (!pool.length) return;
  const count = Math.min(Math.max(1, Math.floor(winnerCount.value || 1)), pool.length);
  winnerCount.value = count;
  drawn.value = [];
  isDrawing.value = true;

  // The shuffle on screen is theatre for the room; the result is decided by secureSample alone.
  shuffleTimer = setInterval(() => {
    shuffleName.value = guestName(pool[secureRandomInt(pool.length)]);
  }, 70);
  setTimeout(() => {
    if (shuffleTimer) clearInterval(shuffleTimer);
    shuffleTimer = null;
    drawn.value = secureSample(pool, count);
    isDrawing.value = false;
    if (isStageModeOpen.value) {
      setTimeout(() => triggerConfetti(), 80);
    }
  }, 1600);
}

const isWaitlistDraw = computed(() => poolRule.value === 'waitlisted');
const ticketSender = useTicketSender();
const prepStep = ref<{ done: number; total: number } | null>(null);

async function confirmWinners() {
  if (!drawn.value.length) return;
  isSaving.value = true;
  try {
    if (isWaitlistDraw.value) {
      await promoteFromWaitlist();
      return;
    }
    const updated = await bulkSetStatus(drawn.value.map(s => s.id), 'winner');
    emit('updated', updated);
    emit('toast', `${updated.length} winner${updated.length === 1 ? '' : 's'} saved.`);
    drawn.value = [];
  } catch (err: any) {
    emit('toast', `Couldn't save winners: ${err?.message || 'network error'}`);
  } finally {
    isSaving.value = false;
    prepStep.value = null;
  }
}

/**
 * Takes the drawn guests off the waitlist. Their ticket PDFs are made first (in this browser,
 * one by one) so the email that goes out the moment they get a place has the PDF attached;
 * the status change is what sends those emails.
 */
async function promoteFromWaitlist() {
  const guests = [...drawn.value];
  const prep = await ticketSender.storeTickets(guests, (done, total) => (prepStep.value = { done, total }));
  if (prep.cancelled) {
    emit('toast', 'Stopped. Nobody was moved off the waitlist.');
    return;
  }
  if (prep.failed.length) {
    const go = await glassConfirm({
      title: `${prep.failed.length} ticket${prep.failed.length === 1 ? '' : 's'} could not be prepared`,
      message: `Move all ${guests.length} guests off the waitlist anyway? Those ${prep.failed.length} get the email with their access code instead of the PDF attached.`,
      confirmLabel: 'Move them anyway'
    });
    if (!go) {
      emit('toast', 'Nobody was moved off the waitlist.');
      return;
    }
  }
  const updated = await bulkSetStatus(guests.map(s => s.id), 'confirmed');
  emit('updated', updated);
  emit('toast', `${updated.length} guest${updated.length === 1 ? '' : 's'} moved off the waitlist. Their ticket emails are going out now.`);
  drawn.value = [];
}

function exportWinners() {
  const rows = winners.value;
  const csv = buildCsv(rows, customFieldKeys(rows), () => props.exportName);
  downloadText(`${props.exportName}-winners.csv`, csv);
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (shuffleTimer) clearInterval(shuffleTimer);
  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
});
</script>

<style scoped>
.stage-fade-enter-active, .stage-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.stage-fade-enter-from, .stage-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
