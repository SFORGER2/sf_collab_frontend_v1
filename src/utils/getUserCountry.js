export async function getUserCountry() {
    try {
        const res = await fetch("https://api.country.is/");
        const data = await res.json();
        // alert(JSON.stringify(data))
        return data.country|| "Unknown";
    } catch (err) {
      console.error("IP lookup failed", err);
      return "Unknown";
    }
  }
  