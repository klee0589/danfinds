/**
 * Amazon Creators API integration layer
 * READY TO ACTIVATE: Add AMAZON_ACCESS_KEY + AMAZON_SECRET_KEY + AMAZON_PARTNER_TAG to secrets
 * 
 * Replaces: PAAPI v5 (deprecated May 2026)
 * Endpoint: https://webservices.amazon.com/paapi5/searchitems (migrating to Creators API)
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { createHmac } from "node:crypto";

const ASSOCIATE_TAG = "danfindsapp11-20";
const REGION = "us-east-1";
const SERVICE = "ProductAdvertisingAPI";

function getAmzDate() {
  return new Date().toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
}

function hmacSHA256(key, data) {
  return createHmac('sha256', key).update(data).digest();
}

function getSignatureKey(secretKey, dateStamp, region, serviceName) {
  const kDate = hmacSHA256("AWS4" + secretKey, dateStamp);
  const kRegion = hmacSHA256(kDate, region);
  const kService = hmacSHA256(kRegion, serviceName);
  const kSigning = hmacSHA256(kService, "aws4_request");
  return kSigning;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const ACCESS_KEY = Deno.env.get("AMAZON_ACCESS_KEY");
    const SECRET_KEY = Deno.env.get("AMAZON_SECRET_KEY");

    if (!ACCESS_KEY || !SECRET_KEY) {
      return Response.json({
        error: "Amazon API credentials not configured",
        setup_instructions: "Add AMAZON_ACCESS_KEY and AMAZON_SECRET_KEY in Base44 Settings → Environment Variables. Get these from Amazon Associates Central → Tools → Creators API after reaching 10 qualifying sales.",
        status: "not_configured"
      }, { status: 503 });
    }

    const { operation, keyword, asins, category } = await req.json();

    // Build request payload based on operation
    let payload;
    if (operation === "SearchItems") {
      payload = {
        Keywords: keyword,
        Resources: [
          "Images.Primary.Large",
          "ItemInfo.Title",
          "ItemInfo.Features",
          "Offers.Listings.Price",
          "CustomerReviews.StarRating",
          "CustomerReviews.Count"
        ],
        SearchIndex: category || "All",
        ItemCount: 10,
        PartnerTag: ASSOCIATE_TAG,
        PartnerType: "Associates",
        Marketplace: "www.amazon.com"
      };
    } else if (operation === "GetItems") {
      payload = {
        ItemIds: Array.isArray(asins) ? asins : [asins],
        Resources: [
          "Images.Primary.Large",
          "ItemInfo.Title",
          "ItemInfo.Features",
          "Offers.Listings.Price",
          "CustomerReviews.StarRating",
          "CustomerReviews.Count"
        ],
        PartnerTag: ASSOCIATE_TAG,
        PartnerType: "Associates",
        Marketplace: "www.amazon.com"
      };
    } else {
      return Response.json({ error: "Invalid operation. Use SearchItems or GetItems" }, { status: 400 });
    }

    const endpoint = "webservices.amazon.com";
    const path = `/paapi5/${operation.toLowerCase()}`;
    const body = JSON.stringify(payload);

    const amzDate = getAmzDate();
    const dateStamp = amzDate.slice(0, 8);

    const canonicalHeaders = `content-encoding:amz-1.0\ncontent-type:application/json; charset=utf-8\nhost:${endpoint}\nx-amz-date:${amzDate}\nx-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}\n`;
    const signedHeaders = "content-encoding;content-type;host;x-amz-date;x-amz-target";

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(body));
    const payloadHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const canonicalRequest = `POST\n${path}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;

    const hashBuffer2 = await crypto.subtle.digest('SHA-256', encoder.encode(canonicalRequest));
    const canonicalRequestHash = Array.from(new Uint8Array(hashBuffer2)).map(b => b.toString(16).padStart(2, '0')).join('');

    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;
    const signingKey = getSignatureKey(SECRET_KEY, dateStamp, REGION, SERVICE);
    const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    const authHeader = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const response = await fetch(`https://${endpoint}${path}`, {
      method: 'POST',
      headers: {
        'content-encoding': 'amz-1.0',
        'content-type': 'application/json; charset=utf-8',
        'host': endpoint,
        'x-amz-date': amzDate,
        'x-amz-target': `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`,
        'Authorization': authHeader
      },
      body
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({ error: data, status: response.status }, { status: response.status });
    }

    // Normalize response into DanFinds product format
    const items = data.SearchResult?.Items || data.ItemsResult?.Items || [];
    const normalized = items.map(item => ({
      asin: item.ASIN,
      title: item.ItemInfo?.Title?.DisplayValue,
      image_url: item.Images?.Primary?.Large?.URL,
      price_snapshot: item.Offers?.Listings?.[0]?.Price?.DisplayAmount,
      rating: item.CustomerReviews?.StarRating?.Value,
      review_count: item.CustomerReviews?.Count,
      key_features: item.ItemInfo?.Features?.DisplayValues || [],
      affiliate_url: `https://www.amazon.com/dp/${item.ASIN}?tag=${ASSOCIATE_TAG}`,
      source: "api"
    }));

    return Response.json({ success: true, products: normalized, raw_count: items.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});