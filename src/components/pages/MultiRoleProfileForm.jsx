import { useMemo, useState } from 'react'
import './MultiRoleProfileForm.css'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { setupProfileRequest } from '@/utils/APIs/authAPI'
import { usersAPI } from '@/utils/APIs/userAPI'
import LoadingSpinner from '../LoadingSpinner'

const roleConfig = [
  {
    key: 'founder',
    label: 'Founder / Builder ',
    sectionLabel: 'Founder',
    shortLabel: 'Founder',
    icon: '🚀',
    description: 'Share your startup story, stage, and what you need next.',
    selectHint: 'Pitch & find collaborators',
  },
  {
    key: 'builder',
    label: 'Contributor',
    sectionLabel: 'Builder',
    shortLabel: 'Builder',
    icon: '🛠️',
    description: 'Highlight your skills, availability, and where you want to help.',
    selectHint: 'Contribute & ship product',
  },
  {
    key: 'influencer',
    label: 'Influencer ',
    sectionLabel: 'Influencer',
    shortLabel: 'Influencer',
    icon: '📣',
    description: 'Showcase your audience, platforms, and collab preferences.',
    selectHint: 'Amplify startups & launches',
  },
  {
    key: 'investor',
    label: 'Investor',
    sectionLabel: 'Investor',
    shortLabel: 'Investor',
    icon: '💼',
    description:
      'Profile-only visibility. No investing or transaction flows are implemented yet.',
    selectHint: 'Identity-only for now',
  },
]

const industries = [
  'SaaS',
  'Fintech',
  'Health & Wellness',
  'Climate',
  'Consumer',
  'AI / ML',
  'Education',
  'Marketplace',
]

const founderStages = ['idea', 'MVP', 'early revenue', 'scaling']

const founderLookingOptions = [
  { label: 'Contributors', value: 'contributors' },
  { label: 'Co-founders', value: 'co-founders' },
  { label: 'Investors', value: 'investors' },
]

const skillOptions = [
  'UI / UX Design',
  'Frontend',
  'Backend',
  'Product Strategy',
  'Data Science',
  'Growth',
  'DevOps',
]

const experienceLevels = ['Junior', 'Mid-level', 'Senior', 'Lead', 'Principal']

const contributionTypes = ['Paid', 'Equity', 'Open source', 'Learning']

const influencerPlatforms = ['X / Twitter', 'LinkedIn', 'YouTube', 'TikTok', 'Instagram', 'Newsletter']

const influencerCollabs = ['Paid promo', 'Equity for reach', 'Affiliate', 'Advisory', 'Content co-creation']

const investorTypes = ['Angel', 'VC', 'Syndicate', 'Scout']

const investorIndustries = ['Frontend', 'Fintech', 'Climate', 'Healthcare', 'AI / ML', 'Marketplace']

