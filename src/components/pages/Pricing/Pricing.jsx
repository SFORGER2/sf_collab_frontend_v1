import React, { useState } from "react";
import { Check, Mail, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import NavBar from "../../landing-page/Navbar";
import Footer from "../../../components/landing-page/Footer";
import AIPricing from "./aiPricing";
import {
  LIMIT_LABELS, limitKeysForRole, plansForRole, taglineForRole,
} from "@/services/entitlements/plans";
import { Display, Eyebrow, Lede, Panel, RoleTabs, Tag, CosmosButton } from "@/components/cosmos";

/**
 * Public pricing.
 *
 * Rewritten off the shared plan definitions rather than a bespoke
 * `/payments/plans` fetch. Two reasons:
 *
 * 1. It was crashing. The fetch failed, `plans` stayed empty, and
 *    `plans[activeIndex].description` threw — which, with no error boundary
 *    above it, blanked the whole app for anyone who opened /pricing.
 * 2. It showed two roles with one tier each while the product ships five roles
 *    with a four-step ladder plus Enterprise. A visitor and a signed-in user
 *    now see the same ladders, because they are read from the same file.
 *
 * NOTE FOR BACKEND: same contract as the in-app plans page — replace
 * `plansForRole` with GET /api/billing/plans?role=… once it exists, and keep
 * the two pages reading one source.
 */

const fmt = (v) =>
  v === Infinity ? "Unlimited" : typeof v === "number" ? v.toLocaleString() : v ?? "—";

const Pricing = () => {
  const [role, setRole] = useState("founder");

  const plans = plansForRole(role);
  const limitKeys = limitKeysForRole(role);

  return (
    <div className="min-h-screen text-star">
      <NavBar />

      <div className="w-full mx-auto max-w-[1180px] px-6 pt-24">
        <div className="text-center">
          <Eyebrow>Pricing</Eyebrow>
          <Display size="xl" className="mt-3 mb-4">
            Pick the ladder that fits your role
          </Display>
          <Lede className="mx-auto">{taglineForRole(role)}</Lede>
          <p className="text-[0.9rem] text-dim mt-3 max-w-[64ch] mx-auto">
            Every plan includes the full ecosystem — Visions, startups, SF Drive, SF Meet and
            the community. What changes is how much of your role's work you can do each day.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2.5 mt-9">
          <span className="cosmos-stat-label">Plans for</span>
          <RoleTabs value={role} onChange={setRole} label="Choose a role to compare plans" />
        </div>

        <div className="grid gap-4 mt-8 [grid-template-columns:repeat(auto-fit,minmax(215px,1fr))]">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="cosmos-panel cosmos-panel-accent p-6 flex flex-col gap-4"
              style={{ "--cosmos-accent": plan.accent }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Eyebrow>{plan.name}</Eyebrow>
                {plan.popular && <Tag tone="accent">Most Popular</Tag>}
              </div>

              <div>
                {plan.contactOnly ? (
                  <span className="font-display text-[1.5rem] text-star leading-none">
                    Let's Talk
                  </span>
                ) : (
                  <>
                    <span className="font-display text-[2rem] text-star leading-none">
                      ${plan.price}
                    </span>
                    <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-dim ml-1.5">
                      / Month
                    </span>
                  </>
                )}
              </div>

              <p className="text-[0.88rem] text-dim">{plan.summary}</p>

              <ul className="flex flex-col gap-2 mt-1">
                {(plan.highlights || []).map((h) => (
                  <li key={h} className="flex items-start gap-2 text-[0.85rem] text-star/90">
                    <Check size={13} className="mt-1 shrink-0" style={{ color: plan.accent }} />
                    {h}
                  </li>
                ))}
                <li className="flex items-start gap-2 text-[0.85rem]">
                  {plan.showsAds ? (
                    <Minus size={13} className="mt-1 shrink-0 text-dim" />
                  ) : (
                    <Check size={13} className="mt-1 shrink-0" style={{ color: plan.accent }} />
                  )}
                  <span className={plan.showsAds ? "text-dim" : "text-star/90"}>
                    {plan.showsAds ? "Ad-supported" : "No Advertising"}
                  </span>
                </li>
              </ul>

              <CosmosButton
                variant={plan.contactOnly ? "ghost" : plan.popular ? "primary" : "ghost"}
                size="sm"
                className="mt-auto"
                asChild
              >
                {plan.contactOnly ? (
                  <Link to="/contact"><Mail size={14} /> Contact Us</Link>
                ) : (
                  <Link to="/signup">{plan.price === 0 ? "Start Free" : `Choose ${plan.name}`}</Link>
                )}
              </CosmosButton>
            </div>
          ))}
        </div>

        <Panel className="p-6 mt-9">
          <Eyebrow className="mb-4">Full Comparison</Eyebrow>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-2.5 cosmos-stat-label font-normal">Limit</th>
                  {plans.map((p) => (
                    <th key={p.id} className="py-2.5 cosmos-stat-label font-normal text-right">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {limitKeys.map((key) => (
                  <tr key={key} className="border-b border-white/[0.07]">
                    <td className="py-2.5 text-[0.9rem] text-star">{LIMIT_LABELS[key] || key}</td>
                    {plans.map((p) => (
                      <td
                        key={p.id}
                        className="py-2.5 font-mono text-[11px] text-dim text-right tabular-nums"
                      >
                        {fmt(p.limits?.[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <p className="text-center text-[0.85rem] text-dim mt-5 italic">
          Prices are subject to change before general release.
        </p>
      </div>

      <AIPricing />

      <div className="w-full mx-auto max-w-[1180px] px-6 py-12">
        <Panel className="p-6 max-w-3xl mx-auto">
          <p className="text-dim text-sm leading-relaxed">
            <span className="font-semibold text-star">Plans</span> unlock platform capabilities
            and define usage limits. Usage-based services — AI generation, hosting, email,
            automation and external integrations — are billed separately in credits. As SF
            evolves, new features are added within existing plans based on access level.
          </p>
        </Panel>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;
