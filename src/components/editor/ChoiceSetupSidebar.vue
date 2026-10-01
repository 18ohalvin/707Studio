<template>
  <!-- Choice Setup Sidebar Drawer (Matching 707 Global UI Style & Apple Glass Standards) -->
  <aside 
    v-if="isOpen && currentWidget"
    ref="sidebarRef"
    @click.stop
    @wheel.stop
    class="absolute right-[24px] top-1/2 -translate-y-1/2 w-[464px] h-auto max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.92)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[24px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all animate-apple-slide-right-center no-scrollbar"
    data-node-id="276:4224"
    data-name="Choice Setup Sidebar"
  >
    <!-- Widget Container & Header -->
    <div class="content-stretch flex flex-col items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap">
          Choice Setup
        </p>
        <button 
          @click="$emit('close')"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer hover:bg-neutral-200/60 transition-colors"
        >
          <img :src="FIGMA_ASSETS.closeIcon" class="w-3.5 h-3.5" alt="Close" />
        </button>
      </div>
    </div>

    <!-- Section 1: Title & Subtitle Input (Figma Node 276:4224) -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full">
      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Widget Title
        </p>
        <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="title"
            placeholder="e.g. SELECT ARRIVALS"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase tracking-tight"
          />
        </div>
      </div>

      <!-- Title Typography Preset Dropdown -->
      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Title Font Style
        </p>
        <div class="relative w-full" ref="titleDropdownRef">
          <button 
            type="button"
            @click="isTitleDropdownOpen = !isTitleDropdownOpen"
            class="apple-glass-btn flex h-[38px] items-center justify-between px-[14px] py-[6px] rounded-[8px] w-full cursor-pointer bg-white"
          >
            <span class="font-707 font-normal text-[12px] leading-[18px] text-black whitespace-nowrap truncate">
              {{ currentTitleTypographyLabel }}
            </span>
            <ChevronDown 
              class="w-4 h-4 text-black transition-transform duration-150 shrink-0 ml-2" 
              :class="isTitleDropdownOpen ? 'rotate-180' : ''" 
            />
          </button>

          <!-- Dropdown Options Menu -->
          <div 
            v-if="isTitleDropdownOpen"
            class="absolute top-full left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-xl border border-black/10 rounded-[8px] shadow-[0px_4px_20px_rgba(0,0,0,0.12)] z-50 overflow-y-auto max-h-[220px] py-1 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <button 
              v-for="opt in typographyOptions"
              :key="opt.id"
              @click="selectTitleTypography(opt.id)"
              :class="currentTitleTypographyId === opt.id ? 'bg-black/5 font-medium text-black' : 'text-neutral-700 hover:bg-black/5'"
              class="w-full text-left px-4 py-2 text-[12px] font-707 flex items-center justify-between transition-colors cursor-pointer border-b border-neutral-100 last:border-b-0"
            >
              <div class="flex flex-col">
                <span :class="opt.previewClass">{{ opt.label }}</span>
                <span class="text-[10px] text-neutral-400 font-normal">{{ opt.desc }}</span>
              </div>
              <span class="text-[11px] text-neutral-400 font-mono shrink-0 ml-2">{{ opt.size }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Subtitle (Uses Body Text style 12px) -->
      <div class="flex flex-col gap-[6px] w-full">
        <div class="flex items-center justify-between">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Subtitle Text
          </p>
          <span class="font-707 text-[11px] text-neutral-400">
            Body Text (12px)
          </span>
        </div>
        <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="subtitle"
            placeholder="e.g. Choose your preferred attendance day below."
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>
    </div>

    <!-- Section 2: Option Tile Font Style Preset -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Option Tile Font Style
        </p>
        <div class="relative w-full" ref="optionDropdownRef">
          <button 
            type="button"
            @click="isOptionDropdownOpen = !isOptionDropdownOpen"
            class="apple-glass-btn flex h-[38px] items-center justify-between px-[14px] py-[6px] rounded-[8px] w-full cursor-pointer bg-white"
          >
            <span class="font-707 font-normal text-[12px] leading-[18px] text-black whitespace-nowrap truncate">
              {{ currentOptionTypographyLabel }}
            </span>
            <ChevronDown 
              class="w-4 h-4 text-black transition-transform duration-150 shrink-0 ml-2" 
              :class="isOptionDropdownOpen ? 'rotate-180' : ''" 
            />
          </button>

          <!-- Dropdown Options Menu -->
          <div 
            v-if="isOptionDropdownOpen"
            class="absolute top-full left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-xl border border-black/10 rounded-[8px] shadow-[0px_4px_20px_rgba(0,0,0,0.12)] z-50 overflow-y-auto max-h-[220px] py-1 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <button 
              v-for="opt in typographyOptions"
              :key="opt.id"
              @click="selectOptionTypography(opt.id)"
              :class="currentOptionTypographyId === opt.id ? 'bg-black/5 font-medium text-black' : 'text-neutral-700 hover:bg-black/5'"
              class="w-full text-left px-4 py-2 text-[12px] font-707 flex items-center justify-between transition-colors cursor-pointer border-b border-neutral-100 last:border-b-0"
            >
              <div class="flex flex-col">
                <span :class="opt.previewClass">{{ opt.label }}</span>
                <span class="text-[10px] text-neutral-400 font-normal">{{ opt.desc }}</span>
              </div>
              <span class="text-[11px] text-neutral-400 font-mono shrink-0 ml-2">{{ opt.size }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Style Presets (4 Figma Variants with Minimal Icons) -->
    <div class="content-stretch flex flex-col gap-[12px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
        Choice Style Variant
      </p>
      <div class="grid grid-cols-4 gap-[8px] w-full pt-1">
        <button 
          v-for="v in variants" 
          :key="v.id"
          type="button"
          @click="setVariant(v.id)"
          class="flex flex-col gap-[6px] items-center p-2 rounded-[8px] border transition-all cursor-pointer group"
          :class="variant === v.id ? 'bg-black text-white border-black shadow-sm ring-1 ring-black' : 'bg-white hover:bg-neutral-50 text-black border-[#d9d9d9]'"
        >
          <div 
            class="size-[36px] rounded-full flex items-center justify-center transition-all duration-150 shadow-sm shrink-0"
            :class="variant === v.id ? 'bg-white text-black' : 'bg-[#f5f5f5] group-hover:bg-black group-hover:text-white text-black border border-[#d9d9d9]'"
          >
            <component :is="v.icon" class="size-4 stroke-[1.75]" />
          </div>
          <span 
            class="font-707 text-[10px] leading-tight text-center truncate w-full"
            :class="variant === v.id ? 'font-medium text-white' : 'font-normal text-black group-hover:font-medium'"
          >
            {{ v.label }}
          </span>
        </button>
      </div>
    </div>

    <!-- Section 4: Selection Mode & Required Rules -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Selection Rule
        </p>
        <div class="flex gap-[6px] items-center">
          <button 
            type="button"
            @click="setAllowMultiple(true)"
            :class="allowMultiple ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="px-3 h-[32px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer"
          >
            Multiple
          </button>
          <button 
            type="button"
            @click="setAllowMultiple(false)"
            :class="!allowMultiple ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="px-3 h-[32px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer"
          >
            Single
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Required Field
        </p>
        <div class="flex gap-[6px] items-center">
          <button 
            type="button"
            @click="setRequired(false)"
            :class="!required ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="px-3 h-[32px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer"
          >
            Optional
          </button>
          <button 
            type="button"
            @click="setRequired(true)"
            :class="required ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="px-3 h-[32px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer"
          >
            Required
          </button>
        </div>
      </div>
    </div>

    <!-- Section 5: Grid Columns Option for Image Matrix -->
    <div v-if="variant === 'image-grid'" class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Grid Columns
          </p>
          <span class="font-707 text-[11px] text-neutral-400">
            3:4 card aspect ratio
          </span>
        </div>
        <span class="font-707 text-[12px] font-medium text-black px-2.5 py-1 bg-neutral-100 rounded-[6px]">
          {{ gridColumns }} {{ gridColumns === 1 ? 'Column' : 'Columns' }}
        </span>
      </div>

      <!-- Block Table Selector (1, 2, 3, 4 Columns) -->
      <div class="grid grid-cols-4 gap-[8px] w-full pt-1">
        <button 
          v-for="col in [1, 2, 3, 4]" 
          :key="col"
          type="button"
          @click="setGridColumns(col)"
          :class="gridColumns === col ? 'bg-black text-white border-black shadow-sm ring-1 ring-black' : 'bg-white text-neutral-700 hover:bg-neutral-50 hover:border-black/40 border-[#d9d9d9]'"
          class="h-[44px] rounded-[8px] border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all font-707"
        >
          <!-- Visual Block Representation of Columns -->
          <div class="flex gap-[2px] items-center h-[10px]">
            <div 
              v-for="b in col" 
              :key="b" 
              class="w-[4px] h-[9px] rounded-[1px]" 
              :class="gridColumns === col ? 'bg-white' : 'bg-neutral-400'"
            />
          </div>
          <span class="text-[11px] font-medium">{{ col }} Col</span>
        </button>
      </div>
    </div>

    <!-- Section 6: Slots Capacity (For Detailed Cards and Simple Rows) -->
    <div v-if="variant === 'detailed-card' || variant === 'simple-row'" class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Slots Capacity
          </p>
          <span class="font-707 text-[11px] text-neutral-400">
            Badge on option tiles
          </span>
        </div>
        <!-- 707 Switch Toggle -->
        <button 
          type="button"
          @click="toggleSlotsCapacity"
          :class="showSlotsCapacity ? 'bg-black' : 'bg-neutral-200'"
          class="relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
        >
          <span 
            :class="showSlotsCapacity ? 'translate-x-[18px]' : 'translate-x-0'"
            class="pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
          />
        </button>
      </div>

      <!-- Global Slots Input -->
      <div v-if="showSlotsCapacity" class="flex flex-col gap-[8px] w-full pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
        <div class="flex items-center justify-between">
          <span class="font-707 text-[12px] font-medium text-neutral-700">Slots per Option</span>
          <span class="font-707 text-[11px] text-neutral-400">Applies to all options</span>
        </div>
        <div class="border border-[#aaa] focus-within:border-black rounded-[8px] px-3.5 h-[38px] flex items-center w-full bg-white transition-colors">
          <input 
            v-model="globalSlotsCapacity"
            placeholder="e.g. 25"
            class="w-full font-707 text-[13px] font-medium text-black focus:outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>
    </div>

    <!-- Section 5: Options Manager -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Options ({{ options.length }})
        </p>
        <button 
          type="button"
          @click="addOption"
          class="apple-glass-btn px-2.5 h-[28px] rounded-[6px] text-[11px] font-medium flex items-center gap-1 cursor-pointer"
        >
          <Plus class="w-3 h-3" />
          <span>Add Option</span>
        </button>
      </div>

      <!-- Options items list -->
      <div class="flex flex-col gap-[10px] w-full">
        <div 
          v-for="(opt, idx) in options" 
          :key="opt.id"
          class="flex flex-col gap-2 p-3 bg-white rounded-[8px] border border-[#d9d9d9] shadow-sm transition-all group"
        >
          <!-- Top Row: Order Index, Custom Option Title Input, Default Selected Checkbox, and Delete -->
          <div class="flex items-center gap-2 w-full">
            <span class="size-5 rounded-full bg-neutral-100 flex items-center justify-center font-mono text-[10px] text-neutral-500 font-bold shrink-0">
              {{ idx + 1 }}
            </span>

            <!-- Editable Custom Option Title Input -->
            <div class="border border-[#ccc] focus-within:border-black rounded-[6px] px-2.5 h-[32px] flex items-center flex-1 bg-white transition-colors">
              <input 
                :value="opt.label"
                @input="updateOptionLabel(idx, ($event.target as HTMLInputElement).value)"
                :placeholder="getAutomaticOptionLabel(variant, idx)"
                class="w-full font-707 text-[12px] font-medium text-black focus:outline-none placeholder:text-neutral-400"
              />
            </div>

            <!-- Default Selected Toggle Button -->
            <button 
              type="button"
              @click="toggleOptionSelected(opt.id)"
              :class="isOptionSelected(opt.id) ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400 hover:text-black'"
              class="size-[32px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors border border-black/10 shrink-0"
              title="Toggle Pre-selected state"
            >
              <Check class="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <!-- Delete Option -->
            <button 
              type="button"
              @click="removeOption(idx)"
              :disabled="options.length <= 1"
              :class="options.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-red-600 hover:bg-red-50 text-neutral-400 cursor-pointer'"
              class="size-[32px] rounded-[6px] flex items-center justify-center transition-colors shrink-0"
              title="Remove Option"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Variant Specific Fields -->
          <!-- Sublabel / Date field (for detailed-card - locked to DD MMM YYYY 3-select picker) -->
          <div v-if="variant === 'detailed-card'" class="flex flex-col gap-1.5 pl-7">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-707 font-medium text-neutral-600 flex items-center gap-1">
                <Calendar class="w-3 h-3 text-neutral-400" />
                <span>Date (DD MMM YYYY)</span>
              </span>
              <span class="text-[10px] font-mono text-neutral-400 font-medium">
                {{ parseDateComponents(opt.sublabel).day }} {{ parseDateComponents(opt.sublabel).month }} {{ parseDateComponents(opt.sublabel).year }}
              </span>
            </div>
            
            <div class="grid grid-cols-3 gap-1.5 w-full">
              <!-- Day Select -->
              <div class="relative">
                <select 
                  :value="parseDateComponents(opt.sublabel).day"
                  @change="updateOptionDate(idx, 'day', ($event.target as HTMLSelectElement).value)"
                  class="w-full h-[30px] px-2 appearance-none bg-white border border-[#ccc] focus:border-black rounded-[6px] font-707 text-[11px] font-medium text-black focus:outline-none cursor-pointer pr-5"
                >
                  <option v-for="d in DAYS" :key="d" :value="d">{{ d }}</option>
                </select>
                <ChevronDown class="w-3 h-3 text-neutral-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <!-- Month Select -->
              <div class="relative">
                <select 
                  :value="parseDateComponents(opt.sublabel).month"
                  @change="updateOptionDate(idx, 'month', ($event.target as HTMLSelectElement).value)"
                  class="w-full h-[30px] px-2 appearance-none bg-white border border-[#ccc] focus:border-black rounded-[6px] font-707 text-[11px] font-medium text-black focus:outline-none cursor-pointer pr-5"
                >
                  <option v-for="m in MONTHS" :key="m" :value="m">{{ m }}</option>
                </select>
                <ChevronDown class="w-3 h-3 text-neutral-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <!-- Year Select -->
              <div class="relative">
                <select 
                  :value="parseDateComponents(opt.sublabel).year"
                  @change="updateOptionDate(idx, 'year', ($event.target as HTMLSelectElement).value)"
                  class="w-full h-[30px] px-2 appearance-none bg-white border border-[#ccc] focus:border-black rounded-[6px] font-707 text-[11px] font-medium text-black focus:outline-none cursor-pointer pr-5"
                >
                  <option v-for="y in YEARS" :key="y" :value="y">{{ y }}</option>
                </select>
                <ChevronDown class="w-3 h-3 text-neutral-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <!-- Description field (for detailed-card) -->
          <div v-if="variant === 'detailed-card'" class="pl-7">
            <textarea 
              v-model="opt.description"
              rows="2"
              placeholder="Event Description Detail..."
              class="w-full font-707 text-[11px] text-neutral-700 focus:outline-none border border-[#ccc] focus:border-black rounded-[6px] p-1.5 resize-none leading-relaxed bg-white"
            />
          </div>

          <!-- Image Selector & Dropzone (for image-grid) -->
          <div v-if="variant === 'image-grid'" class="pl-7 w-full flex flex-col gap-2">
            <!-- If image exists: preview with Gallery, Upload, and Remove buttons -->
            <div 
              v-if="opt.imageUrl" 
              class="relative border border-[#d9d9d9] rounded-[8px] p-2 flex items-center justify-between bg-white hover:border-black transition-colors"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="size-[44px] rounded bg-neutral-50 overflow-hidden border border-neutral-200 shrink-0">
                  <img :src="opt.imageUrl" :alt="opt.label" class="size-full object-cover" />
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-[11px] font-707 font-medium text-black truncate">{{ opt.label || 'Model Image' }}</span>
                  <span class="text-[9px] font-707 text-neutral-400">3:4 aspect ratio</span>
                </div>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <button 
                  type="button"
                  @click="openMediaGalleryForOption(opt.id)"
                  class="apple-glass-btn text-[10px] font-707 px-2 py-1 rounded-[6px] cursor-pointer"
                  title="Select from Media Gallery"
                >
                  Gallery
                </button>
                <button 
                  type="button"
                  @click="triggerOptionFileUpload(idx)"
                  class="apple-glass-btn text-[10px] font-707 px-2 py-1 rounded-[6px] cursor-pointer"
                  title="Upload from computer"
                >
                  Upload
                </button>
                <button 
                  type="button"
                  @click="removeOptionImage(idx)"
                  class="apple-glass-icon-btn size-6 rounded-[6px] flex items-center justify-center text-neutral-500 hover:text-red-600 cursor-pointer"
                  title="Remove Image"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>
            </div>

            <!-- If no image: Drag & Drop / Select From Media Gallery area -->
            <div 
              v-else
              @click="triggerOptionFileUpload(idx)"
              @dragover.prevent="activeDragOptionIdx = idx"
              @dragleave="activeDragOptionIdx = null"
              @drop.prevent="handleOptionImageDrop($event, idx)"
              :class="[
                activeDragOptionIdx === idx ? 'border-black bg-neutral-100' : 'bg-[#f5f5f5] hover:bg-[#efefef] border-[#d9d9d9]',
                'border border-dashed flex flex-col gap-1 py-3 px-3 items-center justify-center rounded-[8px] w-full cursor-pointer transition-all'
              ]"
            >
              <p class="font-707 text-[11px] text-neutral-700 text-center">
                <button 
                  type="button" 
                  @click.stop="openMediaGalleryForOption(opt.id)"
                  class="font-medium text-black underline hover:text-neutral-700 cursor-pointer"
                >
                  Select From Media Gallery
                </button>
                <span> or Drag</span>
              </p>
              <span class="text-[9px] font-707 text-neutral-400">Fixed 3:4 ratio</span>
            </div>

            <!-- Hidden File Input for this option -->
            <input 
              type="file" 
              :ref="(el) => setFileInputRef(el, idx)" 
              accept="image/*" 
              @change="handleOptionFileChange($event, idx)" 
              class="hidden" 
            />
          </div>
        </div>
      </div>

      <!-- Quick Add Option Button -->
      <button 
        type="button"
        @click="addOption"
        class="w-full h-[36px] rounded-[8px] border border-dashed border-[#aaa] hover:border-black text-neutral-600 hover:text-black font-707 text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-white/50"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Add Option</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import { uploadMediaDirectly } from '../../services/mediaService.ts';
import type { ChoiceVariant, ChoiceOption } from '../../types/editor.ts';
import { 
  Plus, 
  Trash2, 
  Check, 
  ChevronDown, 
  Lock, 
  Calendar, 
  Ticket, 
  ListChecks, 
  LayoutGrid, 
  Image as ImageIcon 
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const YEARS = ['2026', '2027', '2028', '2029', '2030'];

function getAutomaticOptionLabel(v: ChoiceVariant, index: number): string {
  if (v === 'detailed-card') return `Pass Option ${index + 1}`;
  if (v === 'simple-row') {
    const sizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
    return sizes[index] || `Option ${index + 1}`;
  }
  if (v === 'horizontal-block') {
    const sessions = ['Morning', 'Afternoon', 'Evening', 'Night', 'Session 5', 'Session 6'];
    return sessions[index] || `Session ${index + 1}`;
  }
  if (v === 'image-grid') return `Model ${String(index + 1).padStart(2, '0')}`;
  return `Option ${index + 1}`;
}

function parseDateComponents(dateStr?: string) {
  const parts = (dateStr || '24 Oct 2026').trim().split(/\s+/);
  const day = parts[0] ? parts[0].padStart(2, '0') : '24';
  const month = parts[1] || 'Oct';
  const year = parts[2] || '2026';
  return {
    day: DAYS.includes(day) ? day : '24',
    month: MONTHS.includes(month) ? month : 'Oct',
    year: YEARS.includes(year) ? year : '2026'
  };
}

function updateOptionLabel(index: number, val: string) {
  if (!currentWidget.value) return;
  const currentOptions = [...(currentWidget.value.props.options || [])];
  if (!currentOptions[index]) return;
  currentOptions[index] = {
    ...currentOptions[index],
    label: val
  };
  editorStore.updateWidgetProps(currentWidget.value.id, { options: currentOptions });
}

function updateOptionDate(index: number, part: 'day' | 'month' | 'year', val: string) {
  if (!currentWidget.value) return;
  const currentOptions = [...(currentWidget.value.props.options || [])];
  if (!currentOptions[index]) return;
  const parsed = parseDateComponents(currentOptions[index].sublabel);
  parsed[part] = val;
  currentOptions[index].sublabel = `${parsed.day} ${parsed.month} ${parsed.year}`;
  editorStore.updateWidgetProps(currentWidget.value.id, { options: currentOptions });
}

const editorStore = useEditorStore();
const sidebarRef = ref<HTMLElement | null>(null);
const titleDropdownRef = ref<HTMLElement | null>(null);
const optionDropdownRef = ref<HTMLElement | null>(null);
const isTitleDropdownOpen = ref(false);
const isOptionDropdownOpen = ref(false);

const typographyOptions = [
  { id: 'headline-1', label: 'Headline 1', size: '32px', desc: 'Display title / primary punchy headline', previewClass: 'font-medium text-[15px]' },
  { id: 'heading-2', label: 'Heading 2', size: '22px', desc: 'Section header / secondary headline', previewClass: 'font-medium text-[14px]' },
  { id: 'heading-3', label: 'Heading 3', size: '18px', desc: 'Sub-section heading', previewClass: 'font-medium text-[13px]' },
  { id: 'subtext-lead', label: 'Subtext Lead', size: '16px', desc: 'Introductory lead text / bold subheader', previewClass: 'font-medium text-[13px]' },
  { id: 'body-text', label: 'Body Text', size: '12px', desc: 'Standard readable paragraph body text', previewClass: 'font-normal text-[12px]' },
  { id: 'body-text-medium', label: 'Body Text (Medium)', size: '12px', desc: 'Emphasized body copy / tile labels', previewClass: 'font-medium text-[12px]' },
  { id: 'caption', label: 'Caption', size: '11px', desc: 'Secondary annotations and instructions', previewClass: 'font-normal text-[11px]' },
  { id: 'legal-micro', label: 'Legal / Micro', size: '11px', desc: 'Footnotes, terms, and micro meta', previewClass: 'font-normal text-[11px] text-neutral-500' }
];

const variants: { id: ChoiceVariant; label: string; icon: any }[] = [
  { id: 'detailed-card', label: 'Detailed Cards', icon: Ticket },
  { id: 'simple-row', label: 'Simple Rows', icon: ListChecks },
  { id: 'horizontal-block', label: 'Horizontal Blocks', icon: LayoutGrid },
  { id: 'image-grid', label: 'Image Matrix', icon: ImageIcon }
];

const currentWidget = computed(() => {
  if (editorStore.selectedWidget && editorStore.selectedWidget.type === 'MultipleChoice') {
    return editorStore.selectedWidget;
  }
  return editorStore.currentPage.widget_tree.find(w => w.type === 'MultipleChoice') || null;
});

const title = computed({
  get: () => currentWidget.value?.props.title || '',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { title: val });
    }
  }
});

const currentTitleTypographyId = computed(() => {
  return currentWidget.value?.props.titleTypographyStyle || currentWidget.value?.props.typographyStyle || 'heading-3';
});

const currentTitleTypographyLabel = computed(() => {
  const opt = typographyOptions.find(o => o.id === currentTitleTypographyId.value);
  return opt ? opt.label : 'Heading 3 (18px)';
});

function selectTitleTypography(id: string) {
  if (currentWidget.value) {
    editorStore.updateWidgetProps(currentWidget.value.id, { 
      titleTypographyStyle: id,
      typographyStyle: id 
    });
  }
  isTitleDropdownOpen.value = false;
}

const currentOptionTypographyId = computed(() => {
  return currentWidget.value?.props.optionTypographyStyle || 'body-text-medium';
});

const currentOptionTypographyLabel = computed(() => {
  const opt = typographyOptions.find(o => o.id === currentOptionTypographyId.value);
  return opt ? opt.label : 'Body Text (Medium) (12px)';
});

function selectOptionTypography(id: string) {
  if (currentWidget.value) {
    editorStore.updateWidgetProps(currentWidget.value.id, { optionTypographyStyle: id });
  }
  isOptionDropdownOpen.value = false;
}

const subtitle = computed({
  get: () => currentWidget.value?.props.subtitle || '',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { subtitle: val });
    }
  }
});

