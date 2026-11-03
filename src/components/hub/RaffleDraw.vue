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

          <!-- State 1: Shuffling live animation in Admin View -->
          <div v-if="isDrawing" class="flex-1 flex flex-col items-center justify-center py-10 gap-2.5">
            <div class="size-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-800 animate-pulse">
              <Sparkles class="w-5 h-5 animate-spin" />
            </div>
            <p class="text-[24px] font-medium tabular-nums tracking-tight text-black">{{ shuffleName }}</p>
            <p class="text-[11.5px] text-neutral-500 font-light">Cycling through {{ eligible.length }} verified entries…</p>
          </div>

          <!-- State 2: Winner(s) Drawn in Admin View -->
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
    <!-- CINEMATIC 3D FULL-SCREEN STAGE MODE (Apple Keynote Edition)    -->
    <!-- ============================================================== -->
    <Teleport to="body">
      <Transition name="stage-fade">
        <div
          v-if="isStageModeOpen"
          @mousemove="handleStageMouseMove"
          class="fixed inset-0 z-[120] bg-[#030305] text-white flex flex-col justify-between p-6 sm:p-10 font-sans font-light tracking-normal select-none overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <!-- 3D Hardware-Accelerated Interactive Canvas (Rotating Core / Warp Vortex / Platinum Foil) -->
          <canvas ref="stageCanvasRef" class="absolute inset-0 pointer-events-none z-10 size-full"></canvas>

          <!-- Top Stage Bar: Luxury Brandmark & Live Status -->
          <div class="relative z-30 flex items-center justify-between w-full border-b border-white/10 pb-4 backdrop-blur-sm">
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10.5px] font-medium bg-white/10 border border-white/15 text-white tracking-normal">
                <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE STAGE SELECTION
              </span>
              <span class="text-[13px] text-white/20 hidden sm:inline">|</span>
              <span class="text-[13px] text-white/70 font-medium truncate max-w-[360px] tracking-normal">
                {{ campaignTitle || exportName }}
              </span>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-[11.5px] text-white/40 tabular-nums hidden sm:inline">
                {{ eligible.length }} verified entries in pool
              </span>
              <button
                type="button"
                @click="closeStageMode"
                class="h-[32px] px-3.5 rounded-[8px] bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[11.5px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors apple-press"
                title="Exit Stage Mode (Esc)"
              >
                <Minimize2 class="w-3.5 h-3.5" />
                <span>Exit (Esc)</span>
              </button>
            </div>
          </div>

          <!-- Main Stage Centerpiece (With 3D Gyroscope Perspective) -->
          <div 
            class="relative z-30 flex-1 flex flex-col items-center justify-center text-center my-6 max-w-5xl mx-auto w-full"
            style="perspective: 1200px;"
          >
            
            <!-- ============================================================== -->
            <!-- STAGE STATE 1: SHUFFLE & WARP SPEED VORTEX                     -->
            <!-- ============================================================== -->
            <div v-if="isDrawing" class="flex flex-col items-center justify-center gap-6 animate-apple-pop">
              <!-- Radial Core Pulsing Aura -->
              <div class="relative flex items-center justify-center">
                <div class="size-28 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center animate-ping opacity-30 absolute pointer-events-none" />
                <div 
                  class="size-20 rounded-full border flex items-center justify-center transition-all duration-300"
                  :class="isSuspensePhase ? 'bg-white text-black border-white shadow-[0_0_60px_rgba(255,255,255,0.8)]' : 'bg-white/10 border-white/20 text-white shadow-[0_0_50px_rgba(255,255,255,0.2)]'"
                >
                  <Sparkles class="w-8 h-8 transition-transform duration-300" :class="isSuspensePhase ? 'scale-110' : 'animate-spin'" />
                </div>
              </div>

              <div class="flex flex-col items-center gap-3 max-w-2xl transition-all duration-300" :class="isSuspensePhase ? 'scale-[1.03]' : ''">
                <span 
                  class="px-3.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-normal transition-all duration-300"
                  :class="isSuspensePhase 
                    ? 'bg-white text-black border border-white shadow-[0_0_24px_rgba(255,255,255,0.6)] animate-pulse' 
                    : 'bg-white/10 border border-white/15 text-white/80'"
                >
                  {{ isSuspensePhase ? 'Locking Selection…' : 'Cryptographic Random Selection' }}
                </span>
                
                <!-- Huge Crisp SF Pro Cycling Typography (No monospace) -->
                <h1 
                  class="text-[44px] sm:text-[68px] md:text-[84px] font-medium tracking-tight text-white leading-none transition-all duration-200"
                  :class="isSuspensePhase ? 'drop-shadow-[0_0_60px_rgba(255,255,255,0.7)] scale-[1.02]' : 'drop-shadow-[0_12px_40px_rgba(255,255,255,0.4)]'"
                >
                  {{ shuffleName }}
                </h1>
                
                <p class="text-[13px] text-white/50 font-light mt-1">
                  {{ isSuspensePhase ? 'Verifying candidate cryptographic signature…' : `Sampling across ${eligible.length} verified candidates...` }}
                </p>
              </div>
            </div>

            <!-- ============================================================== -->
            <!-- STAGE STATE 2: WINNERS REVEALED (Interactive 3D Glass Pass)    -->
            <!-- ============================================================== -->
            <div v-else-if="drawn.length" class="flex flex-col items-center justify-center w-full gap-7 animate-apple-pop">
              <div class="flex flex-col items-center gap-2">
                <span class="px-3.5 py-1 rounded-full text-[11px] uppercase tracking-normal font-medium bg-white/15 text-white border border-white/25 shadow-sm">
                  Official Admission · Verified
                </span>
                <h2 class="text-[28px] sm:text-[38px] font-medium text-white tracking-tight">
                  Congratulations
                </h2>
              </div>

              <!-- SINGLE WINNER MONUMENTAL 3D CARD -->
              <div 
                v-if="drawn.length === 1" 
                class="w-full max-w-[540px] transition-transform duration-100 ease-out"
                :style="{
                  transform: `rotateX(${cardRotateX}deg) rotateY(${cardRotateY}deg)`,
                  transformStyle: 'preserve-3d'
                }"
              >
                <div class="relative p-8 sm:p-9 rounded-[26px] bg-gradient-to-b from-white/[0.14] via-white/[0.07] to-white/[0.04] backdrop-blur-2xl border border-white/25 shadow-[0_30px_90px_rgba(0,0,0,0.85)] flex flex-col items-center gap-6 overflow-hidden">
                  
                  <!-- Dynamic Specular Lighting Glare based on mouse tilt -->
                  <div 
                    class="absolute inset-0 pointer-events-none opacity-40 transition-opacity"
                    :style="{
                      background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.4) 0%, transparent 60%)`
                    }"
                  />

                  <!-- Card Header: Pass & Status -->
                  <div class="flex items-center justify-between w-full border-b border-white/10 pb-4 relative z-10">
                    <div class="flex items-center gap-2">
                      <span class="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span class="text-[12px] font-medium text-white tracking-normal uppercase">Winner Selected</span>
                    </div>
                    <span class="text-[11.5px] font-mono text-white/50">#1 OF 1</span>
                  </div>

                  <!-- Winner Name & Avatar Core -->
                  <div class="flex flex-col items-center text-center gap-3 relative z-10">
                    <div class="size-16 rounded-full bg-gradient-to-b from-white to-neutral-300 text-black font-medium text-[22px] flex items-center justify-center shadow-[0_8px_24px_rgba(255,255,255,0.3)]">
                      {{ initials(guestName(drawn[0])) }}
                    </div>

                    <h3 class="text-[32px] sm:text-[40px] font-medium text-white tracking-tight leading-tight drop-shadow-sm">
                      {{ guestName(drawn[0]) }}
                    </h3>

                    <p class="text-[13px] text-white/60 font-light">
                      {{ maskEmail(guestEmail(drawn[0])) || guestPhone(drawn[0]) || '—' }}
                    </p>
                  </div>

                  <!-- Ticket Specimen Capsule -->
                  <div class="w-full bg-white/5 border border-white/10 rounded-[14px] p-3.5 flex items-center justify-between text-[12px] relative z-10">
                    <div class="flex flex-col items-start">
                      <span class="text-[10px] text-white/40 uppercase tracking-normal">Access Code</span>
                      <span class="text-white font-mono font-medium tracking-wide mt-0.5">{{ accessId(drawn[0]) }}</span>
                    </div>

                    <div class="flex flex-col items-end">
                      <span class="text-[10px] text-white/40 uppercase tracking-normal">Venue Gate</span>
                      <span class="text-emerald-300 font-medium mt-0.5">Admit 1 Guest</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- MULTIPLE WINNERS 3D GRID -->
              <div 
                v-else
                class="w-full grid gap-4 max-h-[55vh] overflow-y-auto p-2"
                :class="drawn.length <= 4 ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl'"
              >
                <div
                  v-for="(s, idx) in drawn"
                  :key="s.id"
                  class="relative p-5 rounded-[20px] bg-gradient-to-b from-white/[0.12] to-white/[0.04] backdrop-blur-xl border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex items-center gap-4 text-left transition-all hover:bg-white/[0.16]"
                >
                  <div class="size-12 rounded-full bg-gradient-to-b from-white to-neutral-300 text-black font-medium text-[16px] flex items-center justify-center shrink-0 shadow-md">
                    {{ initials(guestName(s)) }}
                  </div>
                  <div class="flex flex-col min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="text-[10.5px] font-mono text-white/60 uppercase tracking-normal">Winner #{{ idx + 1 }}</span>
                      <span v-if="s.checked_in_at" class="text-[9.5px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-light">
                        At Venue
                      </span>
                    </div>
                    <h3 class="text-[18px] font-medium text-white truncate leading-snug">{{ guestName(s) }}</h3>
                    <p class="text-[11.5px] text-white/60 truncate font-light">{{ maskEmail(guestEmail(s)) || guestPhone(s) || '—' }}</p>
                    <p class="text-[10.5px] text-white/40 font-mono mt-0.5">ID: {{ accessId(s) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- ============================================================== -->
            <!-- STAGE STATE 3: READY / IDLE (Suspended 3D Architectural Core)  -->
            <!-- ============================================================== -->
            <div v-else class="flex flex-col items-center justify-center gap-6 animate-apple-pop">
              <!-- Architectural Monolith Glyph -->
              <div class="relative flex items-center justify-center">
                <div class="size-24 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner relative">
                  <div class="size-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
                    <Sparkles class="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div class="flex flex-col items-center gap-2.5 max-w-xl">
                <span class="px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-medium text-white/80 uppercase tracking-normal">
                  Live Stage Selection
                </span>

                <h1 class="text-[38px] sm:text-[54px] font-medium text-white tracking-tight leading-tight">
                  {{ isWaitlistDraw ? 'Waitlist Release' : 'Official Prize Draw' }}
                </h1>

                <p class="text-[14px] sm:text-[15px] text-white/60 font-light leading-relaxed max-w-[460px]">
                  Drawing <strong class="text-white font-medium">{{ winnerCount }}</strong> verified {{ isWaitlistDraw ? 'candidate' : 'winner' }}{{ winnerCount > 1 ? 's' : '' }} from a pool of <strong class="text-white font-medium">{{ eligible.length }}</strong> verified entries.
                </p>
              </div>

              <button
                type="button"
                :disabled="!eligible.length || isDrawing"
                @click="draw"
                class="apple-press h-[52px] px-9 rounded-[14px] bg-white text-black font-medium text-[15px] tracking-normal hover:bg-neutral-200 cursor-pointer shadow-[0_12px_40px_rgba(255,255,255,0.25)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2.5 mt-3"
              >
                <Shuffle class="w-4 h-4" />
                <span>Begin Live Selection</span>
              </button>
            </div>
          </div>

          <!-- Bottom Stage Controls & Shortcuts -->
          <div class="relative z-30 flex items-center justify-between w-full border-t border-white/10 pt-4 backdrop-blur-sm">
            <div class="flex items-center gap-2">
              <span class="text-[12px] text-white/40">Winners:</span>
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

            <!-- Action buttons in reveal state -->
            <div v-if="drawn.length && !isDrawing" class="flex items-center gap-3">
              <button
                type="button"
                :disabled="isSaving"
                @click="draw"
                class="h-[38px] px-4 rounded-[10px] bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[12.5px] font-medium flex items-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw class="w-3.5 h-3.5" /> <span>Re-roll</span>
              </button>
              <button
                type="button"
                :disabled="isSaving"
                @click="confirmWinners"
                class="apple-press h-[38px] px-5 rounded-[10px] bg-white text-black font-medium text-[12.5px] hover:bg-neutral-100 flex items-center gap-2 cursor-pointer shadow-[0_8px_24px_rgba(255,255,255,0.2)] transition-all"
              >
                <Check class="w-4 h-4" /> <span>{{ isSaving ? 'Saving…' : 'Confirm & Save' }}</span>
              </button>
            </div>
            
            <div v-else class="text-[12px] text-white/40 font-light">
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
  Sparkles, RotateCcw, Info 
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
const isSuspensePhase = ref(false);
const isSaving = ref(false);
const shuffleName = ref('');
const showInfo = ref(false);

const isStageModeOpen = ref(false);
const stageCanvasRef = ref<HTMLCanvasElement | null>(null);
let stageAnimId: number | null = null;

// Interactive 3D Perspective Tilt State
const mouseX = ref(0);
const mouseY = ref(0);
const cardRotateX = ref(0);
const cardRotateY = ref(0);
const glarePos = ref({ x: 50, y: 50 });

function handleStageMouseMove(e: MouseEvent) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const x = (e.clientX - w / 2) / (w / 2); // -1 to 1
  const y = (e.clientY - h / 2) / (h / 2); // -1 to 1
  mouseX.value = x;
  mouseY.value = y;
  cardRotateY.value = Number((x * 12).toFixed(2));
  cardRotateX.value = Number((-y * 12).toFixed(2));
  glarePos.value = {
    x: Math.round((e.clientX / w) * 100),
    y: Math.round((e.clientY / h) * 100),
  };
}

// 3D Particles Data Structures
interface SphereNode {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
}

interface WarpStream {
  x: number;
  y: number;
  z: number;
  pz: number;
  speed: number;
}

interface DustMote {
  x: number;
  y: number;
  z: number;
  size: number;
  alpha: number;
  vx: number;
  vy: number;
  phase: number;
  phaseSpeed: number;
}

let sphereNodes: SphereNode[] = [];
let warpStreams: WarpStream[] = [];
let dustMotes: DustMote[] = [];
let sphereAngleY = 0;
let sphereAngleX = 0;
let shockwaveRadius = 0;
let shockwaveAlpha = 0;
let flareAlpha = 0;
let spotlightAlpha = 0;

function initSphereNodes() {
  sphereNodes = [];
  const N = 110;
  const radius = 220;
  for (let i = 0; i < N; i++) {
    const phi = Math.acos(-1 + (2 * i) / N);
    const theta = Math.sqrt(N * Math.PI) * phi;
    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(phi);
    sphereNodes.push({ x, y, z, baseX: x, baseY: y, baseZ: z });
  }
}

function initWarpStreams() {
  warpStreams = [];
  const count = 160;
  for (let i = 0; i < count; i++) {
    warpStreams.push({
      x: (Math.random() - 0.5) * window.innerWidth * 1.5,
      y: (Math.random() - 0.5) * window.innerHeight * 1.5,
      z: Math.random() * 1200 + 100,
      pz: 1200,
      speed: Math.random() * 22 + 18,
    });
  }
}

function initDustMotes() {
  dustMotes = [];
  const count = 55;
  for (let i = 0; i < count; i++) {
    dustMotes.push({
      x: (Math.random() - 0.5) * 520,
      y: (Math.random() - 0.5) * window.innerHeight * 0.9,
      z: Math.random() * 400 - 100,
      size: Math.random() * 1.8 + 0.8,
      alpha: Math.random() * 0.45 + 0.15,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -0.25 - Math.random() * 0.35, // slow upward drift
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.02 + Math.random() * 0.025,
    });
  }
}

function triggerAmbientLightingFlash() {
  flareAlpha = 1.0;
  shockwaveRadius = 24;
  shockwaveAlpha = 0.9;
  spotlightAlpha = 1.0;
  initDustMotes();
}

function startStage3DEngine() {
  if (!stageCanvasRef.value) return;
  const canvas = stageCanvasRef.value;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  initSphereNodes();
  initWarpStreams();

  function render() {
    if (!ctx || !stageCanvasRef.value) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const fov = 600;

    ctx.clearRect(0, 0, w, h);

    // 1. Deep Obsidian Radial Ambient Spotlight Core
    const ambientGrad = ctx.createRadialGradient(cx, cy * 0.85, 20, cx, cy * 0.85, w * 0.65);
    ambientGrad.addColorStop(0, isDrawing.value ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)');
    ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = ambientGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. STATE A: SHUFFLE & WARP SPEED VORTEX
    if (isDrawing.value) {
      ctx.lineWidth = 1.5;
      for (const p of warpStreams) {
        p.pz = p.z;
        p.z -= p.speed;
        if (p.z <= 10) {
          p.z = 1200;
          p.pz = 1200;
          p.x = (Math.random() - 0.5) * w * 1.5;
          p.y = (Math.random() - 0.5) * h * 1.5;
        }

        const scale1 = fov / p.z;
        const x1 = cx + p.x * scale1;
        const y1 = cy + p.y * scale1;

        const scale2 = fov / p.pz;
        const x2 = cx + p.x * scale2;
        const y2 = cy + p.y * scale2;

        const alpha = Math.min(1, Math.max(0.05, (1200 - p.z) / 900));
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
    } 
    // 3. STATE B: WINNER REVEALED (Volumetric Spotlight, Anamorphic Flare, Shockwave, Shimmering Dust Motes)
    else if (drawn.value.length) {
      // (a) Volumetric Conical Spotlight from Stage Rig
      if (spotlightAlpha > 0.01) {
        const topW = 100;
        const bottomW = Math.min(w * 0.9, 820);
        const spotGrad = ctx.createLinearGradient(cx, 0, cx, h);
        spotGrad.addColorStop(0, `rgba(255, 255, 255, ${0.16 * spotlightAlpha})`);
        spotGrad.addColorStop(0.3, `rgba(255, 255, 255, ${0.08 * spotlightAlpha})`);
        spotGrad.addColorStop(0.7, `rgba(255, 255, 255, ${0.03 * spotlightAlpha})`);
        spotGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.moveTo(cx - topW / 2, 0);
        ctx.lineTo(cx + topW / 2, 0);
        ctx.lineTo(cx + bottomW / 2, h);
        ctx.lineTo(cx - bottomW / 2, h);
        ctx.closePath();
        ctx.fill();

        // Apex lens aperture flare
        const apexGlow = ctx.createRadialGradient(cx, 0, 0, cx, 0, 180);
        apexGlow.addColorStop(0, `rgba(255, 255, 255, ${0.28 * spotlightAlpha})`);
        apexGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = apexGlow;
        ctx.beginPath();
        ctx.arc(cx, 0, 180, 0, Math.PI * 2);
        ctx.fill();
      }

      // (b) Dual Optical Shockwave Hairline Rings
      if (shockwaveAlpha > 0.01) {
        ctx.beginPath();
        ctx.arc(cx, cy, shockwaveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${shockwaveAlpha * 0.75})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (shockwaveRadius > 40) {
          ctx.beginPath();
          ctx.arc(cx, cy, shockwaveRadius * 0.65, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${shockwaveAlpha * 0.4})`;
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }

        shockwaveRadius += (Math.max(w, h) * 0.75 - shockwaveRadius) * 0.08;
        shockwaveAlpha *= 0.94;
      }

      // (c) Horizontal Anamorphic Lens Flare Streak (ARRI Cinema style)
      if (flareAlpha > 0.01) {
        const flareW = Math.min(w * 0.95, 960);
        const streakGrad = ctx.createLinearGradient(cx - flareW / 2, cy, cx + flareW / 2, cy);
        streakGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        streakGrad.addColorStop(0.35, `rgba(255, 255, 255, ${0.35 * flareAlpha})`);
        streakGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.9 * flareAlpha})`);
        streakGrad.addColorStop(0.65, `rgba(255, 255, 255, ${0.35 * flareAlpha})`);
        streakGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = streakGrad;
        ctx.fillRect(cx - flareW / 2, cy - 1, flareW, 2);

        // Central Supernova Glare Core
        const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90);
        coreGlow.addColorStop(0, `rgba(255, 255, 255, ${0.8 * flareAlpha})`);
        coreGlow.addColorStop(0.5, `rgba(255, 255, 255, ${0.25 * flareAlpha})`);
        coreGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, 90, 0, Math.PI * 2);
        ctx.fill();

        flareAlpha *= 0.93; // Smooth exponential decay
      }

      // (d) Floating Atmospheric Dust Motes Shimmering in the Spotlight Beam
      for (const mote of dustMotes) {
        mote.x += mote.vx;
        mote.y += mote.vy;
        mote.phase += mote.phaseSpeed;
        if (mote.y < -h / 2) mote.y = h / 2;
        if (mote.x < -280) mote.x = 280;
        if (mote.x > 280) mote.x = -280;

        const shimmer = (Math.sin(mote.phase) + 1) / 2;
        const currentAlpha = mote.alpha * (0.35 + 0.65 * shimmer) * Math.min(1, spotlightAlpha);
        const px = cx + mote.x;
        const py = cy + mote.y;

        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(px, py, mote.size, 0, Math.PI * 2);
        ctx.fill();
      }
    } 
    // 4. STATE C: IDLE (Rotating 3D Architectural Particle Sphere)
    else {
      sphereAngleY += 0.005;
      sphereAngleX = mouseX.value * 0.3;

      const cosY = Math.cos(sphereAngleY);
      const sinY = Math.sin(sphereAngleY);
      const cosX = Math.cos(sphereAngleX);
      const sinX = Math.sin(sphereAngleX);

      const projected: Array<{ px: number; py: number; z: number; alpha: number }> = [];

      for (const n of sphereNodes) {
        const x1 = n.baseX * cosY - n.baseZ * sinY;
        const z1 = n.baseZ * cosY + n.baseX * sinY;
        const y1 = n.baseY * cosX - z1 * sinX;
        const z2 = z1 * cosX + n.baseY * sinX;

        const scale = fov / (fov + z2 + 260);
        const px = cx + x1 * scale;
        const py = cy + y1 * scale;
        const alpha = Math.max(0.08, (z2 + 220) / 440);

        projected.push({ px, py, z: z2, alpha });

        // Node dot
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.75})`;
        ctx.beginPath();
        ctx.arc(px, py, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Constellation hairlines between nearby nodes
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].px - projected[j].px;
          const dy = projected[i].py - projected[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 46) {
            const lineAlpha = (1 - dist / 46) * Math.min(projected[i].alpha, projected[j].alpha) * 0.3;
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            ctx.stroke();
          }
        }
      }
    }

    stageAnimId = requestAnimationFrame(render);
  }

  if (stageAnimId) cancelAnimationFrame(stageAnimId);
  stageAnimId = requestAnimationFrame(render);
}

