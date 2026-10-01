<template>
  <!-- Guest E-Pass Setup Sidebar Menu (Figma Node 222:4188) -->
  <aside 
    v-if="isOpen && currentWidget"
    ref="sidebarRef"
    @click.stop
    @wheel.stop
    class="absolute right-[24px] top-1/2 -translate-y-1/2 w-[464px] h-auto max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.92)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[24px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all animate-apple-slide-right-center no-scrollbar"
    data-node-id="222:4188"
    data-name="Guest E-Pass Setup Sidebar"
  >
    <!-- Header -->
    <div class="content-stretch flex flex-col items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <div class="flex items-center gap-2">
          <Ticket class="size-4 text-black" />
          <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap">
            Guest E-Pass Setup
          </p>
        </div>
        <button 
          @click="$emit('close')"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer hover:bg-neutral-200/60 transition-colors"
          title="Close"
        >
          <img :src="FIGMA_ASSETS.closeIcon" class="w-3.5 h-3.5" alt="Close" />
        </button>
      </div>
      <p class="font-707 text-[12px] text-neutral-500 mt-1">
        Configure QR code visibility, headline, venue location, action button, troubleshoot notice, and entry rules.
      </p>
    </div>

    <!-- Section 0: Brand Logo (Inherited from Hero Banner) -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="flex flex-col gap-[6px] w-full">
        <div class="flex items-center justify-between">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Brand Logo
          </p>
          <span class="font-707 text-[11px] text-neutral-400">
            {{ projectBrandLogoUrl ? 'Active from Hero Banner' : 'Not configured' }}
          </span>
        </div>
        <div v-if="projectBrandLogoUrl" class="border-[0.5px] border-neutral-200 p-3 rounded-[8px] bg-neutral-50 flex items-center justify-between">
          <img :src="projectBrandLogoUrl" alt="Brand Logo" class="max-h-[32px] h-[24px] w-auto object-contain" />
          <span class="font-707 text-[11px] text-emerald-600 font-medium">● Visible on Summary</span>
        </div>
        <p v-else class="font-707 text-[11px] text-neutral-400 leading-normal">
          Upload a brand logo in your Hero Banner setup to automatically display it at the top of this summary ticket.
        </p>
      </div>
    </div>

    <!-- Section 1: Global QR Function On/Off Toggle -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            QR Code Function
          </p>
          <p class="font-707 text-[11px] text-neutral-500">
            {{ showQrCode ? 'Enabled: Positioned above pass information fields' : 'Disabled: Clean non-QR ticket summary' }}
          </p>
        </div>

        <!-- Modern Elegant Apple Style Toggle Switch -->
        <button
          type="button"
          role="switch"
          :aria-checked="showQrCode"
          @click="toggleQrCode"
          class="relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
          :class="showQrCode ? 'bg-black' : 'bg-[#e5e5ea]'"
          title="Toggle QR Code"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
            :class="showQrCode ? 'translate-x-[18px]' : 'translate-x-0'"
          />
        </button>
      </div>
    </div>

    <!-- Section 2: Pass Headline & Event Venue Setup -->
    <div class="content-stretch flex flex-col gap-[16px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Pass Information & Headline
        </p>
      </div>

      <!-- Headline (Responsive Multiline) -->
      <div class="flex flex-col gap-[6px] w-full">
        <div class="flex items-center justify-between">
          <p class="font-707 font-medium text-[12px] leading-[16px] text-neutral-700">
            Headline Text (H2)
          </p>
          <span class="text-[10px] font-707 text-neutral-400">Multiline auto-wrap</span>
        </div>
        <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex min-h-[68px] p-[10px] rounded-[8px] w-full bg-white transition-colors">
          <textarea 
            v-model="heading"
            rows="3"
            placeholder="SUCCESS.&#10;YOUR PASS HAS&#10;BEEN SENT."
            class="w-full text-[12px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase tracking-tight resize-y leading-[18px]"
          />
        </div>
      </div>

      <!-- Event Venue -->
      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 font-medium text-[12px] leading-[16px] text-neutral-700">
          Event Venue Location
        </p>
        <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="venue"
            placeholder="e.g. PLAZA SENAYAN 4th FLOOR"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase tracking-tight"
          />
        </div>
      </div>

      <!-- Dynamic Info Notice -->
      <div class="bg-neutral-50 border border-neutral-200 p-3 rounded-[8px] w-full flex items-start gap-2">
        <div class="size-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
        <p class="font-707 text-[11px] leading-[16px] text-neutral-600">
          Guest Name, Email, and Guest Type are dynamically populated from your form registration data. Access ID is generated automatically by the system.
        </p>
      </div>
    </div>

    <!-- Section 3: Action Button Function (Sticky Bottom Only) -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <!-- Title row with Apple Style Toggle Switch -->
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Add Action Button
          </p>
          <p class="font-707 text-[11px] text-neutral-500">
            Sticky bottom viewport button
          </p>
        </div>

        <!-- Modern Elegant Apple Style Toggle Switch -->
        <button
          type="button"
          role="switch"
          :aria-checked="isCtaEnabled"
          @click="toggleCta"
          class="relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
          :class="isCtaEnabled ? 'bg-black' : 'bg-[#e5e5ea]'"
          title="Toggle Action Button"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
            :class="isCtaEnabled ? 'translate-x-[18px]' : 'translate-x-0'"
          />
        </button>
      </div>

      <!-- Action Button Settings (Appears only when toggle is on) -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform opacity-0 -translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 -translate-y-2"
      >
        <div v-if="isCtaEnabled" class="flex flex-col gap-[12px] w-full pt-1">
          <!-- Button Text Input -->
          <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
            <input 
              v-model="buttonText"
              placeholder="Button Text (e.g. DOWNLOAD E-PASS)"
              class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase"
            />
          </div>

          <!-- Button Style Preset (Primary Black vs Primary White) -->
          <div class="content-stretch flex flex-col gap-[10px] items-start w-full pt-1">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
              Button Style Preset
            </p>
            <div class="flex gap-[8px] items-center w-full">
              <button 
                type="button"
                @click="setButtonVariant('black')"
                :class="buttonVariant === 'black' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                class="flex-1 whitespace-nowrap content-stretch flex h-[36px] items-center justify-center px-[16px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
              >
                Primary Black
              </button>
              <button 
                type="button"
                @click="setButtonVariant('white')"
                :class="buttonVariant === 'white' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                class="flex-1 whitespace-nowrap content-stretch flex h-[36px] items-center justify-center px-[16px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
              >
                Primary White
              </button>
            </div>
          </div>

          <!-- Position Indicator: Sticky Bottom Only -->
          <div class="flex items-center justify-between w-full pt-1">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
              Position
            </p>
            <span class="font-707 text-[11px] text-neutral-600 bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-[6px]">
              Sticky Bottom Only
            </span>
          </div>

          <!-- Link to Dropdown -->
          <div class="content-stretch flex items-center justify-between w-full pt-1 relative">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black whitespace-nowrap">
              Link to
            </p>
            <div class="relative">
              <button
                type="button"
                @click="isLinkToDropdownOpen = !isLinkToDropdownOpen"
                class="apple-glass-btn flex h-[38px] items-center justify-between px-[14px] py-[6px] rounded-[8px] w-[240px] cursor-pointer text-left"
              >
                <span class="font-707 text-[13px] text-black truncate">{{ selectedActionLabel }}</span>
                <ChevronDown 
                  class="size-[15px] text-black transition-transform duration-200 shrink-0 ml-1" 
                  :class="isLinkToDropdownOpen ? 'rotate-180' : ''"
                />
              </button>

              <!-- Dropdown Menu -->
              <div 
                v-if="isLinkToDropdownOpen" 
                class="absolute right-0 top-[44px] w-[240px] bg-white/95 backdrop-blur-xl border border-black/10 rounded-[8px] shadow-lg py-1 z-30 flex flex-col"
              >
                <button
                  v-for="opt in linkToOptions"
                  :key="opt.value"
                  type="button"
                  @click="selectLinkTo(opt.value)"
                  class="flex items-center justify-between px-[14px] py-[8px] text-left hover:bg-black/5 transition-colors cursor-pointer"
                  :class="ctaActionType === opt.value ? 'font-medium text-black bg-black/5' : 'text-neutral-700'"
                >
                  <span class="font-707 text-[13px]">{{ opt.label }}</span>
                  <Check v-if="ctaActionType === opt.value" class="size-[15px] text-black" />
                </button>
              </div>
            </div>
          </div>

          <!-- Conditional URL Input if External URL selected -->
          <div v-if="ctaActionType === 'link'" class="w-full pt-1 animate-in fade-in duration-150">
            <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
              <input 
                v-model="ctaUrl" 
                placeholder="https://..." 
                class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 font-mono"
              />
            </div>
          </div>

          <!-- Conditional Modal Setup Button if Popup Modal selected -->
          <div v-if="ctaActionType === 'modal'" class="w-full pt-1 animate-in fade-in duration-150">
            <button 
              type="button"
              @click="openModalSetup"
              class="apple-glass-btn-dark w-full h-[38px] rounded-[8px] flex items-center justify-between px-3.5 font-707 font-medium text-[12px] cursor-pointer transition-all shadow-sm"
            >
              <span class="flex items-center gap-2">
                <SlidersHorizontal class="size-3.5" />
                <span>Configure Pop Up Modal</span>
              </span>
              <ArrowRight class="size-3.5 opacity-80" />
            </button>
          </div>

          <!-- Add Icon Toggle -->
          <div class="content-stretch flex flex-col gap-[10px] items-start w-full pt-2 border-t border-[#f0f0f0]">
            <div class="flex items-center justify-between w-full">
              <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
                Add Icon
              </p>
              <button
                type="button"
                role="switch"
                :aria-checked="showIcon"
                @click="toggleIcon"
                class="relative inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
                :class="showIcon ? 'bg-black' : 'bg-[#e5e5ea]'"
                title="Toggle Button Icon"
              >
                <span
                  aria-hidden="true"
                  class="pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
                  :class="showIcon ? 'translate-x-[16px]' : 'translate-x-0'"
                />
              </button>
            </div>

            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform opacity-0 -translate-y-2"
              enter-to-class="transform opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="transform opacity-100 translate-y-0"
              leave-to-class="transform opacity-0 -translate-y-2"
            >
              <div v-if="showIcon" class="flex flex-nowrap overflow-x-auto gap-[8px] items-center -mx-[24px] px-[24px] w-[calc(100%+48px)] pt-1 no-scrollbar">
                <button 
                  type="button"
                  @click="setIconName('ticket')"
                  :class="iconName === 'ticket' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                  class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[6px] rounded-[8px] text-[11px] font-707 cursor-pointer"
                >
                  <Ticket class="size-3.5" /> Pass
                </button>
                <button 
                  type="button"
                  @click="setIconName('arrow-right')"
                  :class="iconName === 'arrow-right' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                  class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[6px] rounded-[8px] text-[11px] font-707 cursor-pointer"
                >
                  <ArrowRight class="size-3.5" /> Arrow
                </button>
                <button 
                  type="button"
                  @click="setIconName('grid')"
                  :class="iconName === 'grid' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                  class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[6px] rounded-[8px] text-[11px] font-707 cursor-pointer"
                >
                  <LayoutGrid class="size-3.5" /> Grid
                </button>
                <button 
                  type="button"
                  @click="setIconName('whatsapp')"
                  :class="iconName === 'whatsapp' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                  class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[6px] rounded-[8px] text-[11px] font-707 cursor-pointer"
                >
                  <Phone class="size-3.5" /> WhatsApp
                </button>
                <button 
                  type="button"
                  @click="setIconName('instagram')"
                  :class="iconName === 'instagram' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                  class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[6px] rounded-[8px] text-[11px] font-707 cursor-pointer"
                >
                  <Instagram class="size-3.5" /> Instagram
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Section 4: Troubleshoot / Disclaimer Notice Section -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Troubleshoot & Help Notice
          </p>
          <p class="font-707 text-[11px] text-neutral-500">
            {{ showFooterNotice ? 'Visible under valid sessions list' : 'Hidden from ticket' }}
          </p>
        </div>

        <!-- Modern Elegant Apple Style Toggle Switch -->
        <button
          type="button"
          role="switch"
          :aria-checked="showFooterNotice"
          @click="toggleFooterNotice"
          class="relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
          :class="showFooterNotice ? 'bg-black' : 'bg-[#e5e5ea]'"
          title="Toggle Help Notice"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
            :class="showFooterNotice ? 'translate-x-[18px]' : 'translate-x-0'"
          />
        </button>
      </div>

      <!-- Troubleshoot Notice Inputs (Visible only when toggle is on) -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform opacity-0 -translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 -translate-y-2"
      >
        <div v-if="showFooterNotice" class="flex flex-col gap-[10px] w-full pt-1">
          <div class="flex flex-col gap-1 w-full">
            <span class="font-707 text-[11px] font-medium text-neutral-600">Notice Title</span>
            <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[34px] items-center px-[12px] rounded-[6px] w-full bg-white transition-colors">
              <input 
                v-model="footerNoticeTitle"
                placeholder="DIDN'T RECEIVE THE EMAIL?"
                class="w-full text-[12px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase"
              />
            </div>
          </div>
          <div class="flex flex-col gap-1 w-full">
            <span class="font-707 text-[11px] font-medium text-neutral-600">Notice Message & Link</span>
            <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[34px] items-center px-[12px] rounded-[6px] w-full bg-white transition-colors">
              <input 
                v-model="footerNoticeText"
                placeholder="Check your spam folder or contact support"
                class="w-full text-[12px] font-707 text-black focus:outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Section 5: Terms & Conditions / Legal Rules -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full">
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Terms & Conditions / Rules
          </p>
          <p class="font-707 text-[11px] text-neutral-500">
            {{ showTerms ? 'Enabled on ticket summary' : 'Disabled by default' }}
          </p>
        </div>

        <!-- Modern Elegant Apple Style Toggle Switch -->
        <button
          type="button"
          role="switch"
          :aria-checked="showTerms"
          @click="toggleTerms"
          class="relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
          :class="showTerms ? 'bg-black' : 'bg-[#e5e5ea]'"
          title="Toggle Terms & Conditions"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
            :class="showTerms ? 'translate-x-[18px]' : 'translate-x-0'"
          />
        </button>
      </div>

      <!-- Terms List (Visible only when toggle is on) -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform opacity-0 -translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 -translate-y-2"
      >
        <div v-if="showTerms" class="flex flex-col gap-[12px] w-full pt-1">
          <div class="flex flex-col gap-1 w-full">
            <span class="font-707 text-[11px] font-medium text-neutral-600">Section Title</span>
            <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[34px] items-center px-[12px] rounded-[6px] w-full bg-white transition-colors">
              <input 
                v-model="termsTitle"
                placeholder="TERMS & CONDITIONS:"
                class="w-full text-[12px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase"
              />
            </div>
          </div>

          <div class="flex items-center justify-between w-full pt-1">
            <span class="font-707 text-[12px] font-medium text-neutral-700">Rules List</span>
            <button 
              type="button"
              @click="addTermRule"
              class="apple-glass-btn text-[11px] font-707 px-2.5 py-1 rounded-[6px] flex items-center gap-1 cursor-pointer"
            >
              <Plus class="size-3" />
              <span>Add Rule</span>
            </button>
          </div>

          <div class="flex flex-col gap-2 w-full">
            <div 
              v-for="(term, tIdx) in termsList" 
              :key="tIdx"
              class="flex items-center gap-2 w-full"
            >
              <div class="size-1.5 rounded-full bg-black shrink-0" />
              <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[34px] items-center px-[10px] rounded-[6px] w-full bg-white transition-colors">
                <input 
                  v-model="termsList[tIdx]"
                  placeholder="Enter rule text"
                  class="w-full text-[12px] font-707 text-black focus:outline-none placeholder:text-neutral-400"
                />
              </div>
              <button 
                type="button"
                v-if="termsList.length > 1"
                @click="removeTermRule(tIdx)"
                class="size-6 rounded flex items-center justify-center text-neutral-400 hover:text-red-600 cursor-pointer shrink-0"
                title="Remove Rule"
              >
                <Trash2 class="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import { 
  Ticket, 
  Plus, 
  Trash2, 
  ChevronDown, 
  Check, 
  ArrowRight, 
  SlidersHorizontal,
  LayoutGrid, 
  Phone, 
  Instagram 
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const editorStore = useEditorStore();
const sidebarRef = ref<HTMLElement | null>(null);

const currentWidget = computed(() => {
  const selected = editorStore.currentPage.widget_tree.find(w => w.id === editorStore.selectedWidgetId);
  if (selected && selected.type === 'GuestEPass') return selected;
  return editorStore.currentPage.widget_tree.find(w => w.type === 'GuestEPass') || null;
});

// 1. QR Code Toggle
const showQrCode = computed({
  get: () => currentWidget.value?.props?.showQrCode ?? true,
  set: (val: boolean) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { showQrCode: val });
    }
  }
});

