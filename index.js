class WhacAMole {
  constructor({ el, storeEl, missEl, countDownEl, ...options }) {
    this.el = supports.getElement(el)
    // 打中的地鼠
    this.storeEl = supports.getElement(storeEl)
    // 跑掉的地鼠
    this.missEl = supports.getElement(missEl)
    // 倒计时
    this.countDownEl = supports.getElement(countDownEl)
    // 游戏状态
    this.status = 'over'

    this.jumpOutMoles = undefined

    this.store = undefined
    this.missRecord = undefined
    this.countDownTime = DEFAULT_CONFIG.GAME_TIME

    this.pool = undefined

    this.options = options

    this.countDownTimer = null
    this.moleTimer = null

    if (this.el) {
      this.init()
    }
  }

  init() {
    const { moleCount } = this.options
    const moleContent = Array(moleCount).fill(null).map((v, i) => moleGroup(i)).join('')
    // 初始化
    this.el.innerHTML = moleContent

    // 注册敲击事件
    this.el.addEventListener('click', (event) => {
      const moleID = event.target.id || event.path[1].id

      if (this.jumpOutMoles.has(moleID)) {
        this.dischargeMole(DOMcache[moleID], moleID)

        this.store++
        supports.updateStore(this.storeEl, this.store)
      }
    })

    // this.start()
  }

  reset() {
    // 地鼠记录
    this.jumpOutMoles = new Set()
    // 得分
    this.store = 0
    // 错过多少个
    this.missRecord = 0
    // 剩余时间倒计时
    this.countDownTime = DEFAULT_CONFIG.GAME_TIME
    // 清空池
    this.pool = undefined

    this.countDownTimer && clearInterval(this.countDownTimer)
    this.moleTimer && clearInterval(this.moleTimer)
  }

  start() {
    this.reset()

    this.status = 'begin'

    const { moleCount } = this.options

    let pool = this.pool = Array(moleCount).fill(null).map((v, i) => i)

    this.countDownStart()

    this.moleTimer = setInterval(() => {
      if (pool.length === 0) {
        pool = this.pool = Array(moleCount).fill(null).map((v, i) => i)
      }

      const index = pool.splice(parseInt(Math.random() * (pool.length - 1)), 1)[0]
      const moleID = `group${index}`

      this.toggleMole(moleID)
    }, DEFAULT_CONFIG.MOLE_INTERVAL_TIME)
  }

  toggleMole(moleID) {
    const moleDOM = DOMcache[moleID] = DOMcache[moleID] || document.querySelector(`#${moleID} .mouse`)

    if (supports.hasClass(moleDOM)) return

    supports.addClass(moleDOM)
    this.jumpOutMoles.add(moleID)

    setTimeout(() => {
      if (this.jumpOutMoles.has(moleID)) {
        this.dischargeMole(moleDOM, moleID)

        this.missRecord++
        supports.updateMiss(this.missEl, this.missRecord)
      }
    }, DEFAULT_CONFIG.MOLE_SHOW_TIME)
  }

  dischargeMole(moleDOM, moleID) {
    supports.deleteClass(moleDOM)
    this.jumpOutMoles.delete(moleID)
  }

  countDownStart() {
    this.countDownTimer = setInterval(() => {
      supports.updateCountDown(this.countDownEl, this.countDownTime--)
      if (this.countDownTime < 0) {
        clearInterval(this.countDownTimer)
        clearInterval(this.moleTimer)
        this.status = 'over'
      }
    }, 1000)
  }
}

const DEFAULT_CONFIG = {
  // 地鼠显示时间
  'MOLE_SHOW_TIME': 2000,
  // 地鼠出现间隔
  'MOLE_INTERVAL_TIME': 1000,
  // 游戏时间
  'GAME_TIME': 60,
}

const DOMcache = {}

const moleGroup = index => `
    <div class="group" id="group${index}">
      <img class="mouse" src="./static/image/mouse.png">
      <img class="hole" src="./static/image/hole.png">
    </div>
`

const supports = {
  getElement(el) {
    if (typeof el === 'string') {
      return document.querySelector(el)
    }

    throw Error('require el')
  },
  isElementNode(node) {
    return node.nodeType === 1 && node
  },
  hasClass(node, newclass = 'show') {
    const className = node.className
    return className.indexOf(newclass) > -1
  },
  addClass(node, newclass = 'show') {
    const className = node.className
    node.className = `${className} ${newclass}`
  },
  deleteClass(node, newclass = 'show') {
    const className = node.className
    node.className = className.replace(newclass, '').replace(/\s/g, '')
  },
  updateStore(node, store) {
    node.innerText = `store: ${store}`
  },
  updateMiss(node, store) {
    node.innerText = `miss: ${store}`
  },
  updateCountDown(node, store) {
    node.innerText = `剩余时间: ${store}s`
  }
}

window.onload = () => {
  const whacAMole = new WhacAMole(
    {
      el: '#game',
      storeEl: '#store',
      missEl: '#miss',
      countDownEl: '#countdown',
      moleCount: 12,
    }
  )

  document.querySelector('#start').addEventListener('click', () => {
    if (whacAMole.status === 'begin') return

    whacAMole.start()
  })
}