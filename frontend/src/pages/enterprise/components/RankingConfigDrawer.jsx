import { useEffect } from 'react'
import { Button, Drawer, Form, InputNumber, Radio, Slider, Checkbox, Tooltip, message } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { LOCAL_INDUSTRIES } from '../../../mock/hotIndustryData'

/** 表单标题 + 问号图标，hover 显示说明 */
function labelWithTip(text, tip) {
  return (
    <span>
      {text}
      <Tooltip title={tip}>
        <QuestionCircleOutlined style={{ marginLeft: 4, color: '#8c8c8c', fontSize: 12 }} />
      </Tooltip>
    </span>
  )
}

/**
 * 榜单规则配置抽屉（贴合 SOW：自定义生成规则、排名维度与筛选阈值）
 * - 排名维度：热度分 / 环比变化 —— 真实生效（榜单重新排序）
 * - 筛选阈值：最低热度分 —— 真实生效（低于阈值的产业不入选）
 * - 展示条数：TOP N —— 真实生效（榜单截断）
 * - 数据统计周期：近 1/3/6 月 —— 真实生效（趋势图 X 轴联动）
 * - 本区重点产业：13 个产业勾选 —— 真实生效（勾选的在趋势/资讯中展示）
 * - 线索推送范围 —— 保存回显（上线后对接推送通道）
 */

export const RANK_CONFIG_KEY = 'hot_rank_config_v2'

// 本区重点产业选项：三色图 13 个产业（固定）
const KEYWORD_OPTIONS = LOCAL_INDUSTRIES.map((i) => ({ value: i.name, label: i.name }))

// 线索推送范围：mock 角色（上线后对接真实组织架构）
const PUSH_ROLE_OPTIONS = [
  { value: 'front_investor', label: '投促局一线招商人员' },
  { value: 'park_investor', label: '园区招商人员' },
  { value: 'invest_leader', label: '投促局领导' },
  { value: 'district_leader', label: '区领导' },
]

export const DEFAULT_RANK_CONFIG = {
  sortKey: 'score', // 排名维度：score 热度分 / change 环比变化
  threshold: 50, // 筛选阈值：最低热度分
  keywords: LOCAL_INDUSTRIES.map((i) => i.name), // 本区重点产业（默认全选 13 个）
  period: 6, // 数据统计周期（月）
  topN: 10, // 榜单展示条数
  pushRoles: ['front_investor', 'park_investor'], // 线索推送范围
}

export function loadRankConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(RANK_CONFIG_KEY))
    return { ...DEFAULT_RANK_CONFIG, ...saved }
  } catch {
    return { ...DEFAULT_RANK_CONFIG }
  }
}

const SORT_OPTIONS = [
  { value: 'score', label: '热度分' },
  { value: 'change', label: '环比变化' },
]

const PERIOD_OPTIONS = [
  { value: 1, label: '近 1 月' },
  { value: 3, label: '近 3 月' },
  { value: 6, label: '近 6 月' },
]

export default function RankingConfigDrawer({ open, onClose, value, onSave }) {
  const [form] = Form.useForm()

  // 打开时回显当前配置
  useEffect(() => {
    if (open) {
      form.setFieldsValue(value)
    }
  }, [open, value, form])

  const handleSave = async () => {
    const values = await form.validateFields()
    onSave?.(values)
    message.success('规则已保存，榜单已按新规则重新生成')
    onClose()
  }

  const handleReset = () => {
    form.setFieldsValue(DEFAULT_RANK_CONFIG)
  }

  return (
    <Drawer
      title="榜单规则配置"
      placement="right"
      width={440}
      open={open}
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={handleReset}>重置默认</Button>
          <Button type="primary" onClick={handleSave}>保存并生成榜单</Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" initialValues={DEFAULT_RANK_CONFIG}>
        <Form.Item label="排名维度" name="sortKey">
          <Radio.Group options={SORT_OPTIONS} optionType="button" buttonStyle="solid" />
        </Form.Item>

        <Form.Item label="筛选阈值（最低热度分）" name="threshold">
          <Slider min={0} max={100} step={5} marks={{ 0: '0', 50: '50', 100: '100' }} style={{ margin: '0 8px' }} />
        </Form.Item>

        <Form.Item label="数据统计周期" name="period">
          <Radio.Group options={PERIOD_OPTIONS} optionType="button" buttonStyle="solid" />
        </Form.Item>

        <Form.Item label="榜单展示条数（TOP N）" name="topN">
          <InputNumber min={1} max={20} style={{ width: 120 }} />
        </Form.Item>

        <Form.Item
          label={labelWithTip('本区重点产业', '勾选的产业在本区趋势、本区资讯中展示，未勾选的不展示')}
          name="keywords"
        >
          <Checkbox.Group options={KEYWORD_OPTIONS} className="rank-cfg-keywords" />
        </Form.Item>

        <Form.Item
          label={labelWithTip('线索推送范围', '榜单更新后自动推送给所选角色')}
          name="pushRoles"
        >
          <Checkbox.Group options={PUSH_ROLE_OPTIONS} />
        </Form.Item>
      </Form>
    </Drawer>
  )
}
