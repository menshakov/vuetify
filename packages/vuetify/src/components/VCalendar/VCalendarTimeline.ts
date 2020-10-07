// Styles
import './VCalendarTimeline.sass'

// Types
import { VNode } from 'vue'

// Directives
import Resize from '../../directives/resize'

// Components
import VBtn from '../VBtn'

// Mixins
import CalendarWithTracks from './mixins/calendar-with-tracks'

// Util
import { convertToUnit, getSlot } from '../../util/helpers'
import { Track, CalendarTimestamp, CalendarTimestampTrack } from 'vuetify/types'

/* @vue/component */
export default CalendarWithTracks.extend({
  name: 'v-calendar-timeline',

  directives: { Resize },

  data: () => ({
    scrollPush: 0,
  }),

  computed: {
    classes (): object {
      return {
        'v-calendar-daily': true,
        ...this.themeClasses,
      }
    },
  },

  mounted () {
    this.init()
  },

  created (): void {

  },

  destroyed (): void {
    const el = this.$refs.daysScroll as HTMLElement

    if (el) {
      el.removeEventListener('scroll', this.tracksWrapperScrolled)
    }
  },

  methods: {
    init () {
      this.$nextTick(this.onResize)

      const el = this.$refs.daysScroll as HTMLElement

      if (el) {
        el.addEventListener('scroll', this.tracksWrapperScrolled)
      }
    },
    onResize () {
      this.scrollPush = this.getScrollPush()
    },
    getScrollPush (): number {
      const area = this.$refs.scrollArea as HTMLElement
      const pane = this.$refs.pane as HTMLElement

      return area && pane ? (area.offsetWidth - pane.offsetWidth) : 0
    },
    genHead (): VNode {
      return this.$createElement('div', {
        staticClass: 'v-calendar-daily__head',
        style: {
          marginRight: this.scrollPush + 'px',
        },
      }, [
        this.genHeadTracks(),
        this.getHeadDaysWrapper(),
      ])
    },
    getHeadDaysWrapper (): VNode {
      return this.$createElement('div', {
        ref: 'headDaysWrapper',
        staticClass: 'v-calendar-daily__head-days-wrapper',
      }, [
        ...this.genHeadDays(),
      ])
    },
    genHeadTracks (): VNode {
      const width: string | undefined = convertToUnit(this.trackWidth)

      return this.$createElement('div', {
        staticClass: 'v-calendar-daily__tracks-head',
        style: {
          width,
        },
      }, getSlot(this, 'track-header'))
    },
    genHeadDays (): VNode[] {
      return this.days.map(this.genHeadDay)
    },
    genHeadDay (day: CalendarTimestamp, index: number): VNode {
      return this.$createElement('div', {
        key: day.date,
        staticClass: 'v-calendar-daily_head-day',
        class: this.getRelativeClasses(day),
        on: this.getDefaultMouseEventHandlers(':day', _e => {
          return this.getSlotScope(day)
        }),
      }, [
        this.genHeadWeekday(day),
        this.genHeadDayLabel(day),
        ...this.genDayHeader(day, index),
      ])
    },
    genDayHeader (day: CalendarTimestamp, index: number): VNode[] {
      return getSlot(this, 'day-header', () => ({
        week: this.days, ...day, index,
      })) || []
    },
    genHeadWeekday (day: CalendarTimestamp): VNode {
      const color = day.present ? this.color : undefined

      return this.$createElement('div', this.setTextColor(color, {
        staticClass: 'v-calendar-daily_head-weekday',
      }), this.weekdayFormatter(day, this.shortWeekdays))
    },
    genHeadDayLabel (day: CalendarTimestamp): VNode {
      return this.$createElement('div', {
        staticClass: 'v-calendar-daily_head-day-label',
      }, getSlot(this, 'day-label-header', day) || [this.genHeadDayButton(day)])
    },
    genHeadDayButton (day: CalendarTimestamp): VNode {
      const color = day.present ? this.color : 'transparent'

      return this.$createElement(VBtn, {
        props: {
          color,
          fab: true,
          depressed: true,
          small: true,
        },
        on: this.getMouseEventHandlers({
          'click:date': { event: 'click', stop: true },
          'contextmenu:date': { event: 'contextmenu', stop: true, prevent: true, result: false },
        }, _e => {
          return day
        }),
      }, this.dayFormatter(day, false))
    },
    genBody (): VNode {
      return this.$createElement('div', {
        staticClass: 'v-calendar-daily__body',
      }, [
        // this.genScrollArea(),
        this.genDayContainer(),
      ])
    },
    genDayContainer (): VNode {
      return this.$createElement('div', {
        staticClass: 'v-calendar-daily__day-container',
      }, [
        this.genBodyTracks(),
        this.genScrollArea(),
      ])
    },
    genScrollArea (): VNode {
      return this.$createElement('div', {
        ref: 'daysScroll',
        staticClass: 'v-calendar-daily__days-scroller',
      }, [
        this.genDaysWrapper(),
      ])
    },
    genDaysWrapper (): VNode {
      return this.$createElement('div', {
        staticClass: 'v-calendar-daily__days-wrapper',
      }, [
        ...this.genDays(),
      ])
    },
    genDays (): VNode[] {
      return this.days.map(this.genDay)
    },
    genDay (day: CalendarTimestamp, index: number): VNode {
      return this.$createElement('div', {
        key: day.date,
        staticClass: 'v-calendar-daily__day',
        class: this.getRelativeClasses(day),
        on: this.getDefaultMouseEventHandlers(':time', e => {
          return this.getSlotScope(this.getTimestampAtEvent(e, day))
        }),
      }, [
        ...this.genDayTracks(index),
        ...this.genDayBody(day, index),
      ])
    },
    genDayBody (day: CalendarTimestamp, index: number): VNode[] {
      return getSlot(this, 'day-body-track', () => ({ ...this.getSlotScope(day), index })) || []
    },
    genDayTracks (index: number): VNode[] {
      return this.tracks[index].map(this.genDayTrack)
    },
    genDayTrack (track: CalendarTimestampTrack): VNode {
      const height: string | undefined = convertToUnit(this.trackHeight)
      const styler = this.trackStyle || this.trackStyleDefault

      const data = {
        key: `${track.date}__${track.track}`,
        staticClass: 'v-calendar-daily__day-track',
        style: {
          height,
          ...styler(track),
        },
      }

      const children = getSlot(this, 'track', () => this.getSlotScope(track))

      return this.$createElement('div', data, children)
    },
    genBodyTracks (): VNode {
      const width: string | undefined = convertToUnit(this.trackWidth)

      const data = {
        staticClass: 'v-calendar-daily__tracks-body',
        style: {
          width,
        },
      }

      return this.$createElement('div', data, this.getTrackLabels())
    },
    getTrackLabels (): VNode[] | null {
      return this.parsedGroups.map(this.genTrackLabel)
    },
    genTrackLabel (track: Track, index: number): VNode {
      const height: string | undefined = convertToUnit(this.trackHeight)
      const label: string = track.text
      const isRoot = !track.parent

      return this.$createElement('div', {
        key: track.id,
        staticClass: 'v-calendar-daily__track',
        style: {
          height,
          lineHeight: height,
        },
        class: {
          'v-calendar-daily__root-track': isRoot,
          'blue-grey lighten-5': isRoot,
          'font-weight-light': !isRoot,
        },
        on: this.getMouseEventHandlers({
          'click:group': { event: 'click', stop: true },
          'contextmenu:group': { event: 'contextmenu', stop: true, prevent: true, result: false },
        }, _e => {
          return track
        }),
      }, [
        this.$createElement('div', {
          staticClass: 'v-calendar-daily__track-text',
        }, getSlot(this, 'group-item', () => ({
          ...track, index,
        })) || label),
      ])
    },

    genTrackSlot (track: Track, index: number): VNode[] {
      return getSlot(this, 'group-item', () => ({
        ...track, index,
      })) || []
    },

    tracksWrapperScrolled (e: any): void {
      const head = this.$refs.headDaysWrapper as HTMLElement
      head.scrollLeft = e.target.scrollLeft
    },
  },

  render (h): VNode {
    return h('div', {
      class: this.classes,
      on: {
        dragstart: (e: MouseEvent) => {
          e.preventDefault()
        },
      },
      directives: [{
        modifiers: { quiet: true },
        name: 'resize',
        value: this.onResize,
      }],
    }, [
      !this.hideHeader ? this.genHead() : '',
      this.genBody(),
    ])
  },
})
