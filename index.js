class WhacAMole {
  constructor({ el, storeEl, missEl, ...options }) {
    this.el = supports.getElement(el)
    this.storeEl = supports.getElement(storeEl)
    this.missEl = supports.getElement(missEl)

    this.jumpOutMoles = undefined

    this.store = undefined
    this.missRecord = undefined

    this.pool = undefined

    this.options = options

    if (this.el) {
      this.init()
    }
  }

  init() {
    const { moleCount } = this.options
    const moleContent = Array(moleCount).fill(null).map((v, i) => moleGroup(i)).join('')
    // 初始化
    this.el.innerHTML = moleContent
    // 地鼠记录
    this.jumpOutMoles = new Set()
    // 得分
    this.store = 0
    // 错过多少个
    this.missRecord = 0

    // 注册敲击事件
    this.el.addEventListener('click', (event) => {
      const moleID = event.target.id || event.path[1].id

      if (this.jumpOutMoles.has(moleID)) {
        this.dischargeMole(DOMcache[moleID], moleID)

        this.store++
        supports.updateStore(this.storeEl, this.store)
      }
    })

    this.start()
  }

  start() {
    const { moleCount } = this.options

    let pool = this.pool = Array(moleCount).fill(null).map((v, i) => i)

    setInterval(() => {
      if (pool.length === 0) {
        pool = this.pool = Array(moleCount).fill(null).map((v, i) => i)
      }

      const index = pool.splice(parseInt(Math.random() * (pool.length - 1)), 1)[0]
      const moleID = `group${index}`

      this.toggleMole(moleID)
    }, DEFAULT_CONFIG.MOLE_SHOW_TIME)
  }

  toggleMole(moleID) {
    const moleDOM = DOMcache[moleID] = DOMcache[moleID] || document.querySelector(`#${moleID} .mouse`)

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
}

const DEFAULT_CONFIG = {
  // 地鼠出现时间
  'MOLE_SHOW_TIME': 3000,
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
  }
}

window.onload = () => {
  new WhacAMole(
    {
      el: '#game',
      storeEl: '#store',
      missEl: '#miss',
      moleCount: 9,
    }
  )
}