import { toast } from "react-toastify";
import { paymentAPI } from "../APIs/paymentAPI";
import { useEffect, useState } from "react";

export default function useGetCredits() {
  const [credits, setCredits] = useState(0);
  useEffect(() => {
    async function fetchCredits() {
      try {
        const response = await paymentAPI.getCredits();
  
        setCredits(response.data.credits || 0);
      } catch {
        toast.error("Failed to load credits");
      }
    }
    fetchCredits()
  }, []);
  return credits;
}