function MultiRoleProfileForm() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState(['founder'])
  const [sectionStates, setSectionStates] = useState({
    founder: true,
    builder: true,
    influencer: true,
    investor: true,
  })

  const [founderProfile, setFounderProfile] = useState({
    startupName: '',
    pitch: '',
    description: '',
    industry: '',
    stage: 'idea',
    lookingFor: [],
    website: '',
  })

  const [builderProfile, setBuilderProfile] = useState({
    primarySkills: [],
    secondarySkills: '',
    experienceLevel: '',
    availability: '',
    contributionType: [],
    portfolio: '',
  })

  const [influencerProfile, setInfluencerProfile] = useState({
    platforms: [],
    audienceSize: '',
    focusAreas: '',
    collaborationTypes: [],
    reachLinks: '',
    bio: '',
  })

  const [investorProfile, setInvestorProfile] = useState({
    investorType: '',
    checkSize: '',
    industriesOfInterest: [],
    stagePreference: [],
    location: '',
    bio: '',
  })

  const roleProfiles = {
    founder: founderProfile,
    builder: builderProfile,
    influencer: influencerProfile,
    investor: investorProfile,
  }

  const toggleRole = (roleKey) => {
    setSelectedRoles((previous) => {
      const alreadySelected = previous.includes(roleKey)
      const updated = alreadySelected
        ? previous.filter((role) => role !== roleKey)
        : [...previous, roleKey]
      setSectionStates((states) => ({
        ...states,
        [roleKey]: !alreadySelected || states[roleKey],
      }))
      return updated
    })
  }

  const handleSectionToggle = (roleKey) => {
    setSectionStates((states) => ({
      ...states,
      [roleKey]: !states[roleKey],
    }))
  }

  const handleProfileChange = (roleKey, field, value) => {
    if (roleKey === 'founder') {
      setFounderProfile((previous) => ({ ...previous, [field]: value }))
      return
    }
    if (roleKey === 'builder') {
      setBuilderProfile((previous) => ({ ...previous, [field]: value }))
      return
    }
    if (roleKey === 'influencer') {
      setInfluencerProfile((previous) => ({ ...previous, [field]: value }))
      return
    }
    if (roleKey === 'investor') {
      setInvestorProfile((previous) => ({ ...previous, [field]: value }))
    }
  }

  const handleProfileArrayToggle = (roleKey, field, value) => {
    const updater = (currentArray) => {
      const exists = currentArray.includes(value)
      if (exists) {
        return currentArray.filter((item) => item !== value)
      }
      return [...currentArray, value]
    }

    if (roleKey === 'founder') {
      setFounderProfile((previous) => ({
        ...previous,
        [field]: updater(previous[field]),
      }))
      return
    }
    if (roleKey === 'builder') {
      setBuilderProfile((previous) => ({
        ...previous,
        [field]: updater(previous[field]),
      }))
      return
    }
    if (roleKey === 'influencer') {
      setInfluencerProfile((previous) => ({
        ...previous,
        [field]: updater(previous[field]),
      }))
      return
    }
    if (roleKey === 'investor') {
      setInvestorProfile((previous) => ({
        ...previous,
        [field]: updater(previous[field]),
      }))
    }
  }

  const mandatoryFields = {
    founder: ['startupName', 'pitch', 'industry', 'stage'],
    builder: ['primarySkills', 'experienceLevel'],
    influencer: ['platforms', 'audienceSize'],
    investor: ['investorType'],
  }

  const validateProfiles = () => {
    for (const roleKey of selectedRoles) {
      const mandatory = mandatoryFields[roleKey] || []
      const profile = roleProfiles[roleKey]

      for (const field of mandatory) {
        const value = profile[field]
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return false
          }
        } else if (typeof value === 'string') {
          if (value.trim().length === 0) {
            return false
          }
        }
      }
    }
    return true
  }

  const progressMetrics = useMemo(() => {
    let total = 0
    let filled = 0

    selectedRoles.forEach((role) => {
      const profile = roleProfiles[role]
      if (!profile) return
      Object.values(profile).forEach((value) => {
        total += 1
        if (Array.isArray(value)) {
          if (value.length > 0) {
            filled += 1
          }
        } else if (typeof value === 'string') {
          if (value.trim().length > 0) {
            filled += 1
          }
        }
      })
    })

    const percent = total > 0 ? Math.round((filled / total) * 100) : 0
    return { total, filled, percent }
  }, [builderProfile, founderProfile, influencerProfile, investorProfile, roleProfiles, selectedRoles])

  const canSave = selectedRoles.length > 0 && validateProfiles()

  const isFieldEmpty = (roleKey, fieldName) => {
    const mandatory = mandatoryFields[roleKey] || []
    if (!mandatory.includes(fieldName)) return false

    const profile = roleProfiles[roleKey]
    const value = profile[fieldName]

    if (Array.isArray(value)) {
      return value.length === 0
    }
    if (typeof value === 'string') {
      return value.trim().length === 0
    }
    return false
  }

  const handleSave = async () => {
    if (!canSave) {
      toast.error(selectedRoles.length === 0
        ? 'Select at least one role before saving.'
        : 'Please fill in all required fields in your selected role(s).')
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("access_token")
      
      const payload = {
        roles: selectedRoles,
        founderProfile,
        builderProfile,
        influencerProfile,
        investorProfile,
      }

      // Save to backend using centralized API
      const response = await usersAPI.completeProfile(payload, token)

      if (!response.success) {
        throw new Error('Failed to save profile')
      }

      toast.success('Multi-role profile saved successfully!')
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error(error.message || 'Failed to save profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderFounderFields = () => (
    <div className="role-form">
      <div className="field-grid">
        <label className={isFieldEmpty('founder', 'startupName') ? 'field--error' : ''}>
          <span>Startup name <span className="required">*</span></span>
          <input
            type="text"
            value={founderProfile.startupName}
            onChange={(event) => handleProfileChange('founder', 'startupName', event.target.value)}
            placeholder="Acme Labs"
            className={isFieldEmpty('founder', 'startupName') ? 'input--error' : ''}
          />
        </label>
        <label className={isFieldEmpty('founder', 'pitch') ? 'field--error' : ''}>
          <span>One-line pitch <span className="required">*</span></span>
          <input
            type="text"
            value={founderProfile.pitch}
            onChange={(event) => handleProfileChange('founder', 'pitch', event.target.value)}
            placeholder="Automate fundraising prep"
            className={isFieldEmpty('founder', 'pitch') ? 'input--error' : ''}
          />
        </label>
      </div>
      <label className="full-width">
        <span>Long description</span>
        <textarea
          value={founderProfile.description}
          onChange={(event) => handleProfileChange('founder', 'description', event.target.value)}
          placeholder="Tell contributors what you're building and why it matters."
        />
      </label>
      <div className="field-grid">
        <label className={isFieldEmpty('founder', 'industry') ? 'field--error' : ''}>
          <span>Industry / category <span className="required">*</span></span>
          <select
            value={founderProfile.industry}
            onChange={(event) => handleProfileChange('founder', 'industry', event.target.value)}
            className={isFieldEmpty('founder', 'industry') ? 'input--error' : ''}
          >
            <option value="">Choose one</option>
            {industries.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className={isFieldEmpty('founder', 'stage') ? 'field--error' : ''}>
          <span>Stage <span className="required">*</span></span>
          <select
            value={founderProfile.stage}
            onChange={(event) => handleProfileChange('founder', 'stage', event.target.value)}
            className={isFieldEmpty('founder', 'stage') ? 'input--error' : ''}
          >
            {founderStages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="chip-grid">
        {founderLookingOptions.map((option) => {
          const active = founderProfile.lookingFor.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              className={`chip ${active ? 'chip--active' : ''}`}
              onClick={() => handleProfileArrayToggle('founder', 'lookingFor', option.value)}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      <label className="full-width">
        <span>Website / demo link</span>
        <input
          type="url"
          value={founderProfile.website}
          onChange={(event) => handleProfileChange('founder', 'website', event.target.value)}
          placeholder="https://"
        />
      </label>
    </div>
  )

  const renderBuilderFields = () => (
    <div className="role-form">
      <p className="helper-text">Pick your strongest skills and how you prefer to help.</p>
      <label>
        <span>Primary skills <span className="required">*</span></span>
      </label>
      <div className={`chip-grid ${isFieldEmpty('builder', 'primarySkills') ? 'chip-grid--error' : ''}`}>
        {skillOptions.map((skill) => {
          const active = builderProfile.primarySkills.includes(skill)
          return (
            <button
              key={skill}
              type="button"
              className={`chip ${active ? 'chip--active' : ''}`}
              onClick={() => handleProfileArrayToggle('builder', 'primarySkills', skill)}
            >
              {skill}
            </button>
          )
        })}
      </div>
      <div className="field-grid">
        <label>
          <span>Secondary skills</span>
          <input
            type="text"
            value={builderProfile.secondarySkills}
            onChange={(event) => handleProfileChange('builder', 'secondarySkills', event.target.value)}
            placeholder="Systems thinking, research, etc."
          />
        </label>
        <label className={isFieldEmpty('builder', 'experienceLevel') ? 'field--error' : ''}>
          <span>Experience level <span className="required">*</span></span>
          <select
            value={builderProfile.experienceLevel}
            onChange={(event) => handleProfileChange('builder', 'experienceLevel', event.target.value)}
            className={isFieldEmpty('builder', 'experienceLevel') ? 'input--error' : ''}
          >
            <option value="">Select</option>
            {experienceLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="field-grid">
        <label>
          <span>Availability (hours / week)</span>
          <input
            type="number"
            min="1"
            max="60"
            value={builderProfile.availability}
            onChange={(event) => handleProfileChange('builder', 'availability', event.target.value)}
            placeholder="e.g., 10"
          />
        </label>
        <label>
          <span>Preferred contribution type</span>
        </label>
      </div>
      <div className="chip-grid">
        {contributionTypes.map((type) => {
          const active = builderProfile.contributionType.includes(type)
          return (
            <button
              key={type}
              type="button"
              className={`chip ${active ? 'chip--active' : ''}`}
              onClick={() => handleProfileArrayToggle('builder', 'contributionType', type)}
            >
              {type}
            </button>
          )
        })}
      </div>
      <label className="full-width">
        <span>Portfolio / GitHub / LinkedIn</span>
        <input
          type="text"
          value={builderProfile.portfolio}
          onChange={(event) => handleProfileChange('builder', 'portfolio', event.target.value)}
          placeholder="https://"
        />
      </label>
    </div>
  )

  const renderInfluencerFields = () => (
    <div className="role-form">
      <p className="helper-text">Identity-only for now: capture reach and collaboration preferences.</p>
      <label>
        <span>Primary platforms <span className="required">*</span></span>
      </label>
      <div className={`chip-grid ${isFieldEmpty('influencer', 'platforms') ? 'chip-grid--error' : ''}`}>
        {influencerPlatforms.map((platform) => {
          const active = influencerProfile.platforms.includes(platform)
          return (
            <button
              key={platform}
              type="button"
              className={`chip ${active ? 'chip--active' : ''}`}
              onClick={() => handleProfileArrayToggle('influencer', 'platforms', platform)}
            >
              {platform}
            </button>
          )
        })}
      </div>
      <div className="field-grid">
        <label className={isFieldEmpty('influencer', 'audienceSize') ? 'field--error' : ''}>
          <span>Audience size (combined) <span className="required">*</span></span>
          <input
            type="text"
            value={influencerProfile.audienceSize}
            onChange={(event) => handleProfileChange('influencer', 'audienceSize', event.target.value)}
            placeholder="e.g., 120k"
            className={isFieldEmpty('influencer', 'audienceSize') ? 'input--error' : ''}
          />
        </label>
        <label>
          <span>Content / focus areas</span>
          <input
            type="text"
            value={influencerProfile.focusAreas}
            onChange={(event) => handleProfileChange('influencer', 'focusAreas', event.target.value)}
            placeholder="Product launches, dev tools, AI, etc."
          />
        </label>
      </div>
      <label>
        <span>Collaboration types</span>
      </label>
      <div className="chip-grid">
        {influencerCollabs.map((collab) => {
          const active = influencerProfile.collaborationTypes.includes(collab)
          return (
            <button
              key={collab}
              type="button"
              className={`chip ${active ? 'chip--active' : ''}`}
              onClick={() => handleProfileArrayToggle('influencer', 'collaborationTypes', collab)}
            >
              {collab}
            </button>
          )
        })}
      </div>
      <label className="full-width">
        <span>Links (media kit, Linktree, socials)</span>
        <input
          type="text"
          value={influencerProfile.reachLinks}
          onChange={(event) => handleProfileChange('influencer', 'reachLinks', event.target.value)}
          placeholder="https://"
        />
      </label>
      <label className="full-width">
        <span>Short bio</span>
        <textarea
          value={influencerProfile.bio}
          onChange={(event) => handleProfileChange('influencer', 'bio', event.target.value)}
          placeholder="How you support launches and what you like to feature."
        />
      </label>
    </div>
  )

  const renderInvestorFields = () => (
    <div className="role-form">
      <p className="helper-text">This remains an identity-only profile; no investing flows yet.</p>
      <div className="field-grid">
        <label className={isFieldEmpty('investor', 'investorType') ? 'field--error' : ''}>
          <span>Investor type <span className="required">*</span></span>
          <select
            value={investorProfile.investorType}
            onChange={(event) => handleProfileChange('investor', 'investorType', event.target.value)}
            className={isFieldEmpty('investor', 'investorType') ? 'input--error' : ''}
          >
            <option value="">Select</option>
            {investorTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Typical check size</span>
          <input
            type="text"
            value={investorProfile.checkSize}
            onChange={(event) => handleProfileChange('investor', 'checkSize', event.target.value)}
            placeholder="$25k - $200k"
          />
        </label>
      </div>
      <label>
        <span>Industries of interest</span>
      </label>
      <div className="chip-grid">
        {investorIndustries.map((industry) => {
          const active = investorProfile.industriesOfInterest.includes(industry)
          return (
            <button
              type="button"
              key={industry}
              className={`chip ${active ? 'chip--active' : ''}`}
              onClick={() => handleProfileArrayToggle('investor', 'industriesOfInterest', industry)}
            >
              {industry}
            </button>
          )
        })}
      </div>
      <label>
        <span>Stage preference</span>
      </label>
      <div className="chip-grid">
        {founderStages.map((stage) => {
          const active = investorProfile.stagePreference.includes(stage)
          return (
            <button
              type="button"
              key={stage}
              className={`chip ${active ? 'chip--active' : ''}`}
              onClick={() => handleProfileArrayToggle('investor', 'stagePreference', stage)}
            >
              {stage}
            </button>
          )
        })}
      </div>
      <div className="field-grid">
        <label>
          <span>Location / geography</span>
          <input
            type="text"
            value={investorProfile.location}
            onChange={(event) => handleProfileChange('investor', 'location', event.target.value)}
            placeholder="City, region, remote"
          />
        </label>
      </div>
      <label className="full-width">
        <span>Public bio</span>
        <textarea
          value={investorProfile.bio}
          onChange={(event) => handleProfileChange('investor', 'bio', event.target.value)}
          placeholder="Describe your investment focus without actioning any deals here."
        />
      </label>
    </div>
  )

  const renderRoleFields = (roleKey) => {
    switch (roleKey) {
      case 'founder':
        return renderFounderFields()
      case 'builder':
        return renderBuilderFields()
      case 'influencer':
        return renderInfluencerFields()
      case 'investor':
        return renderInvestorFields()
      default:
        return null
    }
  }

  const progressFill = Math.min(100, Math.max(0, progressMetrics.percent))
  const activeRoles = roleConfig.filter((role) => selectedRoles.includes(role.key))

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Additional Profile Setup</p>
          <h1>Choose your roles and paint the right picture.</h1>
          <p className="lede">Select the personas you identify with and complete each profile section below. This helps us match you with the right opportunities.</p>
        </div>
        <div className="progress-card" aria-live="polite">
          <div className="progress-label">
            <strong>Profile {progressFill}% complete</strong>
            <span>{selectedRoles.length} role{selectedRoles.length === 1 ? '' : 's'} active</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressFill}%` }} />
          </div>
        </div>
      </header>

      <main>
        <section className="role-selector" aria-label="Role selection">
          {roleConfig.map((role) => {
            const active = selectedRoles.includes(role.key)
            return (
              <button
                key={role.key}
                type="button"
                className={`role-chip ${active ? 'active' : ''}`}
                aria-pressed={active}
                onClick={() => toggleRole(role.key)}
              >
                <span className="role-chip__icon" aria-hidden="true">
                  {role.icon}
                </span>
                <div>
                  <span>{role.label}</span>
                  <small>{role.selectHint}</small>
                </div>
              </button>
            )
          })}
        </section>

        <section className="panels">
          {activeRoles.length === 0 && (
            <div className="inactive-hint empty-state">
              <p>Select at least one role above to start filling out its profile.</p>
            </div>
          )}
          {activeRoles.map((role) => {
            const expanded = sectionStates[role.key]
            return (
              <article
                key={role.key}
                className={`profile-panel is-active ${expanded ? 'is-expanded' : 'is-collapsed'}`}
              >
                <header className="panel-header">
                  <div>
                    <p className="eyebrow">{role.sectionLabel}</p>
                    <h2>{role.label}</h2>
                    <p className="panel-description">{role.description}</p>
                  </div>
                  <div className="panel-controls">
                    <button type="button" className="collapse-toggle" onClick={() => handleSectionToggle(role.key)}>
                      {expanded ? 'Collapse' : 'Expand'}
                    </button>
                    <span className="role-pill">{role.shortLabel}</span>
                  </div>
                </header>
                <div className={`panel-body ${expanded ? 'panel-body--open' : ''}`}>
                  {renderRoleFields(role.key)}
                </div>
              </article>
            )
          })}
        </section>
      </main>

      <footer className="cta-bar">
        <p>
          {canSave
            ? 'All inputs are ready to be saved to your profile.'
            : selectedRoles.length === 0
              ? 'Select at least one role to enable saving.'
              : 'Complete all required fields to save your profile.'}
        </p>
        <button
          type="button"
          className="primary-btn"
          onClick={handleSave}
          disabled={!canSave || isLoading}
          aria-disabled={!canSave || isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner /> Saving...
            </>
          ) : (
            'Save Multi-Role Profile & Go to Dashboard'
          )}
        </button>
      </footer>
    </div>
  )
}

export default MultiRoleProfileForm