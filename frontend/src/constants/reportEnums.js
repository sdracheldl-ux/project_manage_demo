/** 产业研报枚举常量 */

export const REPORT_AGENTS = [
  { value: 'industry-expert', label: '产业研报专家' },
  { value: 'market-analyst', label: '市场分析助手' },
]

export const REPORT_STATUS_MAP = {
  draft: { label: '草稿', color: 'default' },
  published: { label: '已发布', color: 'success' },
}

/** 基础大纲（用户未提供各部分标题、要点时使用） */
export const BASE_OUTLINE = [
  {
    title: '第一部分：基本情况',
    points: ['产业定义与技术原理', '发展现状与市场规模', '面临的问题、困境与挑战'],
  },
  {
    title: '第二部分：产业链情况',
    points: ['上中下游结构', '重点企业竞争格局'],
  },
  {
    title: '第三部分：发展趋势',
    points: ['技术路线演进', '市场需求变化', '政策导向'],
  },
  {
    title: '第四部分：光谷发展建议',
    points: ['本区产业基础分析', '招商方向与政策建议'],
  },
]

/**
 * 解析用户输入中的结构，生成大纲
 * 输入形如：第一部分：[板块标题]；[要点1]；[要点2]
 * 未识别到「第X部分」结构时，返回基础大纲
 * variant > 0 时基础大纲追加一个板块，用于「重新生成」的差异化展示
 */
export function parseOutlineFromInput(text, variant = 0) {
  const src = String(text || '')
  const re = /第[一二三四五六七八九十百]+部分[：:]/g
  const marks = []
  let m
  while ((m = re.exec(src)) !== null) {
    marks.push({ prefix: m[0], start: m.index, bodyStart: m.index + m[0].length })
  }
  const sections = []
  marks.forEach((mk, i) => {
    const segEnd = i + 1 < marks.length ? marks[i + 1].start : src.length
    const parts = src
      .slice(mk.bodyStart, segEnd)
      .split(/[\n；;]/)
      .map((s) => s.trim())
      .filter((s) => s && !/^(整体要求|总体要求|其他要求|写作要求)[：:]/.test(s))
    const head = parts.shift() || ''
    if (!head) return
    sections.push({ title: mk.prefix + head, points: parts })
  })
  if (sections.length) return sections
  if (variant > 0) {
    return [
      ...BASE_OUTLINE,
      {
        title: '第五部分：风险提示与后续跟进',
        points: ['主要风险因素', '建议的后续跟进机制'],
      },
    ]
  }
  return BASE_OUTLINE
}

/** HTML 转义 */
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * 按已确认的大纲生成正文 HTML 分段
 * 每段为一个完整 HTML 块，用于逐部分流式输出
 */
export function getMockContentBlocks(sections) {
  const list = sections && sections.length ? sections : BASE_OUTLINE
  const blocks = []
  list.forEach((s) => {
    const plainTitle = String(s.title || '').replace(/^第[一二三四五六七八九十百]+部分[：:]/, '')
    blocks.push(`<h2>${escapeHtml(s.title)}</h2>`)
    blocks.push(
      `<p>本部分围绕${escapeHtml(plainTitle)}展开分析。结合公开资料与产业调研情况，${escapeHtml(plainTitle)}整体呈现结构清晰、要素集聚的特征，在市场规模、技术演进与区域布局等方面均取得阶段性进展。以下从关键维度对${escapeHtml(plainTitle)}作具体阐述。</p>`
    )
    const points = s.points || []
    if (points.length) {
      blocks.push(
        `<ul>${points.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul>`
      )
      blocks.push(
        `<p>上述要点反映出${escapeHtml(plainTitle)}的演进脉络与现实约束，相关数据来源于公开统计资料及行业研究机构发布内容，具体口径以官方发布为准。</p>`
      )
    }
  })
  blocks.push('<p>（武汉东湖新技术开发区投资促进局供稿）</p>')
  blocks.push('<p>报：委领导<br/>送：各园区、内设部门、国有企业</p>')
  return blocks
}

/** AI 生成的 mock 模板 */
export function getMockTemplate(genre, industry, period) {
  const p = period || '本期'
  const ind = industry || '该产业'
  return `
<h2>一、${ind}产业概览</h2>
<p>本期（${p}）${ind}产业整体保持稳健增长态势。全球市场规模持续扩大，技术创新加速迭代，产业链上下游协同发展特征明显。据行业研究机构统计，本季度${ind}产业全球市场规模约达XXXX亿元，同比增长XX%。</p>
<h2>二、市场动态与竞争格局</h2>
<p>头部企业集中度持续提升。从全球竞争格局来看，中国企业市场份额稳步增长，在关键技术领域逐步实现突破。本季度值得关注的市场动态包括：</p>
<ul><li>龙头企业加速产能扩张，新产线建设进度超出预期</li><li>中小企业在细分赛道形成差异化竞争优势</li><li>产业链协同效应增强，上下游合作深化</li></ul>
<h2>三、政策与监管动向</h2>
<p>国家及地方层面密集出台支持${ind}产业发展的政策措施。国务院发布相关指导意见，明确产业发展方向和重点任务。多地出台配套政策，在资金、人才、土地等方面给予支持。</p>
<h2>四、本区产业链进展</h2>
<p>本区围绕${ind}持续强链补链，重点项目建设稳步推进。已形成从上游材料、中游制造到下游应用的完整产业链条，产业集聚效应逐步显现。本季度新增签约项目X个，总投资额XX亿元。</p>
<h2>五、风险提示与下季度展望</h2>
<p>需关注原材料价格波动、海外贸易摩擦加剧、技术路线切换等风险因素。展望下季度，${ind}产业有望延续增长态势，建议持续关注技术创新方向和产能布局机遇。</p>
`
}
