import { once } from 'vuikit/src/util/event'
import { addClass, removeClass } from 'vuikit/src/util/class'

const doc = document.documentElement

export let active
export let activeModals

export default {
  functional: true,
  render (h, { data, children, parent: modal }) {

    const def = {
      props: {
        css: false,
        appear: true
      },
      on: {
        beforeEnter () {
          addClass(doc, 'uk-modal-page')
        },
        enter (el, done) {
          const prev = active !== modal && active

          // if active modal exist, first close it
          if (prev && !modal.stacked) {
            prev.hide()

            // once prev modal is closed open the current one
            once(prev.$el, 'transitionend', () => doEnter(el, done), false, e => e.target === prev.$el)
            return
          }

          doEnter(el, done)
        },
        afterEnter (el) {
          activeModals++
          active = modal
        },
        beforeLeave (el) {
          removeClass(el, 'uk-open')
        },
        leave (el, done) {
          once(el, 'transitionend', done, false, e => e.target === el)
        },
        afterLeave (el) {
          activeModals--

          if (!activeModals) {
            removeClass(doc, 'uk-modal-page')
          }

          if (active === modal) {
            active = null
          }
        }
      }
    }

    function doEnter (el, done) {
      // redraw workaround, necessary so the browser
      // doesn't try to apply it all in one step, not
      // giving enough time for the transition to init
      el.offsetWidth // eslint-disable-line
      once(el, 'transitionend', done, false, e => e.target === el)

      // using setTimeout as a workaround for appear
      setTimeout(() => addClass(el, 'uk-open'), 0)
    }

    return h('transition', def, children)
  }
}
