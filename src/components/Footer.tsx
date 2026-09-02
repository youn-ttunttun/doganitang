import { Instagram, Mail } from 'lucide-react'
import { useContent } from '../lib/siteContent'

export default function Footer() {
  const { site } = useContent()
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <p className="footer-logo">{site.name}</p>
          <p className="footer-slogan">{site.slogan}</p>
          <p className="footer-tagline">{site.tagline}</p>
        </div>

        <div className="footer-links">
          <a href={site.instagram} target="_blank" rel="noreferrer">
            <Instagram size={16} />
            {site.instagramHandle}
          </a>
          <a href={`mailto:${site.email}`}>
            <Mail size={16} />
            {site.email}
          </a>
          <a href={site.studentSiteUrl} target="_blank" rel="noreferrer">
            수강생 전용 페이지
          </a>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
      </div>
    </footer>
  )
}
