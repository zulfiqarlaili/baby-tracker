import { Icon } from './Icon'

interface OnboardingProps {
  onContinue: () => void
}

export function Onboarding({ onContinue }: OnboardingProps) {
  return (
    <main className="onboarding-shell">
      <div className="onboarding-card">
        <div className="onboarding-art" aria-hidden="true">
          <span className="onboarding-star star-one">✦</span>
          <span className="onboarding-star star-two">✧</span>
          <div className="onboarding-moon">
            <Icon name="baby" size={72} />
          </div>
        </div>

        <p className="eyebrow">A gentle daily log</p>
        <h1>Meet your baby’s little rhythm</h1>
        <p className="onboarding-intro">
          Tap whenever you feel a kick, roll, flutter or swish. Everything stays privately on this device.
        </p>

        <section className="safety-note" aria-labelledby="safety-title">
          <div className="safety-icon">
            <Icon name="heart" size={22} />
          </div>
          <div>
            <h2 id="safety-title">One important note</h2>
            <p>
              Every baby has their own pattern. Ten movements is a logging milestone—not proof that baby is well.
            </p>
            <p>
              If movements slow, stop, or feel different, contact your midwife or maternity unit immediately. Do not wait until tomorrow.
            </p>
          </div>
        </section>

        <button className="primary-button onboarding-button" type="button" onClick={onContinue}>
          Start counting
          <Icon name="chevron-right" size={20} />
        </button>
      </div>
    </main>
  )
}