function stopStage3DEngine() {
  if (stageAnimId) {
    cancelAnimationFrame(stageAnimId);
    stageAnimId = null;
  }
}

function openStageMode() {
  isStageModeOpen.value = true;
  setTimeout(() => startStage3DEngine(), 60);
}

function closeStageMode() {
  isStageModeOpen.value = false;
  stopStage3DEngine();
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

watch([poolRule, excludePastWinners], () => (drawn.value = []));

let drawTimeout: ReturnType<typeof setTimeout> | null = null;

function draw() {
  const pool = eligible.value;
  if (!pool.length) return;
  const count = Math.min(Math.max(1, Math.floor(winnerCount.value || 1)), pool.length);
  winnerCount.value = count;
  drawn.value = [];
  isDrawing.value = true;
  isSuspensePhase.value = false;

  // Pre-sample the exact winners via CSPRNG rejection sampling / Fisher-Yates
  const selectedWinners = secureSample(pool, count);
  const targetWinner = selectedWinners[0];

  const startTime = performance.now();
  const DURATION_MS = 4500;
  const DECEL_START_MS = 2400;
  const SUSPENSE_START_MS = 3800;

  if (drawTimeout) clearTimeout(drawTimeout);

  function tick() {
    const elapsed = performance.now() - startTime;

    if (elapsed >= DURATION_MS) {
      drawn.value = selectedWinners;
      isDrawing.value = false;
      isSuspensePhase.value = false;
      drawTimeout = null;
      if (isStageModeOpen.value) {
        setTimeout(() => triggerAmbientLightingFlash(), 30);
      }
      return;
    }

    if (elapsed >= SUSPENSE_START_MS) {
      isSuspensePhase.value = true;
      shuffleName.value = guestName(targetWinner);
      const remaining = DURATION_MS - elapsed;
      drawTimeout = setTimeout(tick, Math.max(40, remaining));
      return;
    }

    shuffleName.value = guestName(pool[secureRandomInt(pool.length)]);

    let nextDelay = 60;
    if (elapsed > DECEL_START_MS) {
      const progress = (elapsed - DECEL_START_MS) / (SUSPENSE_START_MS - DECEL_START_MS);
      nextDelay = Math.round(60 + Math.pow(progress, 2.2) * 360);
    }

    drawTimeout = setTimeout(tick, nextDelay);
  }

  tick();
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

function handleResize() {
  if (isStageModeOpen.value && stageCanvasRef.value) {
    stageCanvasRef.value.width = window.innerWidth;
    stageCanvasRef.value.height = window.innerHeight;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('resize', handleResize);
  if (drawTimeout) clearTimeout(drawTimeout);
  stopStage3DEngine();
});
</script>

<style scoped>
.stage-fade-enter-active, .stage-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.stage-fade-enter-from, .stage-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
