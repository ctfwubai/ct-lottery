export interface IPersonConfig {
    id: number;
    uid: string;
    name: string;
    department: string;
    identity: string;
    avatar: string;
    isWin: boolean;
    x: number;
    y: number
    createTime: string;
    updateTime: string;
    prizeName: string[];
    prizeId: string[];
    prizeTime: string[];
    // 是否已被特殊分配到某个奖项
    isSpecial: boolean;
    // 特殊的奖项ID
    specialPrizeId?: string;
}
export interface Separate {
  id: string
  count: number
  isUsedCount: number
}

export interface SeparateCount {
  enable: boolean
  countList: Separate[]
  singleDrawCount?: number // 单次抽取人数
}
export interface IPrizeConfig {
  id: number | string
  name: string
  sort: number
  isAll: boolean
  count: number
  isUsedCount: number
  picture: {
    id: string | number
    name: string
    url: string
  }
  separateCount: {
    enable: boolean
    countList: Separate[]
    singleDrawCount?: number // 单次抽取人数
  }
  desc: string
  isShow: boolean
  isUsed: boolean
  frequency: number
  // 特殊模式
  isSpecial: boolean
  specialUsers: string[]
}
export interface IMusic {
  id: string
  name: string
  url: string
}

export interface IImage {
  id: string
  name: string
  url: string
}

export interface IFont {
  id: string
  name: string
  url: string
}

export interface IGlobalDrawConfig {
  // 自定义抽奖数量
  customDrawCount: number;
  // 是否启用自定义数量
  enableCustomCount: boolean;
  // 奖项抽完后是否自动切换到下一个奖项
  autoSwitchNextPrize: boolean;
}
