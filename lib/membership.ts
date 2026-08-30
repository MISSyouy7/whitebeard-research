export const membershipOffer = {
  brand: "路见资本·资金战场研究室",
  priceYuan: 299,
  termLabel: "一年",
  groupId: "15554884215522",
  groupUrl: "https://wx.zsxq.com/mweb/views/topic/topic.html?group_id=15554884215522",
  deliverables: [
    "交易日收盘：完整90行业资金清单与连续性标记",
    "每周六：进攻、回流、撤退和下周验证清单",
    "每季度：全市场资金迁徙报告",
    "判断修正：保留原判断、反方证据和验证结果",
  ],
} as const;

export const freeListOffer = {
  keyword: "清单｜2026.08.24—08.28",
  publicKeyword: "清单",
  targetLeads: 10,
  startDate: "2026-08-24",
  endDate: "2026-08-28",
  title: "本周90行业资金迁徙清单",
  qrImage: "/lead/wechat-personal-qr.jpg",
  contactName: "Louis",
  previewImages: [
    "/lead/weekly-list-preview-01.png",
    "/lead/weekly-list-preview-02.png",
  ],
} as const;

export const proInterest = {
  features: ["公司动态跟踪", "产业链更新", "核心假设维护", "研究时间线", "研究效率工具"],
  priceBands: ["999元/年以内", "1000—1999元/年", "2000—2999元/年", "3000—5999元/年", "6000元以上", "暂时不会付费"],
  preferences: ["公司变化", "产业链变化", "行业资金"],
  qrImage: "/lead/wechat-personal-qr.jpg",
} as const;

export const conversionCopy = {
  deliveryQuestion: "你最希望我持续帮你跟踪哪一种：行业资金、公司变化，还是产业链变化？",
  subscriptionBridge: "你现在拿到的是一次完整周清单。如果你希望每天、每周和季度都有人按同一口径继续维护，可以看一下资金战场研究室。",
} as const;
