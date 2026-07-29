import { useCallback, useEffect, useState } from 'react';
import {
  checkLimit,
  consume,
  getPlan,
  readAccount,
  shouldShowAds,
  writeAccount,
} from './entitlements';

/**
 * React access to the entitlement state.
 *
 * Every consumer subscribes to the same `sfc:entitlements-changed` event, so
 * spending a credit in one widget updates the balance shown in the navbar
 * without prop drilling or a store.
 */
export function useEntitlements() {
  const [account, setAccount] = useState(readAccount);

  useEffect(() => {
    const sync = () => setAccount(readAccount());
    window.addEventListener('sfc:entitlements-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('sfc:entitlements-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const check = useCallback(
    (limitKey, creditKey) => checkLimit(account, limitKey, creditKey),
    [account]
  );

  const spend = useCallback(
    (limitKey, creditKey) => {
      const next = consume(account, limitKey, creditKey);
      if (next) setAccount(next);
      return Boolean(next);
    },
    [account]
  );

  const setPlan = useCallback(
    (planId) => writeAccount({ ...readAccount(), planId }),
    []
  );

  const addCredits = useCallback(
    (amount) => {
      const current = readAccount();
      writeAccount({ ...current, credits: current.credits + amount });
    },
    []
  );

  /** Admin switch — hides ad slots globally while there's no ad inventory. */
  const setAdsEnabled = useCallback(
    (enabled) => writeAccount({ ...readAccount(), adsEnabled: enabled }),
    []
  );

  return {
    account,
    plan: getPlan(account.planId),
    credits: account.credits,
    showAds: shouldShowAds(account),
    check,
    spend,
    setPlan,
    addCredits,
    setAdsEnabled,
  };
}