function toggleQrCode() {
  showQrCode.value = !showQrCode.value;
}

// 2. Headline & Venue Metadata
const heading = computed({
  get: () => currentWidget.value?.props?.heading ?? 'SUCCESS.\nYOUR PASS HAS\nBEEN SENT.',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { heading: val });
    }
  }
});

const venue = computed({
  get: () => currentWidget.value?.props?.venue || '',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { venue: val });
    }
  }
});

// 3. Sticky Action Button Configuration
const isCtaEnabled = computed({
  get: () => currentWidget.value?.props?.isCtaEnabled ?? (!!currentWidget.value?.props?.buttonText || !!currentWidget.value?.props?.showButton || !!currentWidget.value?.props?.showStickyButton),
  set: (val: boolean) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, {
        isCtaEnabled: val,
        showButton: val,
        showStickyButton: val,
        positionMode: 'sticky-bottom',
        ctaPositionMode: 'sticky-bottom',
        buttonText: val ? (currentWidget.value.props?.buttonText || 'DOWNLOAD E-PASS') : '',
        ctaLabel: val ? (currentWidget.value.props?.ctaLabel || 'DOWNLOAD E-PASS') : ''
      });
    }
  }
});

function toggleCta() {
  isCtaEnabled.value = !isCtaEnabled.value;
}

