import { useEffect, useState } from "react";
import { usersAPI } from "../APIs/userAPI";

export default function useGetPlanId() {

  const [founderPlanId, setFounderPlanId] = useState(null);
  const [builderPlanId, setBuilderPlanId] = useState(null);
  useEffect(() => {
    async function fetchPlanId() {
      try {
        const res = await usersAPI.getCurrentPlan()
        if (!res.success) {
          throw new Error("Failed to fetch current plan");
        }
        setFounderPlanId(res.data.founder_plan);
        setBuilderPlanId(res.data.builder_plan);
      } catch (err) {
        console.error("❌ Failed to load crowdfunding plan ID", err);
      }
    }

    fetchPlanId();
  }, []);

  return { founderPlanId, setFounderPlanId, builderPlanId, setBuilderPlanId }
}