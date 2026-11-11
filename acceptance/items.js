/* 验收检查项（与 acceptance/经典药膳推荐系统_项目模块验收表.xlsx《功能模块验收表》一致） */
window.YS = window.YS || {};
window.YS.acceptance = {
"modules": [
{
"code": "M01",
"name": "数据库建设"
},
{
"code": "M02",
"name": "推荐系统-用户端"
},
{
"code": "M03",
"name": "推荐系统-管理端"
},
{
"code": "M04",
"name": "推荐算法"
},
{
"code": "M05",
"name": "系统集成与部署"
},
{
"code": "M06",
"name": "数据安全与合规"
},
{
"code": "M07",
"name": "推广与应用"
},
{
"code": "M08",
"name": "知识产权与保密"
},
{
"code": "M09",
"name": "项目过程管理"
}
],
"items": [
{
"id": "M01-01",
"module": "M01",
"moduleName": "数据库建设",
"sub": "数据来源",
"point": "古籍书目纳入",
"desc": "以《黄帝内经》《金匮要略》《饮膳正要》《千金方·食治门》《养老奉亲书》《本草纲目》等为主，纳入书目由专家论证会确定。",
"std": "1. 提供专家论证会确定的纳入书目清单；\n2. 库内每首药膳方均可追溯至清单内古籍。",
"method": "文档审查+数据抽检",
"ref": "4.1(1)",
"level": "必选",
"stage": "初验",
"owner": "甲方、乙方",
"links": [
{
"text": "方库·按古籍统计",
"path": "m01-database/index.html"
},
{
"text": "采集规范",
"path": "m01-database/docs/数据采集与标注规范.md"
}
]
},
{
"id": "M01-02",
"module": "M01",
"moduleName": "数据库建设",
"sub": "数据来源",
"point": "药食同源目录入库",
"desc": "收录国家卫健委2024年8月发布的《药食同源目录》（106种）。",
"std": "目录106种物质完整入库，名称与官方目录逐一核对一致，可在系统中查询。",
"method": "数据核对",
"ref": "4.1(1)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "药食同源目录",
"path": "m01-database/index.html#yaoshi"
}
]
},
{
"id": "M01-03",
"module": "M01",
"moduleName": "数据库建设",
"sub": "数据来源",
"point": "药膳制作规范",
"desc": "依据《药膳制作通用规范》。",
"std": "“制作方法”字段的工艺描述符合《药膳制作通用规范》要求，并在采集规范中引用。",
"method": "文档审查+数据抽检",
"ref": "4.1(1)",
"level": "必选",
"stage": "终验",
"owner": "甲方、乙方",
"links": [
{
"text": "设计说明书",
"path": "m01-database/docs/数据库设计说明书.md"
},
{
"text": "采集规范",
"path": "m01-database/docs/数据采集与标注规范.md"
}
]
},
{
"id": "M01-04",
"module": "M01",
"moduleName": "数据库建设",
"sub": "数据来源",
"point": "现代研究文献",
"desc": "收录中国知网等数据库中的方剂演变、药膳现代研究论文。",
"std": "“现代研究”字段可关联论文题录（题名、作者、刊名、年份、链接）及研究摘要。",
"method": "演示+数据抽检",
"ref": "4.1(1)",
"level": "必选",
"stage": "终验",
"owner": "甲方、乙方",
"links": [
{
"text": "方剂详情·现代研究",
"path": "m02-user/detail.html?id=YS0001"
},
{
"text": "录入表单",
"path": "m03-admin/recipes.html"
}
]
},
{
"id": "M01-05",
"module": "M01",
"moduleName": "数据库建设",
"sub": "字段设计",
"point": "13个必备字段",
"desc": "至少包含：方名、出处、组成、功效、适用年龄、适用体质、调补脏腑、适用节气、药食同源应用、制作方法、注意事项、现代研究、数据来源。",
"std": "13个字段全部具备，逐项核验结果见《数据库字段核验》表。",
"method": "文档审查+演示",
"ref": "4.1(2)、5.2",
"level": "★考核项",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "字段说明",
"path": "m01-database/index.html#fields"
},
{
"text": "设计说明书",
"path": "m01-database/docs/数据库设计说明书.md"
}
]
},
{
"id": "M01-06",
"module": "M01",
"moduleName": "数据库建设",
"sub": "字段设计",
"point": "字段取值标准化",
"desc": "体质、脏腑、节气、药食同源等字段采用统一标准值。",
"std": "适用体质限九种体质；调补脏腑为肝、心、脾、肺、肾；适用节气支持四季及二十四节气；药食同源字段为“是/否”并标注目录内物质；抽检无非标准取值。",
"method": "数据抽检",
"ref": "4.1(2)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "标准字典",
"path": "m01-database/index.html#dict"
},
{
"text": "录入校验",
"path": "m03-admin/recipes.html"
}
]
},
{
"id": "M01-07",
"module": "M01",
"moduleName": "数据库建设",
"sub": "数据采集与录入",
"point": "数据录入模板",
"desc": "乙方负责开发数据录入模板。",
"std": "提供与数据库字段一致的录入模板（Excel/CSV）及填写说明。",
"method": "文档审查",
"ref": "4.1(3)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "录入模板",
"path": "m01-database/template/recipe-import-template.csv"
},
{
"text": "采集规范",
"path": "m01-database/docs/数据采集与标注规范.md"
}
]
},
{
"id": "M01-08",
"module": "M01",
"moduleName": "数据库建设",
"sub": "数据采集与录入",
"point": "批量导入",
"desc": "支持批量导入。",
"std": "按模板批量导入测试数据成功；格式错误的记录给出明确提示，且不影响其他记录导入。",
"method": "功能测试",
"ref": "4.1(3)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "批量导入",
"path": "m03-admin/recipes.html"
}
]
},
{
"id": "M01-09",
"module": "M01",
"moduleName": "数据库建设",
"sub": "数据采集与录入",
"point": "在线编辑",
"desc": "支持在线编辑。",
"std": "管理端可在线新增、修改药膳方各字段并保存成功。",
"method": "功能测试",
"ref": "4.1(3)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "在线编辑",
"path": "m03-admin/recipes.html"
}
]
},
{
"id": "M01-10",
"module": "M01",
"moduleName": "数据库建设",
"sub": "数据采集与录入",
"point": "版本管理",
"desc": "支持版本管理。",
"std": "每次修改保留历史版本（修改人、时间、内容），可查看并恢复历史版本。",
"method": "功能测试",
"ref": "4.1(3)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "历史版本",
"path": "m03-admin/recipes.html"
}
]
},
{
"id": "M01-11",
"module": "M01",
"moduleName": "数据库建设",
"sub": "数据采集与录入",
"point": "数字化处理与清洗标注",
"desc": "甲方文献团队负责古籍查阅与初步整理，乙方负责数字化处理、清洗、标准化标注。",
"std": "按《药膳方数据采集与标注规范》完成处理；无重复方剂；药材、食材名称及用量单位规范统一。",
"method": "数据抽检",
"ref": "4.1(3)",
"level": "必选",
"stage": "终验",
"owner": "甲方、乙方",
"links": [
{
"text": "采集规范",
"path": "m01-database/docs/数据采集与标注规范.md"
},
{
"text": "方库",
"path": "m01-database/index.html"
}
]
},
{
"id": "M01-12",
"module": "M01",
"moduleName": "数据库建设",
"sub": "数据采集与录入",
"point": "专家审核",
"desc": "数据录入后由甲方组织专家审核，确保准确性。",
"std": "系统记录每首方剂的审核状态（待审核/通过/驳回）及审核人；用户端仅展示审核通过的方剂；提供专家审核记录。",
"method": "演示+文档审查",
"ref": "4.1(3)",
"level": "★考核项",
"stage": "终验",
"owner": "甲方",
"links": [
{
"text": "待审核列表",
"path": "m03-admin/recipes.html?status=pending"
}
]
},
{
"id": "M01-13",
"module": "M01",
"moduleName": "数据库建设",
"sub": "数据规模与质量",
"point": "药膳方收录数量",
"desc": "含不少于专家审核通过的药膳方，具体数量以任务书及专家论证为准。",
"std": "审核通过的方剂数量 ≥ 任务书/专家论证确定的数量（______首，由甲方填写）。",
"method": "数据统计",
"ref": "5.1",
"level": "★考核项",
"stage": "终验",
"owner": "甲方、乙方",
"links": [
{
"text": "方库统计",
"path": "m01-database/index.html"
}
]
},
{
"id": "M01-14",
"module": "M01",
"moduleName": "数据库建设",
"sub": "数据规模与质量",
"point": "40方标准化打样",
"desc": "其中完成40方标准化打样。",
"std": "40首方剂完成标准化打样，每方有标准化记录（组成及用量、制作工艺、成品照片等）。",
"method": "文档审查+抽检",
"ref": "5.1",
"level": "★考核项",
"stage": "终验",
"owner": "甲方、乙方",
"links": [
{
"text": "打样统计",
"path": "m01-database/index.html"
},
{
"text": "打样登记",
"path": "m03-admin/recipes.html"
}
]
},
{
"id": "M01-15",
"module": "M01",
"moduleName": "数据库建设",
"sub": "数据规模与质量",
"point": "数据准确性",
"desc": "字段完整，数据准确。",
"std": "随机抽检（建议不少于10%且不少于20首）：字段无缺漏，内容与古籍原文及来源一致（建议准确率≥95%，由双方确认）。",
"method": "专家抽检",
"ref": "5.2",
"level": "★考核项",
"stage": "终验",
"owner": "甲方",
"links": [
{
"text": "方库",
"path": "m01-database/index.html"
},
{
"text": "导出 CSV",
"path": "m03-admin/recipes.html"
}
]
},
{
"id": "M02-01",
"module": "M02",
"moduleName": "推荐系统-用户端",
"sub": "体质辨识",
"point": "体质问卷与判定",
"desc": "提供标准化中医体质问卷（九种体质），自动判定体质类型。",
"std": "问卷可完整作答并自动计分；九种体质均能被正确判定（见《推荐覆盖测试》A组）；文档注明问卷所依据的标准。",
"method": "功能测试",
"ref": "4.2(1)",
"level": "★考核项",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "体质测评",
"path": "m02-user/constitution.html"
},
{
"text": "A 组测试",
"path": "m04-engine/index.html"
}
]
},
{
"id": "M02-02",
"module": "M02",
"moduleName": "推荐系统-用户端",
"sub": "节气选择",
"point": "默认当前节气",
"desc": "默认当前节气。",
"std": "进入系统时自动显示当天所属节气，与当年节气日期一致（见《推荐覆盖测试》R5）。",
"method": "功能测试",
"ref": "4.2(1)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "用户端首页",
"path": "m02-user/index.html"
},
{
"text": "推荐页",
"path": "m02-user/recommend.html"
}
]
},
{
"id": "M02-03",
"module": "M02",
"moduleName": "推荐系统-用户端",
"sub": "节气选择",
"point": "手动切换节气",
"desc": "可手动切换节气。",
"std": "可切换至二十四节气中任一节气，推荐结果随之更新（见《推荐覆盖测试》B组）。",
"method": "功能测试",
"ref": "4.2(1)、5.2",
"level": "★考核项",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "推荐页",
"path": "m02-user/recommend.html"
},
{
"text": "B 组测试",
"path": "m04-engine/index.html"
}
]
},
{
"id": "M02-04",
"module": "M02",
"moduleName": "推荐系统-用户端",
"sub": "脏腑调理",
"point": "脏腑选择",
"desc": "选择需调理的脏腑（肝、心、脾、肺、肾）。",
"std": "五脏均可选择，推荐结果随之更新（见《推荐覆盖测试》C组）。",
"method": "功能测试",
"ref": "4.2(1)、5.2",
"level": "★考核项",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "推荐页",
"path": "m02-user/recommend.html"
},
{
"text": "C 组测试",
"path": "m04-engine/index.html"
}
]
},
{
"id": "M02-05",
"module": "M02",
"moduleName": "推荐系统-用户端",
"sub": "三餐四季推荐",
"point": "三餐方案",
"desc": "根据体质、节气、脏腑，自动生成早餐、午餐、晚餐药膳方案。",
"std": "输入体质、节气、脏腑后生成早、中、晚三餐方案，方剂标签与输入条件匹配。",
"method": "功能测试",
"ref": "4.2(1)",
"level": "★考核项",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "三餐推荐",
"path": "m02-user/recommend.html"
}
]
},
{
"id": "M02-06",
"module": "M02",
"moduleName": "推荐系统-用户端",
"sub": "三餐四季推荐",
"point": "四季方案",
"desc": "生成四季药膳方案。",
"std": "可生成春、夏、秋、冬四季药膳方案。",
"method": "功能测试",
"ref": "4.2(1)",
"level": "★考核项",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "四季方案",
"path": "m02-user/recommend.html?mode=season"
}
]
},
{
"id": "M02-07",
"module": "M02",
"moduleName": "推荐系统-用户端",
"sub": "三餐四季推荐",
"point": "推荐结果内容",
"desc": "方案包含方名、组成、功效、制作方法、药食同源标识。",
"std": "每条推荐结果均显示上述5项信息，药食同源标识清晰可辨。",
"method": "功能测试",
"ref": "4.2(1)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "三餐推荐",
"path": "m02-user/recommend.html"
}
]
},
{
"id": "M02-08",
"module": "M02",
"moduleName": "推荐系统-用户端",
"sub": "药膳详情",
"point": "详情页",
"desc": "查看古籍出处、现代研究、注意事项。",
"std": "详情页显示古籍出处（书名、卷次、篇目）、现代研究、注意事项（禁忌、慎用人群）。",
"method": "功能测试",
"ref": "4.2(1)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "药膳详情",
"path": "m02-user/detail.html?id=YS0001"
}
]
},
{
"id": "M02-09",
"module": "M02",
"moduleName": "推荐系统-用户端",
"sub": "科普展示",
"point": "科普内容",
"desc": "药膳文化、治未病知识、视频/图文内容。",
"std": "可浏览药膳文化、治未病知识栏目，图文正常展示、视频正常播放。",
"method": "功能测试",
"ref": "4.2(1)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "科普",
"path": "m02-user/science.html"
}
]
},
{
"id": "M02-10",
"module": "M02",
"moduleName": "推荐系统-用户端",
"sub": "收藏与分享",
"point": "收藏",
"desc": "用户可收藏方案。",
"std": "可收藏、取消收藏，“我的收藏”列表可查看。",
"method": "功能测试",
"ref": "4.2(1)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "收藏",
"path": "m02-user/favorites.html"
}
]
},
{
"id": "M02-11",
"module": "M02",
"moduleName": "推荐系统-用户端",
"sub": "收藏与分享",
"point": "分享",
"desc": "分享至微信等。",
"std": "方案可分享给微信好友/群，接收方可正常打开。",
"method": "功能测试",
"ref": "4.2(1)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "分享（推荐页）",
"path": "m02-user/recommend.html"
}
]
},
{
"id": "M03-01",
"module": "M03",
"moduleName": "推荐系统-管理端",
"sub": "药膳方管理",
"point": "增删改查",
"desc": "药膳方增删改查。",
"std": "可新增、删除、修改药膳方，并按字段条件检索。",
"method": "功能测试",
"ref": "4.2(2)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "药膳方管理",
"path": "m03-admin/recipes.html"
}
]
},
{
"id": "M03-02",
"module": "M03",
"moduleName": "推荐系统-管理端",
"sub": "药膳方管理",
"point": "审核与发布",
"desc": "药膳方审核、发布。",
"std": "具备“录入→审核→发布”流程；未发布方剂不在用户端展示；已发布方剂可下架。",
"method": "功能测试",
"ref": "4.2(2)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "审核发布",
"path": "m03-admin/recipes.html"
}
]
},
{
"id": "M03-03",
"module": "M03",
"moduleName": "推荐系统-管理端",
"sub": "用户管理",
"point": "体质数据统计",
"desc": "体质数据统计。",
"std": "可查看用户列表；按九种体质统计用户分布（图表或报表）。",
"method": "功能测试",
"ref": "4.2(2)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "用户与记录",
"path": "m03-admin/users.html"
}
]
},
{
"id": "M03-04",
"module": "M03",
"moduleName": "推荐系统-管理端",
"sub": "用户管理",
"point": "推荐记录",
"desc": "推荐记录。",
"std": "可按时间、用户查询推荐记录（输入条件、推荐方剂、时间）。",
"method": "功能测试",
"ref": "4.2(2)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "推荐记录",
"path": "m03-admin/users.html"
}
]
},
{
"id": "M03-05",
"module": "M03",
"moduleName": "推荐系统-管理端",
"sub": "推荐规则配置",
"point": "匹配规则配置",
"desc": "体质-脏腑-节气-药食同源匹配规则配置。",
"std": "管理员可新增、修改、停用规则；修改后用户端推荐结果按新规则生效。",
"method": "功能测试",
"ref": "4.2(2)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "规则配置",
"path": "m03-admin/rules.html"
}
]
},
{
"id": "M03-06",
"module": "M03",
"moduleName": "推荐系统-管理端",
"sub": "数据统计",
"point": "运营统计",
"desc": "访问量、推荐次数、热门方剂。",
"std": "可按时间段查看访问量、推荐次数、热门方剂排行，数据与实际操作一致。",
"method": "功能测试",
"ref": "4.2(2)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "数据统计",
"path": "m03-admin/stats.html"
}
]
},
{
"id": "M03-07",
"module": "M03",
"moduleName": "推荐系统-管理端",
"sub": "内容管理",
"point": "科普内容管理",
"desc": "科普文章、宣教资料。",
"std": "可发布、编辑、下架科普文章与宣教资料（图文、视频），用户端同步更新。",
"method": "功能测试",
"ref": "4.2(2)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "内容管理",
"path": "m03-admin/content.html"
}
]
},
{
"id": "M04-01",
"module": "M04",
"moduleName": "推荐算法",
"sub": "算法方案",
"point": "规则引擎+标签匹配",
"desc": "采用“规则引擎+标签匹配”方式，降低开发成本与复杂度。",
"std": "提供算法说明文档（标签体系、规则结构、匹配与排序逻辑），实际实现与文档一致。",
"method": "文档审查+演示",
"ref": "4.2(3)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "算法说明",
"path": "m04-engine/算法说明.md"
},
{
"text": "算法测试台",
"path": "m04-engine/index.html"
}
]
},
{
"id": "M04-02",
"module": "M04",
"moduleName": "推荐算法",
"sub": "算法方案",
"point": "理论依据",
"desc": "基于中医体质学说、脏腑学说、五行学说及“三应”原则（应时、应地、应体）。",
"std": "规则体系体现应时（节气）、应体（体质）、应地（地域）及五行（五色、五味与五脏对应）；规则经甲方专家确认。",
"method": "文档审查+专家评审",
"ref": "三.2",
"level": "必选",
"stage": "初验",
"owner": "甲方、乙方",
"links": [
{
"text": "当前规则",
"path": "m04-engine/index.html"
},
{
"text": "算法说明",
"path": "m04-engine/算法说明.md"
}
]
},
{
"id": "M04-03",
"module": "M04",
"moduleName": "推荐算法",
"sub": "典型规则",
"point": "春季+肝+气郁质",
"desc": "春季+肝+气郁体质 → 推荐疏肝理气、酸味青色食材药膳。",
"std": "推荐结果符合规则（见《推荐覆盖测试》R1）。",
"method": "功能测试",
"ref": "4.2(3)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "覆盖测试 R1",
"path": "m04-engine/index.html"
}
]
},
{
"id": "M04-04",
"module": "M04",
"moduleName": "推荐算法",
"sub": "典型规则",
"point": "冬季+肾+阳虚质",
"desc": "冬季+肾+阳虚体质 → 推荐温补肾阳、黑色食材药膳。",
"std": "推荐结果符合规则（见《推荐覆盖测试》R2）。",
"method": "功能测试",
"ref": "4.2(3)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "覆盖测试 R2",
"path": "m04-engine/index.html"
}
]
},
{
"id": "M04-05",
"module": "M04",
"moduleName": "推荐算法",
"sub": "典型规则",
"point": "老年+脾+气虚质",
"desc": "老年+脾+气虚体质 → 推荐健脾益气、易消化药膳。",
"std": "系统可采集年龄段信息；推荐结果符合规则（见《推荐覆盖测试》R3）。",
"method": "功能测试",
"ref": "4.2(3)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "覆盖测试 R3",
"path": "m04-engine/index.html"
}
]
},
{
"id": "M04-06",
"module": "M04",
"moduleName": "推荐算法",
"sub": "安全合规",
"point": "药食同源合规过滤",
"desc": "结合《药食同源目录》过滤非合规药材，确保安全。",
"std": "推荐结果不含目录外物质（或按甲方确认的规则明确标注）；含目录外物质的测试方剂被正确过滤（见《推荐覆盖测试》R4）。",
"method": "功能测试",
"ref": "4.2(3)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "覆盖测试 R4",
"path": "m04-engine/index.html"
},
{
"text": "方库·合规筛选",
"path": "m01-database/index.html"
}
]
},
{
"id": "M04-07",
"module": "M04",
"moduleName": "推荐算法",
"sub": "覆盖能力",
"point": "体质/节气/脏腑全覆盖",
"desc": "支持九种体质、二十四节气、五脏调理。",
"std": "9种体质、24个节气、5个脏腑的测试用例均返回有效推荐（《推荐覆盖测试》A/B/C组全部通过）。",
"method": "功能测试",
"ref": "5.2",
"level": "★考核项",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "覆盖测试 A/B/C 组",
"path": "m04-engine/index.html"
}
]
},
{
"id": "M04-08",
"module": "M04",
"moduleName": "推荐算法",
"sub": "安全合规",
"point": "禁忌提示",
"desc": "（建议项）方案要求数据库含“注意事项”字段，建议在推荐结果中同步提示。",
"std": "推荐结果中，存在禁忌、慎用人群的方剂给出明显提示。",
"method": "功能测试",
"ref": "4.1(2)",
"level": "建议",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "推荐卡片·注意事项",
"path": "m02-user/recommend.html"
}
]
},
{
"id": "M05-01",
"module": "M05",
"moduleName": "系统集成与部署",
"sub": "技术架构",
"point": "B/S架构与技术栈",
"desc": "B/S架构，前端支持微信小程序/H5，后端采用Java/Python，数据库MySQL/PostgreSQL。",
"std": "部署文档中的架构与实际一致；技术栈符合方案要求（如有变更需双方书面确认）。",
"method": "文档审查+现场核验",
"ref": "4.3",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "架构与文档",
"path": "m05-deploy/index.html"
},
{
"text": "部署文档",
"path": "m05-deploy/部署文档.md"
}
]
},
{
"id": "M05-02",
"module": "M05",
"moduleName": "系统集成与部署",
"sub": "技术架构",
"point": "微信小程序/H5",
"desc": "前端支持微信小程序/H5。",
"std": "用户端以微信小程序和/或H5形式上线，可正常访问使用。",
"method": "现场核验",
"ref": "4.3",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "用户端",
"path": "m02-user/index.html"
}
]
},
{
"id": "M05-03",
"module": "M05",
"moduleName": "系统集成与部署",
"sub": "部署上线",
"point": "环境搭建与上线",
"desc": "优先采用云服务器（阿里云/腾讯云），或部署至医院内网服务器；数据库部署在甲方指定服务器或云平台；乙方负责环境搭建、系统上线。",
"std": "系统部署在甲方指定环境并正式上线；建议服务器、域名、小程序等账号归属甲方。",
"method": "现场核验",
"ref": "4.3、4.1(4)",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "部署文档",
"path": "m05-deploy/部署文档.md"
}
]
},
{
"id": "M05-04",
"module": "M05",
"moduleName": "系统集成与部署",
"sub": "接口预留",
"point": "数据接口",
"desc": "预留与医院互联网医院平台、社区长者食堂系统、中医数智化产品的数据接口。",
"std": "提供接口文档（地址、参数、返回值、鉴权方式）；使用接口测试工具可成功调用。",
"method": "文档审查+接口测试",
"ref": "4.3",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "接口演示",
"path": "m05-deploy/index.html"
},
{
"text": "接口文档",
"path": "m05-deploy/接口文档.md"
}
]
},
{
"id": "M05-05",
"module": "M05",
"moduleName": "系统集成与部署",
"sub": "兼容性",
"point": "PC/移动端自适应",
"desc": "支持PC端、移动端自适应。",
"std": "在PC主流浏览器及iOS、Android手机（含微信内）下页面布局正常、功能可用。",
"method": "兼容性测试",
"ref": "4.3",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "兼容性自检",
"path": "m05-deploy/index.html"
}
]
},
{
"id": "M05-06",
"module": "M05",
"moduleName": "系统集成与部署",
"sub": "性能",
"point": "响应时间",
"desc": "响应时间<3秒。",
"std": "推荐请求响应时间<3秒（见《推荐覆盖测试》实测记录及测试报告）。",
"method": "性能测试",
"ref": "5.2",
"level": "★考核项",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "覆盖测试·响应时间",
"path": "m04-engine/index.html"
}
]
},
{
"id": "M05-07",
"module": "M05",
"moduleName": "系统集成与部署",
"sub": "运行稳定性",
"point": "试运行",
"desc": "初验（系统上线）后试运行1—3个月。",
"std": "试运行期间系统稳定运行、无数据丢失；故障及时响应处理（响应时限由双方约定）。",
"method": "运行记录核查",
"ref": "5.2",
"level": "必选",
"stage": "试运行",
"owner": "乙方",
"links": [
{
"text": "部署文档·试运行",
"path": "m05-deploy/部署文档.md"
}
]
},
{
"id": "M06-01",
"module": "M06",
"moduleName": "数据安全与合规",
"sub": "权限管理",
"point": "角色权限",
"desc": "系统需具备权限管理功能。",
"std": "按角色（如管理员、录入员、审核专家）分配权限；越权操作被拒绝。",
"method": "安全测试",
"ref": "4.1(4)、八.3",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "管理端登录",
"path": "m03-admin/index.html"
},
{
"text": "权限矩阵",
"path": "m06-security/index.html"
}
]
},
{
"id": "M06-02",
"module": "M06",
"moduleName": "数据安全与合规",
"sub": "操作日志",
"point": "日志记录",
"desc": "系统需具备操作日志功能。",
"std": "登录、增删改、审核、发布等操作均有日志（操作人、时间、对象、内容），可查询。",
"method": "功能测试",
"ref": "4.1(4)、八.3",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "操作日志",
"path": "m06-security/logs.html"
}
]
},
{
"id": "M06-03",
"module": "M06",
"moduleName": "数据安全与合规",
"sub": "数据备份",
"point": "自动备份与恢复",
"desc": "系统需具备自动备份功能。",
"std": "已配置自动备份策略（频率、保留周期）；现场完成一次备份恢复演练。",
"method": "现场核验",
"ref": "4.1(4)、八.3",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "备份与恢复",
"path": "m06-security/backup.html"
}
]
},
{
"id": "M06-04",
"module": "M06",
"moduleName": "数据安全与合规",
"sub": "数据合规",
"point": "不存储患者信息",
"desc": "敏感数据（如患者信息）不得入库，仅存储药膳方公开数据；不得存储患者个人信息。",
"std": "数据库表结构中无病历、身份证号等患者敏感字段；抽查数据无患者信息。",
"method": "数据库审查",
"ref": "4.1(4)、八.3",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "设计说明书 第6节",
"path": "m01-database/docs/数据库设计说明书.md"
},
{
"text": "安全说明",
"path": "m06-security/安全说明.md"
}
]
},
{
"id": "M06-05",
"module": "M06",
"moduleName": "数据安全与合规",
"sub": "数据合规",
"point": "个人信息保护",
"desc": "遵守《数据安全法》《个人信息保护法》。",
"std": "用户端收集信息遵循最小必要原则；提供隐私政策并取得用户同意。",
"method": "文档审查+演示",
"ref": "八.3",
"level": "必选",
"stage": "初验",
"owner": "乙方",
"links": [
{
"text": "隐私政策",
"path": "m06-security/privacy.html"
},
{
"text": "用户端知情同意",
"path": "m02-user/index.html"
}
]
},
{
"id": "M07-01",
"module": "M07",
"moduleName": "推广与应用",
"sub": "场景部署",
"point": "社区",
"desc": "在社区场景部署推荐系统。",
"std": "至少1个社区点位上线使用，有部署记录及证明材料（见《推广场景记录》）。",
"method": "现场核验+材料审查",
"ref": "4.4、5.2",
"level": "★考核项",
"stage": "终验",
"owner": "甲方、乙方",
"links": [
{
"text": "推广中心",
"path": "m07-promotion/index.html"
}
]
},
{
"id": "M07-02",
"module": "M07",
"moduleName": "推广与应用",
"sub": "场景部署",
"point": "长者食堂",
"desc": "在长者食堂场景部署推荐系统。",
"std": "至少1个长者食堂点位上线使用，有部署记录及证明材料（见《推广场景记录》）。",
"method": "现场核验+材料审查",
"ref": "4.4、5.2",
"level": "★考核项",
"stage": "终验",
"owner": "甲方、乙方",
"links": [
{
"text": "推广中心",
"path": "m07-promotion/index.html"
}
]
},
{
"id": "M07-03",
"module": "M07",
"moduleName": "推广与应用",
"sub": "场景部署",
"point": "食养机构/中医数智化产品",
"desc": "在食养机构或中医数智化产品场景部署应用。",
"std": "至少1个食养机构点位上线或1个数智化产品接入，有部署记录及证明材料（见《推广场景记录》）。",
"method": "现场核验+材料审查",
"ref": "4.4、5.2",
"level": "★考核项",
"stage": "终验",
"owner": "甲方、乙方",
"links": [
{
"text": "推广中心",
"path": "m07-promotion/index.html"
},
{
"text": "接口演示",
"path": "m05-deploy/index.html"
}
]
},
{
"id": "M07-04",
"module": "M07",
"moduleName": "推广与应用",
"sub": "部署形式",
"point": "扫码/触摸屏终端",
"desc": "如扫码使用、触摸屏终端。",
"std": "提供扫码入口（二维码）；如采用触摸屏终端，终端运行正常。",
"method": "现场核验",
"ref": "4.4",
"level": "必选",
"stage": "试运行",
"owner": "乙方",
"links": [
{
"text": "二维码海报",
"path": "m07-promotion/index.html"
},
{
"text": "触摸屏模式",
"path": "m07-promotion/kiosk.html"
}
]
},
{
"id": "M07-05",
"module": "M07",
"moduleName": "推广与应用",
"sub": "培训",
"point": "系统操作培训",
"desc": "提供系统操作培训。",
"std": "完成对甲方及应用场景工作人员的操作培训，提供培训课件、签到表。",
"method": "材料审查",
"ref": "4.4、6.2",
"level": "必选",
"stage": "试运行",
"owner": "乙方",
"links": [
{
"text": "操作手册",
"path": "m07-promotion/操作手册.md"
},
{
"text": "培训课件大纲",
"path": "m07-promotion/培训课件大纲.md"
}
]
},
{
"id": "M07-06",
"module": "M07",
"moduleName": "推广与应用",
"sub": "推广支持",
"point": "推广物料与使用成效",
"desc": "提供推广物料技术支持；通过线上线下渠道推广应用，发挥中医药健康科普功能。",
"std": "提供二维码、操作指引等物料技术内容；提交推广期使用数据（访问量、推荐次数等）统计。",
"method": "材料审查+数据核查",
"ref": "4.4、三.3",
"level": "必选",
"stage": "终验",
"owner": "甲方、乙方",
"links": [
{
"text": "推广中心",
"path": "m07-promotion/index.html"
},
{
"text": "数据统计",
"path": "m03-admin/stats.html"
}
]
},
{
"id": "M08-01",
"module": "M08",
"moduleName": "知识产权与保密",
"sub": "软件著作权",
"point": "软著申请1项",
"desc": "协助申请数据库相关知识产权/软件著作权1项，甲方为权利人。",
"std": "提交软著申请1项，权利人为上海市第七人民医院；取得受理通知书或登记证书。",
"method": "材料审查",
"ref": "三、5.2、八.1",
"level": "★考核项",
"stage": "终验",
"owner": "乙方协助",
"links": [
{
"text": "软著材料草稿",
"path": "m08-ip/软件著作权申请材料草稿.md"
}
]
},
{
"id": "M08-02",
"module": "M08",
"moduleName": "知识产权与保密",
"sub": "成果归属",
"point": "成果移交",
"desc": "数据库、推荐系统软件著作权归甲方所有，乙方不得擅自使用、复制、转让。",
"std": "合同明确归属条款；源代码、数据库、账号权限完整移交甲方。",
"method": "合同与材料审查",
"ref": "八.1",
"level": "必选",
"stage": "终验",
"owner": "乙方",
"links": [
{
"text": "成果归属与保密",
"path": "m08-ip/成果归属与保密要点.md"
}
]
},
{
"id": "M08-03",
"module": "M08",
"moduleName": "知识产权与保密",
"sub": "保密",
"point": "保密义务",
"desc": "乙方对甲方提供的古籍文献、数据、业务信息负有保密义务，保密期至项目结束后5年。",
"std": "签订保密条款/协议；项目期间无信息泄露事件。",
"method": "合同审查",
"ref": "八.2",
"level": "必选",
"stage": "终验",
"owner": "乙方",
"links": [
{
"text": "成果归属与保密",
"path": "m08-ip/成果归属与保密要点.md"
}
]
},
{
"id": "M09-01",
"module": "M09",
"moduleName": "项目过程管理",
"sub": "沟通机制",
"point": "周例会",
"desc": "周例会：乙方汇报进度，甲方反馈需求。",
"std": "有周例会记录/纪要。",
"method": "材料审查",
"ref": "6.3",
"level": "必选",
"stage": "终验",
"owner": "乙方",
"links": [
{
"text": "周例会纪要模板",
"path": "m09-management/周例会纪要模板.md"
}
]
},
{
"id": "M09-02",
"module": "M09",
"moduleName": "项目过程管理",
"sub": "沟通机制",
"point": "月度报告",
"desc": "月度报告：提交进度、风险、问题。",
"std": "按月提交月度报告。",
"method": "材料审查",
"ref": "6.3",
"level": "必选",
"stage": "终验",
"owner": "乙方",
"links": [
{
"text": "月度报告模板",
"path": "m09-management/月度报告模板.md"
}
]
},
{
"id": "M09-03",
"module": "M09",
"moduleName": "项目过程管理",
"sub": "变更管理",
"point": "需求变更确认",
"desc": "需求变更需双方书面确认。",
"std": "所有需求变更均有双方签字的书面确认单。",
"method": "材料审查",
"ref": "6.3",
"level": "必选",
"stage": "终验",
"owner": "甲方、乙方",
"links": [
{
"text": "需求变更确认单",
"path": "m09-management/需求变更确认单.md"
}
]
}
]
};