const variant = computed<ChoiceVariant>({
  get: () => (currentWidget.value?.props.variant as ChoiceVariant) || 'detailed-card',
  set: (val: ChoiceVariant) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { variant: val });
    }
  }
});

const allowMultiple = computed({
  get: () => currentWidget.value?.props.allowMultiple ?? true,
  set: (val: boolean) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { allowMultiple: val });
    }
  }
});

const required = computed({
  get: () => currentWidget.value?.props.required ?? false,
  set: (val: boolean) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { required: val });
    }
  }
});

const gridColumns = computed<number>({
  get: () => Number(currentWidget.value?.props.gridColumns) || 4,
  set: (val: number) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { gridColumns: val });
    }
  }
});

function setGridColumns(col: number) {
  gridColumns.value = col;
}

const showSlotsCapacity = computed({
  get: () => currentWidget.value?.props.showSlotsCapacity ?? true,
  set: (val: boolean) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { showSlotsCapacity: val });
    }
  }
});

const globalSlotsCapacity = computed({
  get: () => currentWidget.value?.props.globalSlotsCapacity ?? 25,
  set: (val: string | number) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { globalSlotsCapacity: val });
    }
  }
});

function toggleSlotsCapacity() {
  showSlotsCapacity.value = !showSlotsCapacity.value;
}

