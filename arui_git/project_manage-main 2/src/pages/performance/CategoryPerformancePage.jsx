import { useState } from 'react'
import { Tabs } from 'antd'
import CurrentProgress from './CurrentProgress'
import Targets from './Targets'
import ProgressTracking from './ProgressTracking'
import ApprovalManagement from './ApprovalManagement'
import { perfPageBg } from '../../constants/performanceStyles'

/**
 * 分类考核页面（园区 / 国企 / 部门共用）
 * 页面左上角用 Tabs 切换：当前进展 / 目标设定 / 进展填报 / 审核管理
 * category: 'park' | 'soe' | 'dept'
 */
export default function CategoryPerformancePage({ category = 'park' }) {
  const [activeTab, setActiveTab] = useState('progress')

  const tabItems = [
    { key: 'progress', label: '当前进展' },
    { key: 'targets', label: '目标设定' },
    { key: 'progressSubmit', label: '进展填报' },
    { key: 'approval', label: '审核管理' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'progress':
        return <CurrentProgress category={category} />
      case 'targets':
        return <Targets category={category} hideTitle />
      case 'progressSubmit':
        return <ProgressTracking category={category} hideTitle />
      case 'approval':
        return <ApprovalManagement category={category} hideTitle />
      default:
        return null
    }
  }

  return (
    <div style={perfPageBg}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="middle"
          style={{ marginBottom: 0 }}
        />
      </div>
      {renderContent()}
    </div>
  )
}
