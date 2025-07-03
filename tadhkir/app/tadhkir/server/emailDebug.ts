// Email debugging and configuration helper
export function debugSendGridConfig(): void {
  console.log("=== SendGrid Configuration Debug ===");
  console.log("API Key configured:", !!process.env.SENDGRID_API_KEY);
  console.log("API Key length:", process.env.SENDGRID_API_KEY?.length || 0);
  console.log("API Key starts with SG.:", process.env.SENDGRID_API_KEY?.startsWith('SG.') || false);
  
  if (!process.env.SENDGRID_API_KEY) {
    console.log("❌ SENDGRID_API_KEY not found");
  } else if (!process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    console.log("⚠️  API Key format appears incorrect (should start with 'SG.')");
  } else {
    console.log("✅ API Key format appears correct");
  }
  
  console.log("\n📧 SendGrid Setup Requirements:");
  console.log("1. Verify sender email in SendGrid console");
  console.log("2. Use verified sender email as 'from' address");
  console.log("3. Ensure API key has Mail Send permissions");
  console.log("=====================================\n");
}

export function getSendGridErrorInfo(error: any): string {
  if (error?.response?.body?.errors) {
    return error.response.body.errors.map((e: any) => e.message).join(", ");
  }
  return error.message || "Unknown SendGrid error";
}