const options = computed<ChoiceOption[]>({
  get: () => currentWidget.value?.props.options || [],
  set: (val: ChoiceOption[]) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { options: val });
    }
  }
});

function setVariant(v: ChoiceVariant) {
  variant.value = v;
  if (!currentWidget.value) return;

  // Preset matching defaults if switching to standard Figma styles
  if (v === 'detailed-card' && (!currentWidget.value.props.title || currentWidget.value.props.title === 'SELECT APPAREL SIZE' || currentWidget.value.props.title === 'SELECT YOUR SESSIONS' || currentWidget.value.props.title === 'SELECT YOUR MODEL')) {
    editorStore.updateWidgetProps(currentWidget.value.id, {
      title: 'SELECT ARRIVALS',
      subtitle: 'Choose your preferred attendance day below.',
      options: [
        { id: 'opt_1', label: 'Pass Option 1', sublabel: '24 Oct 2026', description: 'Access to activation area and special event lounge' },
        { id: 'opt_2', label: 'Pass Option 2', sublabel: '25 Oct 2026', description: 'Access to activation area and special event lounge' }
      ]
    });
  } else if (v === 'simple-row' && (!currentWidget.value.props.title || currentWidget.value.props.title === 'SELECT ARRIVALS')) {
    editorStore.updateWidgetProps(currentWidget.value.id, {
      title: 'SELECT APPAREL SIZE',
      subtitle: 'Choose your preferred size below.',
      options: [
        { id: 'opt_1', label: 'S' },
        { id: 'opt_2', label: 'M' },
        { id: 'opt_3', label: 'L' }
      ]
    });
  } else if (v === 'horizontal-block' && (!currentWidget.value.props.title || currentWidget.value.props.title === 'SELECT ARRIVALS' || currentWidget.value.props.title === 'SELECT APPAREL SIZE')) {
    editorStore.updateWidgetProps(currentWidget.value.id, {
      title: 'SELECT YOUR SESSIONS',
      subtitle: 'Choose your preferred sessions below.',
      options: [
        { id: 'opt_1', label: 'Morning' },
        { id: 'opt_2', label: 'Afternoon' }
      ]
    });
  } else if (v === 'image-grid' && (!currentWidget.value.props.title || currentWidget.value.props.title === 'SELECT ARRIVALS' || currentWidget.value.props.title === 'SELECT APPAREL SIZE' || currentWidget.value.props.title === 'SELECT YOUR SESSIONS')) {
    const defaultImages = [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=300&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&q=80'
    ];
    editorStore.updateWidgetProps(currentWidget.value.id, {
      title: 'SELECT YOUR MODEL',
      subtitle: 'Choose your preferred model below.',
      options: [
        { id: 'opt_1', label: 'Model 01', imageUrl: defaultImages[0] },
        { id: 'opt_2', label: 'Model 02', imageUrl: defaultImages[1] },
        { id: 'opt_3', label: 'Model 03', imageUrl: defaultImages[2] }
      ]
    });
  }
}

