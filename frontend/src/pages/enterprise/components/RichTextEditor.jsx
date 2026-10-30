import { useRef, useEffect } from 'react'
import { Button, Tooltip, Divider, ColorPicker } from 'antd'
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  ClearOutlined,
  FontColorsOutlined,
} from '@ant-design/icons'

/**
 * 富文本编辑器（contentEditable + execCommand，零新增依赖）
 * 受控模式：仅当外部 value 与 DOM innerHTML 不一致时更新 DOM，避免光标跳动
 */
export default function RichTextEditor({ value, onChange, placeholder }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = value || ''
    }
  }, [value])

  const exec = (cmd, val) => {
    document.execCommand(cmd, false, val)
    ref.current?.focus()
    onChange?.(ref.current.innerHTML)
  }

  return (
    <div className="rpt-editor">
      <div className="rpt-editor-toolbar">
        <Tooltip title="加粗 (Ctrl+B)">
          <Button size="small" type="text" icon={<BoldOutlined />} onClick={() => exec('bold')} />
        </Tooltip>
        <Tooltip title="斜体">
          <Button size="small" type="text" icon={<ItalicOutlined />} onClick={() => exec('italic')} />
        </Tooltip>
        <Tooltip title="下划线">
          <Button size="small" type="text" icon={<UnderlineOutlined />} onClick={() => exec('underline')} />
        </Tooltip>
        <Divider type="vertical" />
        <Tooltip title="一级标题">
          <Button size="small" type="text" onClick={() => exec('formatBlock', '<H2>')}>H2</Button>
        </Tooltip>
        <Tooltip title="二级标题">
          <Button size="small" type="text" onClick={() => exec('formatBlock', '<H3>')}>H3</Button>
        </Tooltip>
        <Tooltip title="正文">
          <Button size="small" type="text" onClick={() => exec('formatBlock', '<P>')}>P</Button>
        </Tooltip>
        <Divider type="vertical" />
        <Tooltip title="无序列表">
          <Button size="small" type="text" icon={<UnorderedListOutlined />} onClick={() => exec('insertUnorderedList')} />
        </Tooltip>
        <Tooltip title="有序列表">
          <Button size="small" type="text" icon={<OrderedListOutlined />} onClick={() => exec('insertOrderedList')} />
        </Tooltip>
        <Divider type="vertical" />
        <ColorPicker onChange={(_, hex) => exec('foreColor', hex)}>
          <Tooltip title="文字颜色">
            <Button size="small" type="text" icon={<FontColorsOutlined />} />
          </Tooltip>
        </ColorPicker>
        <Tooltip title="清除格式">
          <Button size="small" type="text" icon={<ClearOutlined />} onClick={() => exec('removeFormat')} />
        </Tooltip>
      </div>
      <div
        ref={ref}
        className="rpt-editor-body"
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange?.(ref.current.innerHTML)}
        data-placeholder={placeholder || '请输入研报内容...'}
      />
    </div>
  )
}