const buttonText = computed({
  get: () => currentWidget.value?.props?.buttonText || currentWidget.value?.props?.ctaLabel || 'DOWNLOAD E-PASS',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, {
        buttonText: val,
        ctaLabel: val
      });
    }
  }
});

const buttonVariant = computed({
  get: () => currentWidget.value?.props?.variant || currentWidget.value?.props?.buttonVariant || 'black',
  set: (val: 'black' | 'white') => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, {
        variant: val,
        buttonVariant: val
      });
    }
  }
});

function setButtonVariant(variant: 'black' | 'white') {
  buttonVariant.value = variant;
}

const isLinkToDropdownOpen = ref(false);

const linkToOptions = [
  { label: 'Download E-Pass', value: 'download-pass' },
  { label: 'Next Page', value: 'next_page' },
  { label: 'Submit Form', value: 'submit' },
  { label: 'External URL', value: 'link' },
  { label: 'Popup Modal', value: 'modal' },
  { label: 'Scroll to Section', value: 'scroll' }
] as const;

const ctaActionType = computed({
  get: () => currentWidget.value?.props?.actionType || 'download-pass',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { actionType: val });
    }
  }
});

const selectedActionLabel = computed(() => {
  const opt = linkToOptions.find(o => o.value === ctaActionType.value);
  return opt ? opt.label : 'Download E-Pass';
});

