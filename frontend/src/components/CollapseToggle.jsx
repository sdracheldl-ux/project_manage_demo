import { UpOutlined, DownOutlined } from '@ant-design/icons'

/**
 * 面板底部居中的折叠/展开按钮（白色梯形下凸）
 * 需配合 .collapse-panel 容器使用
 */
export default function CollapseToggle({ expanded, onClick }) {
  return (
    <div className="collapse-toggle" onClick={onClick}>
      {expanded ? <UpOutlined /> : <DownOutlined />}
    </div>
  )
}
