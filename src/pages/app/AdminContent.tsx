import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Check, ExternalLink, Loader2, Plus, RotateCcw, X } from 'lucide-react'
import { defaultContent, type SiteContent } from '../../content'
import { contentSpec, type Field, type SectionSpec } from '../../lib/contentSpec'
import { clearSiteContent, loadSiteContent, saveSiteContent } from '../../lib/siteContent'

type Row = Record<string, unknown>

export default function AdminContent() {
  const [draft, setDraft] = useState<SiteContent | null>(null)
  const [active, setActive] = useState(contentSpec[0].key)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadSiteContent()
      .then(setDraft)
      .catch((e) => setError(e instanceof Error ? e.message : '문구를 불러오지 못했습니다.'))
  }, [])

  const section = useMemo(
    () => contentSpec.find((s) => s.key === active) ?? contentSpec[0],
    [active],
  )

  if (!draft) {
    return (
      <p className="app-note">
        <Loader2 size={16} className="spin" /> 불러오는 중…
      </p>
    )
  }

  /** 섹션 안의 값을 읽고 씁니다. field.key 가 비어 있으면 섹션 값 자체를 가리킵니다. */
  function read(sec: SectionSpec, field: Field): unknown {
    const value = (draft as unknown as Record<string, unknown>)[sec.key]
    return field.key === '' ? value : (value as Record<string, unknown>)?.[field.key]
  }

  function write(sec: SectionSpec, field: Field, value: unknown) {
    setNote('')
    setDraft((prev) => {
      if (!prev) return prev
      const next = { ...(prev as unknown as Record<string, unknown>) }
      if (field.key === '') {
        next[sec.key] = value
      } else {
        next[sec.key] = { ...(next[sec.key] as Record<string, unknown>), [field.key]: value }
      }
      return next as unknown as SiteContent
    })
  }

  async function run(action: () => Promise<unknown>, done: string) {
    setBusy(true)
    setError('')
    try {
      await action()
      setNote(done)
    } catch (e) {
      setError(e instanceof Error ? e.message : '처리하지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="app-head">
        <h1>사이트 문구</h1>
        <div className="app-head-actions">
          <a className="btn btn-ghost btn-sm" href="/" target="_blank" rel="noreferrer">
            <ExternalLink size={14} />
            사이트 보기
          </a>
          <button
            className="btn btn-ghost btn-sm"
            disabled={busy}
            onClick={() => {
              if (!confirm('고친 문구를 모두 버리고 처음 상태로 되돌릴까요?')) return
              run(async () => {
                await clearSiteContent()
                setDraft(defaultContent)
              }, '처음 상태로 되돌렸습니다.')
            }}
          >
            <RotateCcw size={14} />
            처음으로
          </button>
          <button
            className="btn btn-primary btn-sm"
            disabled={busy}
            onClick={() => run(() => saveSiteContent(draft), '저장했습니다. 사이트에 바로 반영됩니다.')}
          >
            {busy ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
            저장
          </button>
        </div>
      </div>

      {error && <p className="app-error">{error}</p>}
      {note && <p className="app-note--ok">{note}</p>}

      <div className="content-editor">
        <nav className="content-nav">
          {contentSpec.map((spec) => (
            <button
              key={spec.key}
              className={spec.key === active ? 'is-active' : ''}
              onClick={() => setActive(spec.key)}
            >
              {spec.label}
            </button>
          ))}
        </nav>

        <div className="content-panel">
          <div className="content-panel-head">
            <h2>{section.label}</h2>
            {section.desc && <p>{section.desc}</p>}
          </div>

          {section.fields.map((field) => (
            <FieldEditor
              key={`${section.key}-${field.key}`}
              field={field}
              value={read(section, field)}
              onChange={(value) => write(section, field, value)}
            />
          ))}
        </div>
      </div>
    </>
  )
}

// ── 항목별 입력 ──────────────────────────────────────────────

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: Field
  value: unknown
  onChange: (value: unknown) => void
}) {
  if (field.kind === 'text' || field.kind === 'multiline') {
    return (
      <label className="field">
        <span className="field-label">{field.label}</span>
        {field.kind === 'text' ? (
          <input value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <textarea
            rows={4}
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
        {field.hint && <span className="app-hint">{field.hint}</span>}
      </label>
    )
  }

  if (field.kind === 'toggle') {
    return (
      <label className="app-toggle">
        <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
        <span>
          {field.label}
          {field.hint && <em> — {field.hint}</em>}
        </span>
      </label>
    )
  }

  if (field.kind === 'strings') {
    const items = Array.isArray(value) ? (value as string[]) : []
    return (
      <div className="field">
        <span className="field-label">{field.label}</span>
        {field.hint && <span className="app-hint">{field.hint}</span>}

        {items.map((item, i) => (
          <div className="app-choice-row" key={i}>
            <textarea
              rows={item.length > 60 ? 3 : 1}
              value={item}
              onChange={(e) => onChange(items.map((v, j) => (j === i ? e.target.value : v)))}
            />
            <button
              type="button"
              className="app-choice-del"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              title="삭제"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange([...items, ''])}>
          <Plus size={14} />
          추가
        </button>
      </div>
    )
  }

  // kind === 'rows'
  const rows = Array.isArray(value) ? (value as Row[]) : []

  function update(index: number, next: Row) {
    onChange(rows.map((row, i) => (i === index ? next : row)))
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= rows.length) return
    const next = [...rows]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="field">
      <span className="field-label">
        {field.label} <em>{rows.length}개</em>
      </span>
      {field.hint && <span className="app-hint">{field.hint}</span>}

      {rows.map((row, index) => (
        <article className="content-row" key={index}>
          <div className="content-row-head">
            <strong>{String(row[field.titleKey] ?? '') || `${index + 1}번째`}</strong>
            <div className="app-row-actions">
              <button title="위로" disabled={index === 0} onClick={() => move(index, -1)}>
                <ArrowUp size={14} />
              </button>
              <button
                title="아래로"
                disabled={index === rows.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown size={14} />
              </button>
              <button
                title="삭제"
                className="is-danger"
                onClick={() => {
                  if (confirm('이 항목을 삭제할까요?')) {
                    onChange(rows.filter((_, i) => i !== index))
                  }
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {field.fields.map((sub) => (
            <FieldEditor
              key={sub.key}
              field={sub}
              value={row[sub.key]}
              onChange={(next) => update(index, { ...row, [sub.key]: next })}
            />
          ))}
        </article>
      ))}

      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => {
          const blank: Row = {}
          for (const sub of field.fields) {
            blank[sub.key] = sub.kind === 'strings' ? [] : sub.kind === 'toggle' ? true : ''
          }
          onChange([...rows, blank])
        }}
      >
        <Plus size={14} />
        {field.label} 추가
      </button>
    </div>
  )
}
