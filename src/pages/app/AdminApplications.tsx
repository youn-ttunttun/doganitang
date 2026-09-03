import { useEffect, useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { applicationKindLabel, type ApplicationKind } from '../../lib/applications'
import { getClient } from '../../lib/supabase'

type Row = {
  id: string
  created_at: string
  kind: ApplicationKind
  name: string
  contact: string
  guardian_contact: string
  grade: string
  course: string
  level: string
  message: string
  status: string
}

const STATUS: { value: string; label: string }[] = [
  { value: 'new', label: '접수' },
  { value: 'contacted', label: '연락 완료' },
  { value: 'enrolled', label: '등록 완료' },
  { value: 'closed', label: '보류·종료' },
]

export default function AdminApplications() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getClient()
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setRows((data ?? []) as Row[])
        setLoading(false)
      })
  }, [])

  /** 스프레드시트로 옮겨 쓸 수 있게 내보냅니다. 엑셀에서 한글이 깨지지 않도록 BOM을 붙입니다. */
  function exportCsv() {
    const header = [
      '접수일',
      '유형',
      '이름',
      '학생 연락처',
      '학부모 연락처',
      '학년',
      '희망 과목',
      '현재 상황',
      '남긴 말',
      '상태',
    ]

    const escape = (value: string) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const lines = rows.map((row) =>
      [
        new Date(row.created_at).toLocaleString('ko-KR'),
        applicationKindLabel[row.kind] ?? row.kind,
        row.name,
        row.contact,
        row.guardian_contact,
        row.grade,
        row.course,
        row.level,
        row.message,
        STATUS.find((s) => s.value === row.status)?.label ?? row.status,
      ]
        .map(escape)
        .join(','),
    )

    const csv = '\ufeff' + [header.map(escape).join(','), ...lines].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `teamlesson-신청서-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function updateStatus(id: string, status: string) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)))
    const { error } = await getClient().from('applications').update({ status }).eq('id', id)
    if (error) setError(error.message)
  }

  if (loading) {
    return (
      <p className="app-note">
        <Loader2 size={16} className="spin" /> 불러오는 중…
      </p>
    )
  }

  return (
    <>
      <div className="app-head">
        <h1>신청서 {rows.length}건</h1>
        {rows.length > 0 && (
          <div className="app-head-actions">
            <button className="btn btn-ghost btn-sm" onClick={exportCsv}>
              <Download size={15} />
              CSV로 내보내기
            </button>
          </div>
        )}
      </div>

      {error && <p className="app-error">{error}</p>}

      {rows.length === 0 ? (
        <p className="app-note">아직 접수된 신청서가 없습니다.</p>
      ) : (
        <div className="app-list">
          {rows.map((row) => (
            <article className="app-row" key={row.id}>
              <div className="app-row-main">
                <div className="app-row-top">
                  <span className="app-kind">{applicationKindLabel[row.kind] ?? row.kind}</span>
                  <strong>{row.name}</strong>
                  <span className="app-dim">
                    {row.grade} · {row.course}
                  </span>
                  <time className="app-dim">
                    {new Date(row.created_at).toLocaleDateString('ko-KR')}
                  </time>
                </div>

                <p className="app-contact">
                  {row.contact}
                  {row.guardian_contact && (
                    <span className="app-dim"> · 학부모 {row.guardian_contact}</span>
                  )}
                </p>
                {row.level && <p className="app-dim">{row.level}</p>}
                {row.message && <p className="app-message">{row.message}</p>}
              </div>

              <select value={row.status} onChange={(e) => updateStatus(row.id, e.target.value)}>
                {STATUS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
