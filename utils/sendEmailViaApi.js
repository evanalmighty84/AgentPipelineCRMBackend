const axios = require("axios");

const EMAIL_API_BASE =
    process.env.NODE_ENV === "production"
        ? "https://crm-function-app-5d4de511071d.herokuapp.com"
        : "http://localhost:5000";

module.exports = async function sendEmailViaApi(to, subject, html) {
    return axios.post(
        `${EMAIL_API_BASE}/server/agent_pipeline/api/agentpipelinecrm/send`,
        { to, subject, html },
        {
            timeout: 10_000,
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
};