function setAllowMultiple(val: boolean) {
  allowMultiple.value = val;
  if (!val && currentWidget.value) {
    const selected = (currentWidget.value.props.selectedValues || []) as string[];
    if (selected.length > 1) {
      editorStore.updateWidgetProps(currentWidget.value.id, { selectedValues: [selected[0]] });
    }
  }
}

function setRequired(val: boolean) {
  required.value = val;
}

function isOptionDisabled(opt: ChoiceOption): boolean {
  if (opt.disabled) return true;
  if (showSlotsCapacity.value) {
    if (opt.slotsCapacity !== undefined && opt.slotsCapacity !== null && String(opt.slotsCapacity).trim() !== '') {
      const n = Number(opt.slotsCapacity);
      if (!isNaN(n) && n <= 0) return true;
    } else if (globalSlotsCapacity.value !== undefined && globalSlotsCapacity.value !== null && String(globalSlotsCapacity.value).trim() !== '') {
      const n = Number(globalSlotsCapacity.value);
      if (!isNaN(n) && n <= 0) return true;
    }
  }
  return false;
}

function isOptionSelected(id: string): boolean {
  if (!currentWidget.value) return false;
  const selected = (currentWidget.value.props.selectedValues || []) as string[];
  return selected.includes(id);
}

function toggleOptionSelected(id: string) {
  if (!currentWidget.value) return;
  const opt = (currentWidget.value.props.options || []).find((o: any) => o.id === id);
  if (opt && isOptionDisabled(opt)) return;

  let selected = [...((currentWidget.value.props.selectedValues || []) as string[])];
  
  if (selected.includes(id)) {
    selected = selected.filter(x => x !== id);
  } else {
    if (allowMultiple.value) {
      selected.push(id);
    } else {
      selected = [id];
    }
  }
  editorStore.updateWidgetProps(currentWidget.value.id, { selectedValues: selected });
}

