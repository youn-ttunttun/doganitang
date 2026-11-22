import type { ReactNode } from 'react'
import Faq from '../components/Faq'
import News from '../components/News'
import Positioning from '../components/Positioning'
import Pricing from '../components/Pricing'
import Process from '../components/Process'
import Proof from '../components/Proof'
import StoryInvitation from '../components/StoryInvitation'
import SubPage from './SubPage'

/**
 * 메뉴 항목마다 따로 열리는 페이지.
 *
 * 전에는 '커리큘럼'·'선생님' 은 페이지가 바뀌고, '왜 우리인가'·'성적·후기'·
 * '수강료'·'공지' 는 긴 메인 페이지 중간으로 스크롤돼서 누를 때마다 동작이
 * 달랐습니다. 모두 페이지로 맞추고, 메인에는 필요한 요약을 보여줍니다.
 */
const SECTIONS: Record<string, ReactNode> = {
  story: <StoryInvitation standalone />,
  process: <Process />,
  why: <Positioning />,
  proof: <Proof />,
  pricing: <Pricing />,
  faq: <Faq />,
  news: <News />,
}

export default function SectionPage({ section }: { section: keyof typeof SECTIONS }) {
  return <SubPage>{SECTIONS[section]}</SubPage>
}
