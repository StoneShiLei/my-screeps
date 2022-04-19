

/**
 * transporter 触发后事处理的最小生命
 */
 export const TRANSFER_DEATH_LIMIT = 20

 /**
  * 建造的优先级
  * 越靠前建造优先级越高
  */
export const BUILD_PRIORITY = [ STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_EXTENSION, STRUCTURE_LINK ]

/**
 * 造好新墙时 builder 会先将墙刷到超过下面值，之后才会去建其他建筑
 */
export const MIN_WALL_HITS = 8000

/**
 * 房间建筑维修需要的设置
 */
export const REPAIR_SETTING = {
  // 在 tower 的能量高于该值时才会刷墙
  energyLimit: 600,
  // 普通建筑维修的检查间隔
  checkInterval: 8,
  // 墙壁维修的检查间隔
  wallCheckInterval: 3,
  // 墙壁的关注时间
  focusTime: 100
}

/**
 * storage 填充到其他建筑的能量填充设置的下限默认值
 */
 export const DEFAULT_ENERGY_KEEP_LIMIT = 900000

 /**
  * storage 填充到其他建筑的能量填充设置的填充量默认值
  */
 export const DEFAULT_ENERGY_KEEP_AMOUNT = 50000