function addOption() {
  if (!currentWidget.value) return;
  const currentOptions = [...(currentWidget.value.props.options || [])];
  const nextIdx = currentOptions.length;
  const v = variant.value;
  const autoLabel = getAutomaticOptionLabel(v, nextIdx);
  
  let newOption: ChoiceOption = {
    id: `opt_${Date.now()}`,
    label: autoLabel
  };

  if (v === 'detailed-card') {
    const defaultDay = String(Math.min(24 + nextIdx, 31)).padStart(2, '0');
    newOption = {
      id: `opt_${Date.now()}`,
      label: autoLabel,
      sublabel: `${defaultDay} Oct 2026`,
      description: 'Access to activation area and special event lounge'
    };
  } else if (v === 'image-grid') {
    const defaultImages = [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=300&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&q=80'
    ];
    newOption = {
      id: `opt_${Date.now()}`,
      label: autoLabel,
      imageUrl: defaultImages[nextIdx % defaultImages.length]
    };
  }

  currentOptions.push(newOption);
  editorStore.updateWidgetProps(currentWidget.value.id, { options: currentOptions });
}

function removeOption(index: number) {
  if (!currentWidget.value) return;
  const currentOptions = [...(currentWidget.value.props.options || [])];
  if (currentOptions.length <= 1) return;
  
  const removed = currentOptions.splice(index, 1)[0];
  let selected = ((currentWidget.value.props.selectedValues || []) as string[]).filter(id => id !== removed.id);

  editorStore.updateWidgetProps(currentWidget.value.id, { 
    options: currentOptions,
    selectedValues: selected
  });
}

