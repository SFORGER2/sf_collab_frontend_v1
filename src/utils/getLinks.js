// src/utils/getLinks.js
import { createLinks } from '@/components/pages/sidebars/sidebar/links';
import { createFounderLinks } from '@/components/pages/sidebars/founderSidebar/FounderLinks';
import { createBuilderLinks } from '@/components/pages/sidebars/builderSidebar/BuilderLinks';
import { createInfluencerLinks } from '@/components/pages/sidebars/influencerSidebar/influencerLinks';
import { createInvestorLinks } from '@/components/pages/sidebars/investorSidebar/InvestorLinks';
export function getLinks(activeRole, userRoles = [], setActiveRole = () => {}) {
  const unread = 0;
  switch (activeRole) {
    case 'founder':
      return createFounderLinks(unread, userRoles, setActiveRole, activeRole);
    case 'builder':
      return createBuilderLinks(unread, userRoles, setActiveRole, activeRole);
    case 'influencer':
      return createInfluencerLinks(unread, userRoles, setActiveRole, activeRole);
    case 'investor':
      return createInvestorLinks(unread, userRoles, setActiveRole, activeRole);
    default:
      return createLinks(unread, userRoles, setActiveRole);
  }
}