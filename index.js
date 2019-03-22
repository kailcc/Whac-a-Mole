class WhacAMole {
  constructor({ el, ...options }) {
    this.el = supports.getRootElement(el)
    this.jumpOutMoles = undefined

    this.store = undefined

    this.options = options

    if (this.el) {
      this.init()
    }
  }

  init() {
    const { moleCount } = this.options
    const moleContent = Array(moleCount).fill(null).map((v, i) => moleGroup(i)).join('')
    // 初始化地鼠
    this.el.innerHTML = moleContent
    // 初始化地鼠记录
    this.jumpOutMoles = new Set()
    // 初始化分数
    this.store = 0

    // 注册敲击事件
    this.el.addEventListener('click', (event) => {
      const groupclassId = event.path[1].id

      if (this.jumpOutMoles.has(groupclassId)) {
        console.log(this.store++)
      }
    })

    this.start()
  }

  start() {
    const { moleCount } = this.options

    setInterval(() => {
      const index = Math.floor(Math.random() * moleCount)
      this.toggleMole(index)
    }, 1000)
  }

  toggleMole(index) {
    const moleDOM = DOMcache[index] = DOMcache[index] || document.querySelector(`#group${index} .mouse`)
    const moleID = `group${index}`

    moleDOM.style.opacity = 1
    this.jumpOutMoles.add(moleID)

    setTimeout(() => {
      moleDOM.style.opacity = 0
      this.jumpOutMoles.delete(moleID)
    }, 1000)
  }
}

const DOMcache = {}

const moleGroup = index => `
    <div class="group" id="group${index}">
      <img class="mouse" src="./static/image/mouse.png">
      <img class="hole" src="./static/image/hole.png">
    </div>
`

const supports = {
  getRootElement(el) {
    if (typeof el === 'string') {
      return document.querySelector(el)
    }

    return isElementNode(el) || document.body
  },
  isElementNode(node) {
    return node.nodeType === 1 && node
  }
}

window.onload = () => {
  new WhacAMole(
    {
      el: '#game',
      moleCount: 9,
    }
  )
}