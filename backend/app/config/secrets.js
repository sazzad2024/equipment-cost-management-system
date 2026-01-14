const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");

// SSM client will use the instance role on EC2, or local AWS credentials if present.
const ssm = new SSMClient({
  region: process.env.AWS_REGION || "us-east-1",
});

async function getParameter(name) {
  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: true,
  });
  const response = await ssm.send(command);
  return response.Parameter && response.Parameter.Value;
}

/**
 * Load sensitive configuration values from SSM Parameter Store (encrypted by KMS)
 * into process.env. Falls back to existing process.env values if SSM is not
 * configured or access fails (so local .env continues to work).
 */
async function loadSecrets() {
  try {
    // Only fetch from SSM if env is not already set.
    if (!process.env.MONGODB_URI) {
      const uri = await getParameter("/idot/MONGODB_URI");
      if (uri) {
        process.env.MONGODB_URI = uri;
      }
    }

    if (!process.env.COOKIE_SECRET) {
      const cookieSecret = await getParameter("/idot/COOKIE_SECRET");
      if (cookieSecret) {
        process.env.COOKIE_SECRET = cookieSecret;
      }
    }
  } catch (err) {
    console.error("Failed to load secrets from SSM (falling back to existing env):", err.message);
  }
}

module.exports = { loadSecrets };






