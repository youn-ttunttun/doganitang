import { ArrowRight, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../lib/siteContent'
import Section from './Section'

/** 사이트 맨 아래. 폼은 /apply 에 따로 있고 여기서는 그리로 보냅니다. */
export default function ApplyCta() {
  const { apply } = useContent()
  return (
    <Section id="apply" tone="dark" eyebrow={apply.eyebrow} title={apply.title} lead={apply.sub}>
      <Link className="btn btn-primary btn-lg apply-cta" to="/apply">
        <Send size={18} />
        신청서 작성하기
        <ArrowRight size={18} />
      </Link>
    </Section>
  )
}