const activeDragOptionIdx = ref<number | null>(null);
const fileInputRefs = ref<Record<number, HTMLInputElement | null>>({});

function setFileInputRef(el: any, idx: number) {
  if (el) {
    fileInputRefs.value[idx] = el as HTMLInputElement;
  }
}

function triggerOptionFileUpload(idx: number) {
  const input = fileInputRefs.value[idx];
  if (input) {
    input.value = '';
    input.click();
  }
}

function openMediaGalleryForOption(optId: string) {
  editorStore.openMediaGalleryForChoiceOption(optId);
}

function removeOptionImage(idx: number) {
  if (!currentWidget.value) return;
  const options = [...(currentWidget.value.props.options || [])];
  if (options[idx]) {
    options[idx] = { ...options[idx], imageUrl: '' };
    editorStore.updateWidgetProps(currentWidget.value.id, { options });
  }
}

async function handleOptionFileChange(event: Event, idx: number) {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files || files.length === 0) return;
  const file = files[0];
  await processOptionImageFile(file, idx);
}

async function handleOptionImageDrop(event: DragEvent, idx: number) {
  activeDragOptionIdx.value = null;
  // Check if dropped from Media Gallery (JSON)
  const jsonStr = event.dataTransfer?.getData('application/json');
  if (jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data?.customProps?.imageUrl && currentWidget.value) {
        const options = [...(currentWidget.value.props.options || [])];
        if (options[idx]) {
          options[idx] = { ...options[idx], imageUrl: data.customProps.imageUrl };
          editorStore.updateWidgetProps(currentWidget.value.id, { options });
        }
        return;
      }
    } catch (_) {}
  }

  // Check if physical file dropped
  const files = event.dataTransfer?.files;
  if (files && files.length > 0 && files[0].type.startsWith('image/')) {
    await processOptionImageFile(files[0], idx);
  }
}