function selectLinkTo(val: string) {
  ctaActionType.value = val;
  isLinkToDropdownOpen.value = false;
  if (val === 'modal' && currentWidget.value) {
    if (!currentWidget.value.props.modalProps) {
      editorStore.updateWidgetProps(currentWidget.value.id, {
        modalProps: {
          variant: 'message-alert',
          title: 'Your Pass Has Been Sent',
          subtitle: 'Please check your email inbox to view your pass.',
          buttonText: 'Done',
          buttonVariant: 'black'
        }
      });
    }
    editorStore.openModalSidebar();
  }
}

const ctaUrl = computed({
  get: () => currentWidget.value?.props?.url || '',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { url: val });
    }
  }
});

function openModalSetup() {
  if (currentWidget.value) {
    if (!currentWidget.value.props.modalProps) {
      editorStore.updateWidgetProps(currentWidget.value.id, {
        modalProps: {
          variant: 'message-alert',
          title: 'Your Pass Has Been Sent',
          subtitle: 'Please check your email inbox to view your pass.',
          buttonText: 'Done',
          buttonVariant: 'black'
        }
      });
    }
    editorStore.openModalSidebar();
  }
}

const showIcon = computed({
  get: () => currentWidget.value?.props?.showIcon ?? false,
  set: (val: boolean) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { showIcon: val });
    }
  }
});

