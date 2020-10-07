
// Mixins
import CalendarBase from './calendar-base'

// Util
import props from '../util/props'
import {
  copyTimestamp,
  updateMinutes,
  createDayList,
} from '../util/timestamp'
import { Track, CalendarTimestamp, CalendarDayBodyTrackSlotScope, CalendarTimestampTrack } from 'vuetify/types'

/* @vue/component */
export default CalendarBase.extend({
  name: 'calendar-with-interval-track',

  props: props.timeline,

  computed: {
    parsedGroups (): Track[] {
      return this.groups
        .filter(g => g.id !== undefined || g.id === null)
    },
    parsedGroupsCount (): number {
      return parseInt(this.parsedGroups.length)
    },
    parsedTrackHeight (): number {
      return parseFloat(this.trackHeight)
    },
    bodyHeight (): number {
      return this.parsedGroupsCount * this.parsedTrackHeight
    },
    days (): CalendarTimestamp[] {
      return createDayList(
        this.parsedStart,
        this.parsedEnd,
        this.times.today,
        this.weekdaySkips,
        this.maxDays
      )
    },
    tracks (): CalendarTimestampTrack[][] {
      const count: number = this.parsedGroupsCount
      const days: CalendarTimestamp[] = this.days

      return days.map(d => this.createTrackList(d, count))
    },
  },

  methods: {
    createTrackList (timestamp: CalendarTimestamp, count: number): CalendarTimestampTrack[] {
      const tracks: CalendarTimestampTrack[] = []

      for (let i = 0; i < count; i++) {
        const track = this.parsedGroups[i]

        tracks.push({
          ...timestamp,
          track: track.id,
        })
      }

      return tracks
    },
    trackStyleDefault (_interval: CalendarTimestampTrack): object | undefined {
      return undefined
    },
    getTimestampAtEvent (e: MouseEvent | TouchEvent, day: CalendarTimestamp): CalendarTimestamp {
      const timestamp: CalendarTimestamp = copyTimestamp(day)
      const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const baseMinutes: number = 0
      const touchEvent: TouchEvent = e as TouchEvent
      const mouseEvent: MouseEvent = e as MouseEvent
      const touches: TouchList = touchEvent.changedTouches || touchEvent.touches
      const clientY: number = touches && touches[0] ? touches[0].clientY : mouseEvent.clientY
      const addIntervals: number = (clientY - bounds.top) / this.parsedTrackHeight
      const addMinutes: number = Math.floor(addIntervals * 1)
      const minutes: number = baseMinutes + addMinutes

      return updateMinutes(timestamp, minutes, this.times.now)
    },
    getSlotScope (timestamp: CalendarTimestamp): CalendarDayBodyTrackSlotScope {
      const scope = copyTimestamp(timestamp) as any
      scope.trackToY = this.trackToY()
      scope.trackToX = this.trackToX
      scope.week = this.days
      return scope
    },
    trackToY (): (track: string) => number | false {
      const tracks = this.parsedGroups.map(g => g.id)

      return (track: string) => {
        const g = tracks.indexOf(track, 1)
        return g !== -1 ? this.parsedTrackHeight * g : false
      }
    },
    trackToX (): number {
      return 50
    },
  },
})
