import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const { AGORA_CUSTOMER_ID, AGORA_CUSTOMER_SECRET } = process.env;

// Agora authentication (Basic Auth)
const token = Buffer.from(`${AGORA_CUSTOMER_ID}:${AGORA_CUSTOMER_SECRET}`).toString("base64");

// ✅ Define and export the function correctly
export async function askAgora(message) {
  try {
    const response = await axios.post(
      "https://api.agora.io/api/conversational-ai-agent/v2/projects/ffbc9e80fa4b47a9a4b452f4ccd78388/join",
      {
        name: "test-agent",
        properties: {
          channel: "demoChannel",
          token: "testToken",
          agent_rtc_uid: "12345",
          remote_rtc_uids: ["67890"],
          enable_string_uid: true,
          idle_timeout: 30,
             idle_timeout: 120,
    advanced_features: {
      enable_aivad: true
    },
        },
      },
      {
        headers: {
          Authorization: `Basic ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Agora AI Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error calling Agora AI:", error.response?.data || error.message);
    return null;
  }
}