function toggleIcon() {
  showIcon.value = !showIcon.value;
}

const iconName = computed({
  get: () => currentWidget.value?.props?.iconName || 'ticket',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { iconName: val, showIcon: true });
    }
  }
});

function setIconName(name: string) {
  iconName.value = name;
}

// 4. Troubleshoot & Help Notice Toggle
const showFooterNotice = computed({
  get: () => currentWidget.value?.props?.showFooterNotice ?? true,
  set: (val: boolean) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { showFooterNotice: val });
    }
  }
});

function toggleFooterNotice() {
  showFooterNotice.value = !showFooterNotice.value;
}

const footerNoticeTitle = computed({
  get: () => currentWidget.value?.props?.footerNoticeTitle ?? "DIDN'T RECEIVE THE EMAIL?",
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { footerNoticeTitle: val });
    }
  }
});

const footerNoticeText = computed({
  get: () => currentWidget.value?.props?.footerNoticeText ?? "Check your spam folder or contact support",
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { footerNoticeText: val });
    }
  }
});

// 5. Terms & Conditions / Legal Rules Toggle & List
const showTerms = computed({
  get: () => currentWidget.value?.props?.showTerms ?? false,
  set: (val: boolean) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { showTerms: val });
    }
  }
});

function toggleTerms() {
  showTerms.value = !showTerms.value;
}

const termsTitle = computed({
  get: () => currentWidget.value?.props?.termsTitle || 'TERMS & CONDITIONS:',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { termsTitle: val });
    }
  }
});

const termsList = computed({
  get: () => currentWidget.value?.props?.terms || [
    '[ENTRY CONDITION OR LEGAL RULE 1]',
    '[ENTRY CONDITION OR LEGAL RULE 2]',
    '[ENTRY CONDITION OR LEGAL RULE 3]'
  ],
  set: (val: string[]) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { terms: val });
    }
  }
});

function addTermRule() {
  const current = [...termsList.value];
  const nextNum = current.length + 1;
  current.push(`[ENTRY CONDITION OR LEGAL RULE ${nextNum}]`);
  termsList.value = current;
}

function removeTermRule(index: number) {
  const current = [...termsList.value];
  current.splice(index, 1);
  termsList.value = current;
}

const projectBrandLogoUrl = computed(() => {
  for (const page of editorStore.pages) {
    for (const w of page.widget_tree) {
      if (w.type === 'HeroDrop' && w.props?.brandLogoUrl) {
        return w.props.brandLogoUrl;
      }
    }
  }
  return '';
});
</script>
