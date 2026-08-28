import { material } from '../content'
import Section from './Section'

export default function Material() {
  return (
    <Section id="material" tone="muted" eyebrow={material.eyebrow} title={material.title}>
      <div className="bento">
        <div className="tile s5 r2">
          {material.paragraphs.map((paragraph) => (
            <p className="tile-body" key={paragraph}>
              {paragraph}
            </p>
          ))}
          <p className="material-tag">「Checklist pre」 · 「Checklist 대수」</p>
        </div>

        {material.images.map((image) => (
          <figure className="tile tile--photo s4" key={image.src}>
            <img src={image.src} alt={image.alt} loading="lazy" />
          </figure>
        ))}
      </div>
    </Section>
  )
}