async function processOptionImageFile(file: File, idx: number) {
  if (!currentWidget.value) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl = e.target?.result as string;
    if (dataUrl && currentWidget.value) {
      const options = [...(currentWidget.value.props.options || [])];
      if (options[idx]) {
        options[idx] = { ...options[idx], imageUrl: dataUrl };
        editorStore.updateWidgetProps(currentWidget.value.id, { options });
      }

      try {
        const saved = await uploadMediaDirectly({
          dataUrl,
          title: file.name.replace(/\.[^/.]+$/, ''),
          category: 'Product Catalog',
          filename: file.name
        });
        if (saved?.url && currentWidget.value) {
          const currentOpts = [...(currentWidget.value.props.options || [])];
          if (currentOpts[idx]) {
            currentOpts[idx] = { ...currentOpts[idx], imageUrl: saved.url };
            editorStore.updateWidgetProps(currentWidget.value.id, { options: currentOpts });
          }
        }
      } catch (err) {
        console.warn('Background upload failed, retaining dataUrl:', err);
      }
    }
  };
  reader.readAsDataURL(file);
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node;
  if (titleDropdownRef.value && !titleDropdownRef.value.contains(target)) {
    isTitleDropdownOpen.value = false;
  }
  if (optionDropdownRef.value && !optionDropdownRef.value.contains(target)) {
    isOptionDropdownOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
