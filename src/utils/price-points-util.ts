
export interface PricePoints {
  pricingPoints: { basePriceInUSD: string; localizedPrice: string, formattedPrice: string }[];
  pricingPointData: {
    currencyCode: string;
    currencySymbol: string;
    fractionalSeparator: string;
    milSeparator: string;
    symbolPosition: "Right" | "Left";
    spacing: boolean;
    multiplier: number;
  };
}

export async function getPricePoints(
  environment: "sandbox" | "prod" = "sandbox",
  domain: string = window.location.host
): Promise<PricePoints> {
  const env = environment === "prod" ? "" : `-${environment}`;
  const apiUrl = `https://api${env}.appcharge.com/checkout/v1/${domain}/pricingPoints`;
  const pricePointsResponse = await fetch(apiUrl);
  const pricePoints = await pricePointsResponse.json();
  if (!pricePointsResponse.ok) {
    throw (pricePoints as any)?.message;
  }
  return pricePoints;
}
