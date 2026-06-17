function messageId() {
  return `otp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function sendSms(phone: string, message: string) {
  const endpoint = process.env.SMSGATE_BASE_URL || process.env.SMSGATEWAY_API_URL;
  const username = process.env.SMSGATE_USERNAME || process.env.SMSGATEWAY_USERNAME;
  const password = process.env.SMSGATE_PASSWORD || process.env.SMSGATEWAY_PASSWORD;
  const deviceId = process.env.SMSGATE_DEVICE_ID || process.env.SMSGATEWAY_DEVICE_ID;
  const rawSimNumber = process.env.SMSGATE_SIM_NUMBER;
  const simNumber = rawSimNumber ? Number(rawSimNumber) : undefined;
  const priority = Number(process.env.SMSGATE_PRIORITY || "100");
  const skipPhoneValidation = process.env.SMSGATE_SKIP_PHONE_VALIDATION || "false";
  const deviceActiveWithin = process.env.SMSGATE_DEVICE_ACTIVE_WITHIN;

  if (!endpoint || !username || !password) {
    throw new Error("SMS-Gate is not configured");
  }

  const params = new URLSearchParams({ skipPhoneValidation });
  if (deviceActiveWithin) {
    params.set("deviceActiveWithin", deviceActiveWithin);
  }

  const targetUrl = `${endpoint}${endpoint.includes("?") ? "&" : "?"}${params.toString()}`;
  const response = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
    },
    body: JSON.stringify({
      id: messageId(),
      textMessage: { text: message },
      phoneNumbers: [phone],
      ...(deviceId ? { deviceId } : {}),
      ...(simNumber ? { simNumber } : {}),
      ttl: 3600,
      withDeliveryReport: true,
      priority,
    }),
    redirect: "follow",
  });

  const providerResponse = await response.text();
  if (!response.ok) {
    throw new Error(`SMS-Gate failed: ${providerResponse}`);
  }

  let parsedResponse: unknown = providerResponse;
  try {
    parsedResponse = JSON.parse(providerResponse);
  } catch {
    // Provider may return plain text for some errors/responses.
  }

  return { providerStatus: response.status, providerResponse: parsedResponse };
}
