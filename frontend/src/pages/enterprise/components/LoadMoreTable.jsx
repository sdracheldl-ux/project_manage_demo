import { useState, useEffect } from 'react'
import { Table, Button } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { COLORS } from '../../../constants/uiStyles'

/**
 * 「点击加载更多」无限滚动表格（沿参考项目交互）
 * dataSource 传全量数据，内部按 pageSize 递增展示；加载完毕按钮自动隐藏
 * 空数组时返回 null（由 SectionWrapper 的 empty 状态统一渲染空文案）
 */
export default function LoadMoreTable({ columns, dataSource, pageSize = 10, rowKey = 'key', scrollX, size = 'small' }) {
  const [visibleCount, setVisibleCount] = useState(pageSize)

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [dataSource, pageSize])

  if (!dataSource || dataSource.length === 0) return null

  const visible = dataSource.slice(0, visibleCount)
  const hasMore = visibleCount < dataSource.length

  return (
    <div>
      <Table
        columns={columns}
        dataSource={visible.map((item, i) => ({ ...item, key: item.key || item.id || i, index: i + 1 }))}
        rowKey={rowKey}
        size={size}
        pagination={false}
        tableLayout="fixed"
        scroll={scrollX ? { x: scrollX } : undefined}
      />
      {hasMore && (
        <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
          <Button
            type="text"
            icon={<DownOutlined />}
            onClick={() => setVisibleCount((c) => c + pageSize)}
            style={{ color: COLORS.primary, fontSize: 13 }}
          >
            点击加载更多（{dataSource.length - visibleCount}）
          </Button>
        </div>
      )}
    </div>
  )
}
