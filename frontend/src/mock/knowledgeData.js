/**
 * 知识库 mock 数据（引用知识库弹窗）
 * 结构：知识库文件夹 → 文档列表
 */

export const KNOWLEDGE_BASES = [
  {
    id: 'kb-gongwen',
    name: '公文写作知识库',
    desc: '公文写作知识库',
    count: 70,
  },
]

/** 文档列表：name 文档名、kbName 所属知识库、path 路径、updated 更新��间 */
export const KNOWLEDGE_DOCS = [
  { id: 'd1', name: '大尺寸OLED面板产业研究报告.docx', kbId: 'kb-gongwen', updated: '2026/11/02 16:33:36' },
  { id: 'd2', name: '关于做好2026年春节放假期间有关工作的通知.docx', kbId: 'kb-gongwen', updated: '2026/11/02 16:33:36' },
  { id: 'd3', name: '在武汉东湖新技术开发区四季度招商引资大会上的讲话.docx', kbId: 'kb-gongwen', updated: '2026/10/30 17:25:39' },
  { id: 'd4', name: '东湖高新区显示产业招商情况汇报.docx', kbId: 'kb-gongwen', updated: '2026/10/28 09:42:15' },
  { id: 'd5', name: '新型显示产业发展三年行动方案（2025-2027年）.docx', kbId: 'kb-gongwen', updated: '2026/10/25 14:08:50' },
  { id: 'd6', name: '关于支持新型显示产业发展的若干政策措施.docx', kbId: 'kb-gongwen', updated: '2026/10/22 10:31:27' },
  { id: 'd7', name: '光谷科技创新大走廊建设情况材料.docx', kbId: 'kb-gongwen', updated: '2026/10/18 16:52:03' },
  { id: 'd8', name: '2026年第三季度产业链招商分析报告.docx', kbId: 'kb-gongwen', updated: '2026/10/15 11:20:44' },
  { id: 'd9', name: '关于建立重点产业招商图谱工作机制的通知.docx', kbId: 'kb-gongwen', updated: '2026/10/11 09:05:12' },
  { id: 'd10', name: '半导体材料产业招商工作专班组建方案.docx', kbId: 'kb-gongwen', updated: '2026/10/08 17:12:38' },
  { id: 'd11', name: '东湖高新区产业链图谱绘制工作简报.docx', kbId: 'kb-gongwen', updated: '2026/10/06 15:38:29' },
  { id: 'd12', name: '关于加强产业人才引育工作的实施意见.docx', kbId: 'kb-gongwen', updated: '2026/09/29 10:44:51' },
]
